import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const DEMO_MODE = process.env.DEMO_MODE === 'true'
export const DEMO_EMAIL = process.env.DEMO_USER_EMAIL ?? 'demo@elevateos.org'
export const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD ?? 'demopassword123'
export const DEMO_NAME = process.env.DEMO_USER_NAME ?? 'ElevateOS Demo Student'
export const DEMO_ROLE: Role =
  process.env.DEMO_USER_ROLE === 'ADMIN' ? Role.ADMIN : Role.USER
export const DEMO_PLAN = process.env.DEMO_USER_PLAN ?? 'FREE'

export async function ensureDemoUser() {
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 12)
  return prisma.user.upsert({
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
}
