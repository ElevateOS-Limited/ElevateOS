import type { Session } from 'next-auth'
import { prisma, DATABASE_URL_CONFIGURED } from '@/lib/prisma'
import { withServiceDbContext } from '@/lib/db/rls'

export type CanonicalSessionUser = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string
  plan: string
  orgId: string
}

export async function loadCanonicalSessionUser(userId: string): Promise<CanonicalSessionUser | null> {
  const trimmedUserId = userId.trim()
  if (!trimmedUserId || !DATABASE_URL_CONFIGURED) return null

  return withServiceDbContext(async () => {
    const user = await prisma.user.findUnique({
      where: { id: trimmedUserId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        plan: true,
      },
    })

    if (!user) return null

    return {
      id: user.id,
      name: user.name ?? null,
      email: user.email ?? null,
      image: user.image ?? null,
      role: user.role,
      plan: user.plan,
      orgId: user.id,
    }
  })
}

export async function hydrateSessionUser(session: Session | null): Promise<Session | null> {
  if (!session?.user?.id) return session

  const canonical = await loadCanonicalSessionUser(session.user.id)
  if (!canonical) {
    session.user.orgId = session.user.orgId?.trim() || session.user.id
    return session
  }

  session.user.id = canonical.id
  session.user.name = canonical.name ?? session.user.name ?? null
  session.user.email = canonical.email ?? session.user.email ?? null
  session.user.image = canonical.image ?? session.user.image ?? null
  session.user.role = canonical.role
  session.user.plan = canonical.plan
  session.user.orgId = canonical.orgId
  return session
}
