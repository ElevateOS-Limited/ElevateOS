import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { writeAuditLog } from '@/lib/audit'

export async function GET() {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const deadlines = await prisma.deadline.findMany({ where: { userId: session.user.id }, orderBy: { dueAt: 'asc' } })
  return NextResponse.json(deadlines)
}

export async function POST(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { title, dueAt, priority, goalId } = await req.json()
  const item = await prisma.deadline.create({ data: { userId: session.user.id, title, dueAt: new Date(dueAt), priority: priority || 'medium', goalId: goalId || null } })
  await writeAuditLog({
    actorUserId: session.user.id,
    resourceType: 'deadline',
    resourceId: item.id,
    action: 'create',
    result: 'success',
  })
  return NextResponse.json(item)
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, completed } = await req.json()
  const updateResult = await prisma.deadline.updateMany({
    where: { id, userId: session.user.id },
    data: { completed: Boolean(completed) },
  })
  if (updateResult.count === 0) {
    await writeAuditLog({
      actorUserId: session.user.id,
      resourceType: 'deadline',
      resourceId: id,
      action: 'update',
      result: 'forbidden',
    })
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const item = await prisma.deadline.findFirst({ where: { id, userId: session.user.id } })
  await writeAuditLog({
    actorUserId: session.user.id,
    resourceType: 'deadline',
    resourceId: id,
    action: 'update',
    result: 'success',
  })
  return NextResponse.json(item)
}
