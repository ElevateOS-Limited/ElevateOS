import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { forbiddenResponse, hasRequiredRole } from '@/lib/auth/roles'

export async function GET() {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR', 'USER'])) return forbiddenResponse()

  const list = await prisma.feedback.findMany({
    where: { userId: session.user.id },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: 100,
  })
  return NextResponse.json(list)
}

export async function POST(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR', 'USER'])) return forbiddenResponse()

  let payload: { email?: unknown; category?: unknown; message?: unknown }
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json body' }, { status: 400 })
  }

  const { email, category, message } = payload
  if (message != null && typeof message !== 'string') {
    return NextResponse.json({ error: 'invalid message' }, { status: 400 })
  }

  if (typeof message === 'string' && message.length > 8000) {
    return NextResponse.json({ error: 'message too long' }, { status: 400 })
  }

  const trimmedMessage = typeof message === 'string' ? message.trim() : ''
  if (!trimmedMessage) return NextResponse.json({ error: 'message required' }, { status: 400 })

  const normalizedMessage = trimmedMessage.replace(/\s+/g, ' ')
  if (normalizedMessage.length > 2000) {
    return NextResponse.json({ error: 'message too long' }, { status: 400 })
  }

  if (email != null && typeof email !== 'string') {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }

  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
  if (normalizedEmail.length > 254) {
    return NextResponse.json({ error: 'email too long' }, { status: 400 })
  }
  if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }

  if (category != null && typeof category !== 'string') {
    return NextResponse.json({ error: 'invalid category' }, { status: 400 })
  }

  const normalizedCategoryRaw = typeof category === 'string' ? category.trim().toLowerCase() : ''
  if (normalizedCategoryRaw.length > 32) {
    return NextResponse.json({ error: 'invalid category' }, { status: 400 })
  }

  const allowedCategories = new Set(['general', 'bug', 'feature', 'billing', 'other'])
  const normalizedCategory = allowedCategories.has(normalizedCategoryRaw)
    ? normalizedCategoryRaw
    : 'general'

  const row = await prisma.feedback.create({
    data: {
      userId: session?.user?.id || null,
      email: normalizedEmail || null,
      category: normalizedCategory,
      message: normalizedMessage,
    },
  })
  return NextResponse.json(row)
}
