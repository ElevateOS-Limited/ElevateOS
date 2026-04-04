import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { DATABASE_URL_CONFIGURED } from '@/lib/prisma'
import { withServiceDbContext } from '@/lib/db/rls'

export const DEMO_MODE = process.env.DEMO_MODE === 'true'
export const DEMO_EMAIL = process.env.DEMO_USER_EMAIL ?? 'demo@elevateos.org'
export const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD ?? 'demopassword123'
export const DEMO_NAME = process.env.DEMO_USER_NAME ?? 'ElevateOS Demo Student'
const DEMO_ROLE_NAME = (process.env.DEMO_USER_ROLE ?? 'USER').toUpperCase()

export const DEMO_ROLE: Role =
  DEMO_ROLE_NAME in Role ? Role[DEMO_ROLE_NAME as keyof typeof Role] : Role.USER
export const DEMO_PLAN = process.env.DEMO_USER_PLAN ?? 'FREE'
export const DEMO_USER_ID = process.env.DEMO_USER_ID ?? 'demo-user'

export function buildDemoUser() {
  return {
    id: DEMO_USER_ID,
    email: DEMO_EMAIL,
    name: DEMO_NAME,
    role: DEMO_ROLE,
    plan: DEMO_PLAN,
    image: null,
    password: null,
  }
}

export async function ensureDemoUser() {
  if (!DATABASE_URL_CONFIGURED) {
    return buildDemoUser()
  }

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 12)
  return withServiceDbContext(async () =>
    prisma.user.upsert({
      where: { email: DEMO_EMAIL },
      update: {
        name: DEMO_NAME,
        role: DEMO_ROLE,
        plan: DEMO_PLAN,
        password: hashedPassword,
      },
      create: {
        email: DEMO_EMAIL,
        name: DEMO_NAME,
        role: DEMO_ROLE,
        plan: DEMO_PLAN,
        password: hashedPassword,
      },
    })
  )
}
