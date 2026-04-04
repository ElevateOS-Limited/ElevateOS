import { PrismaClient, type Prisma } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { getDbContext, type DbAccessContext } from '@/lib/db/rls'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const DATABASE_URL_CONFIGURED = Boolean(process.env.DATABASE_URL?.trim())

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL?.trim()
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to initialize PrismaClient')
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }

  return globalForPrisma.prisma
}

async function applyDbContext(client: Pick<Prisma.TransactionClient, '$executeRaw'>, context: DbAccessContext) {
  const authMode = context.mode
  const userId = context.userId?.trim() || ''
  const orgId = context.orgId?.trim() || ''
  const role = context.role?.trim() || ''
  const plan = context.plan?.trim() || ''

  await client.$executeRaw`select set_config('app.auth_mode', ${authMode}, true)`
  await client.$executeRaw`select set_config('app.user_id', ${userId}, true)`
  await client.$executeRaw`select set_config('app.org_id', ${orgId}, true)`
  await client.$executeRaw`select set_config('app.user_role', ${role}, true)`
  await client.$executeRaw`select set_config('app.user_plan', ${plan}, true)`
}

async function runWithContext<T>(operation: (client: Prisma.TransactionClient) => Promise<T>) {
  const context = getDbContext()
  if (!context) {
    throw new Error(
      'Database context is not set. Call getSessionOrDemo() for user requests or withServiceDbContext() for service-only database access.',
    )
  }

  const client = getPrismaClient()
  return client.$transaction(async (tx) => {
    await applyDbContext(tx, context)
    return operation(tx)
  })
}

const delegateProxyCache = new Map<string, any>()

function getDelegateProxy(delegateName: string) {
  const cached = delegateProxyCache.get(delegateName)
  if (cached) return cached

  const client = getPrismaClient()
  const delegate = Reflect.get(client, delegateName) as Record<string, unknown>
  const proxy = new Proxy(delegate, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver)
      if (typeof value !== 'function') return value

      return (...args: unknown[]) =>
        runWithContext(async (tx) => {
          const txDelegate = Reflect.get(tx, delegateName) as Record<string, unknown>
          const txMethod = Reflect.get(txDelegate, prop) as (...methodArgs: unknown[]) => Promise<unknown>
          if (typeof txMethod !== 'function') {
            throw new Error(`Unsupported Prisma method: ${delegateName}.${String(prop)}`)
          }
          return txMethod.apply(txDelegate, args)
        })
    },
  })

  delegateProxyCache.set(delegateName, proxy)
  return proxy
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient()
    const value = Reflect.get(client, prop, receiver)

    if (typeof prop === 'string' && prop === '$transaction') {
      return async (...args: unknown[]) => {
        const context = getDbContext()
        if (!context) {
          throw new Error(
            'Database context is not set. Call getSessionOrDemo() for user requests or withServiceDbContext() for service-only database access.',
          )
        }

        if (typeof args[0] !== 'function') {
          throw new Error('Use the callback form of prisma.$transaction when database RLS is enabled.')
        }

        const callback = args[0] as (tx: Prisma.TransactionClient) => Promise<unknown> | unknown
        const options = args[1] as Parameters<PrismaClient['$transaction']>[1]

        return client.$transaction(
          async (tx) => {
            await applyDbContext(tx, context)
            return callback(tx)
          },
          options,
        )
      }
    }

    if (typeof prop === 'string' && ['$connect', '$disconnect', '$on', '$use', '$extends'].includes(prop)) {
      return typeof value === 'function' ? value.bind(client) : value
    }

    if (typeof value === 'function') {
      return (...args: unknown[]) => runWithContext(async (tx) => (Reflect.get(tx, prop, tx) as (...methodArgs: unknown[]) => unknown).apply(tx, args))
    }

    if (typeof value === 'object' && value !== null) {
      return getDelegateProxy(String(prop))
    }

    return value
  },
})

if (process.env.NODE_ENV !== 'production' && globalForPrisma.prisma) {
  globalForPrisma.prisma = globalForPrisma.prisma
}
