import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

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

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient()
    const value = Reflect.get(client, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})

if (process.env.NODE_ENV !== 'production' && globalForPrisma.prisma) {
  globalForPrisma.prisma = globalForPrisma.prisma
}
