import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function asStringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : undefined
}

export async function PATCH(req: Request) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const id = asString(body.id)
  if (!id) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const result = await prisma.flashcard.updateMany({
    where: { id, userId: session.user.id },
    data: {
      front: asString(body.front) || undefined,
      back: asString(body.back) || undefined,
      deckId: asString(body.deckId) || undefined,
      tags: asStringList(body.tags),
      updatedAt: new Date(),
    },
  })

  if (!result.count) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: { nextUrl?: URL }) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = asString(req.nextUrl?.searchParams.get('id'))
  if (!id) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const result = await prisma.flashcard.deleteMany({
    where: { id, userId: session.user.id },
  })

  if (!result.count) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
