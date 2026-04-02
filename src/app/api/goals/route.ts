import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { writeAuditLog } from '@/lib/audit'

export async function GET() {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const goals = await prisma.goal.findMany({ where: { userId: session.user.id }, include: { deadlines: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(goals)
}

export async function POST(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { title, description, targetDate } = await req.json()
  const goal = await prisma.goal.create({ data: { userId: session.user.id, title, description, targetDate: targetDate ? new Date(targetDate) : null } })
  await writeAuditLog({
    actorUserId: session.user.id,
    resourceType: 'goal',
    resourceId: goal.id,
    action: 'create',
    result: 'success',
  })
  return NextResponse.json(goal)
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, title, description, status, targetDate } = await req.json()
  const updateResult = await prisma.goal.updateMany({
    where: { id, userId: session.user.id },
    data: { title, description, status, targetDate: targetDate ? new Date(targetDate) : null },
  })
  if (updateResult.count === 0) {
    await writeAuditLog({
      actorUserId: session.user.id,
      resourceType: 'goal',
      resourceId: id,
      action: 'update',
      result: 'forbidden',
    })
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const goal = await prisma.goal.findFirst({ where: { id, userId: session.user.id } })
  await writeAuditLog({
    actorUserId: session.user.id,
    resourceType: 'goal',
    resourceId: id,
    action: 'update',
    result: 'success',
  })
  return NextResponse.json(goal)
}
