import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { writeAuditLog } from '@/lib/audit'

export async function GET(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const deckId = req.nextUrl.searchParams.get('deckId') || undefined

  const cards = await prisma.flashcard.findMany({
    where: { userId: session.user.id, ...(deckId ? { deckId } : {}) },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json(cards)
}

export async function POST(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { deckId, front, back, tags } = await req.json()
  if (!deckId || !front || !back) {
    return NextResponse.json({ error: 'deckId, front, back required' }, { status: 400 })
  }

  const deck = await prisma.flashcardDeck.findFirst({
    where: { id: deckId, userId: session.user.id },
    select: { id: true },
  })
  if (!deck) {
    await writeAuditLog({
      actorUserId: session.user.id,
      resourceType: 'flashcard',
      resourceId: String(deckId),
      action: 'create',
      result: 'forbidden',
      details: { reason: 'deck_not_owned' },
    })
    return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
  }

  const card = await prisma.flashcard.create({
    data: {
      deckId,
      userId: session.user.id,
      front,
      back,
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
    },
  })

  await prisma.flashcardReview.upsert({
    where: { cardId_userId: { cardId: card.id, userId: session.user.id } },
    create: { cardId: card.id, userId: session.user.id },
    update: {},
  })

  await writeAuditLog({
    actorUserId: session.user.id,
    resourceType: 'flashcard',
    resourceId: card.id,
    action: 'create',
    result: 'success',
  })
  return NextResponse.json(card)
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, front, back, tags } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const updateResult = await prisma.flashcard.updateMany({
    where: { id, userId: session.user.id },
    data: {
      ...(front !== undefined ? { front } : {}),
      ...(back !== undefined ? { back } : {}),
      ...(Array.isArray(tags) ? { tags: tags.filter(Boolean) } : {}),
    },
  })
  if (updateResult.count === 0) {
    await writeAuditLog({
      actorUserId: session.user.id,
      resourceType: 'flashcard',
      resourceId: id,
      action: 'update',
      result: 'forbidden',
    })
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const card = await prisma.flashcard.findFirst({ where: { id, userId: session.user.id } })
  await writeAuditLog({
    actorUserId: session.user.id,
    resourceType: 'flashcard',
    resourceId: id,
    action: 'update',
    result: 'success',
  })
  return NextResponse.json(card)
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const deleteResult = await prisma.flashcard.deleteMany({ where: { id, userId: session.user.id } })
  if (deleteResult.count === 0) {
    await writeAuditLog({
      actorUserId: session.user.id,
      resourceType: 'flashcard',
      resourceId: id,
      action: 'delete',
      result: 'forbidden',
    })
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  await writeAuditLog({
    actorUserId: session.user.id,
    resourceType: 'flashcard',
    resourceId: id,
    action: 'delete',
    result: 'success',
  })
  return NextResponse.json({ ok: true })
}
