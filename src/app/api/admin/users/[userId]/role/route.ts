import { NextResponse } from 'next/server'
import { getSessionOrDemo } from '@/lib/auth/session'
import { forbiddenResponse, hasRequiredRole } from '@/lib/auth/roles'
import { prisma } from '@/lib/prisma'
import { userRoleUpdateSchema } from '@/lib/tutoring/contracts'

type RouteParams = {
  params: Promise<{ userId: string }>
}

async function ensureProfileForRole(userId: string, role: string) {
  switch (role) {
    case 'STUDENT':
    case 'USER':
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
    default:
      break
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN'])) return forbiddenResponse()

  const { userId } = await params

  try {
    const body = userRoleUpdateSchema.parse({
      ...((await request.json()) as Record<string, unknown>),
      userId,
    })

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        role: body.role,
        plan: body.plan || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
      },
    })

    await ensureProfileForRole(user.id, body.role)

    return NextResponse.json({ user })
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      const issues = (error as { issues?: Array<{ message?: string }> }).issues
      return NextResponse.json({ error: issues?.[0]?.message || 'Invalid user payload' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Unable to update user' }, { status: 500 })
  }
}
