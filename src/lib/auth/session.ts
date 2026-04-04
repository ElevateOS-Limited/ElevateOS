import type { Session } from 'next-auth'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { ensureDemoUser, DEMO_MODE, DEMO_PLAN } from '@/lib/auth/demo'
import { buildDbContextFromSessionUser, enterDbContext } from '@/lib/db/rls'

async function buildDemoSession(): Promise<Session> {
  const demoUser = await ensureDemoUser()

  return {
    user: {
      id: demoUser.id,
      name: demoUser.name ?? 'Demo Student',
      email: demoUser.email,
      role: demoUser.role,
      plan: demoUser.plan ?? DEMO_PLAN,
      orgId: demoUser.id,
      image: demoUser.image ?? null,
    },
    expires: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
  }
}

export async function getSessionOrDemo(): Promise<Session | null> {
  const session = await getServerSession(authOptions)
  if (session?.user?.id) {
    session.user.orgId = session.user.orgId?.trim() || session.user.id
    enterDbContext(buildDbContextFromSessionUser(session.user))
    return session
  }
  if (!DEMO_MODE) return null
  const demoSession = await buildDemoSession()
  enterDbContext(buildDbContextFromSessionUser(demoSession.user))
  return demoSession
}
