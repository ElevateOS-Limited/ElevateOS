import 'server-only'
import { AsyncLocalStorage } from 'node:async_hooks'

export type DbAccessMode = 'service' | 'user'

export type DbAccessContext = {
  mode: DbAccessMode
  userId?: string | null
  orgId?: string | null
  role?: string | null
  plan?: string | null
}

const dbAccessStorage = new AsyncLocalStorage<DbAccessContext>()

export function getDbContext() {
  return dbAccessStorage.getStore() ?? null
}

export function enterDbContext(context: DbAccessContext) {
  dbAccessStorage.enterWith(context)
}

export async function withDbContext<T>(context: DbAccessContext, callback: () => Promise<T> | T) {
  return dbAccessStorage.run(context, callback)
}

export async function withServiceDbContext<T>(callback: () => Promise<T> | T) {
  return withDbContext({ mode: 'service' }, callback)
}

export function buildDbContextFromSessionUser(user: {
  id: string
  orgId?: string | null
  role?: string | null
  plan?: string | null
}) {
  return {
    mode: 'user' as const,
    userId: user.id,
    orgId: user.orgId?.trim() || user.id,
    role: user.role ?? null,
    plan: user.plan ?? null,
  }
}
