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

  const result = await prisma.goal.updateMany({
    where: { id, userId: session.user.id },
    data: {
      title: asString(body.title) || undefined,
      description: asString(body.description) || undefined,
      status: asString(body.status) || undefined,
      updatedAt: new Date(),
    },
  })

  if (!result.count) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
