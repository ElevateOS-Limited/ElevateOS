import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionOrDemo } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { getRoleHomePath } from '@/lib/auth/routes'

// Roles a user may self-select during onboarding.
// ADMIN / OWNER are never self-assignable.
const selfSelectableRoles = ['STUDENT', 'PARENT', 'TUTOR'] as const
type SelfSelectableRole = (typeof selfSelectableRoles)[number]

const selfRoleSchema = z.object({
  role: z.enum(selfSelectableRoles),
})

async function ensureProfileForRole(userId: string, role: SelfSelectableRole) {
  switch (role) {
    case 'STUDENT':
      await prisma.studentProfile.upsert({
        where: { userId },
        update: {},
        create: { userId },
      })
      break
    case 'TUTOR':
      await prisma.tutorProfile.upsert({
        where: { userId },
        update: {},
        create: { userId },
      })
      break
    case 'PARENT':
      await prisma.parentProfile.upsert({
        where: { userId },
        update: {},
        create: { userId },
      })
      break
  }
}

export async function PATCH(request: Request) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { role: SelfSelectableRole }
  try {
    body = selfRoleSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { role: body.role },
    select: { id: true, role: true },
  })

  await ensureProfileForRole(user.id, body.role)

  return NextResponse.json({
    role: user.role,
    redirectTo: getRoleHomePath(user.role),
  })
}
