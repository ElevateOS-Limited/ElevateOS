import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function PATCH(req: Request) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const id = asString(body.id)
  if (!id) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const dueAt = asString(body.dueAt)
  const result = await prisma.deadline.updateMany({
    where: { id, userId: session.user.id },
    data: {
      title: asString(body.title) || undefined,
      priority: asString(body.priority) || undefined,
      completed: typeof body.completed === 'boolean' ? body.completed : undefined,
      dueAt: dueAt ? new Date(dueAt) : undefined,
      updatedAt: new Date(),
    },
  })

  if (!result.count) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
