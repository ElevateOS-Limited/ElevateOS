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
  const contentType = req.headers.get('content-type') || ''
  const normalizedContentType = contentType.trim().toLowerCase()
  if (!/^application\/json(?:\s*;|$)/.test(normalizedContentType)) {
    return NextResponse.json({ error: 'content-type must be application/json' }, { status: 415 })
  }

  const contentLengthHeader = req.headers.get('content-length')
  if (contentLengthHeader && !/^\d+$/.test(contentLengthHeader)) {
    return NextResponse.json({ error: 'invalid content-length' }, { status: 400 })
  }
  if (contentLengthHeader && contentLengthHeader.length > 7) {
    return NextResponse.json({ error: 'payload too large' }, { status: 413 })
  }
  const contentLength = contentLengthHeader ? Number(contentLengthHeader) : 0
  if (
    contentLengthHeader &&
    (!Number.isFinite(contentLength) || !Number.isInteger(contentLength) || contentLength < 0)
  ) {
    return NextResponse.json({ error: 'invalid content-length' }, { status: 400 })
  }
  if (Number.isFinite(contentLength) && contentLength > 12_000) {
    return NextResponse.json({ error: 'payload too large' }, { status: 413 })
  }

  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR', 'USER'])) return forbiddenResponse()

  let payload: { email?: unknown; category?: unknown; message?: unknown }
  try {
    const parsed = await req.json()
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return NextResponse.json({ error: 'invalid json body' }, { status: 400 })
    }
    payload = parsed as { email?: unknown; category?: unknown; message?: unknown }
  } catch {
    return NextResponse.json({ error: 'invalid json body' }, { status: 400 })
  }

  const allowedKeys = new Set(['email', 'category', 'message'])
  const payloadKeys = Object.keys(payload)
  if (payloadKeys.some((key) => !allowedKeys.has(key))) {
    return NextResponse.json({ error: 'unexpected field' }, { status: 400 })
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

  if (/[\u0000-\u001F\u007F]/.test(trimmedMessage) || trimmedMessage.includes('\uFFFD')) {
    return NextResponse.json({ error: 'invalid message' }, { status: 400 })
  }

  const normalizedMessage = trimmedMessage.replace(/\s+/g, ' ')
  if (normalizedMessage.length > 2000) {
    return NextResponse.json({ error: 'message too long' }, { status: 400 })
  }
  if (/[\u200B-\u200D\u2060\uFEFF]/.test(normalizedMessage)) {
    return NextResponse.json({ error: 'invalid message' }, { status: 400 })
  }

  if (email != null && typeof email !== 'string') {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }

  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
  if (email != null && !normalizedEmail) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }
  if (/[\u0000-\u001F\u007F]/.test(normalizedEmail) || normalizedEmail.includes('\uFFFD')) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }
  if (normalizedEmail.length > 254) {
    return NextResponse.json({ error: 'email too long' }, { status: 400 })
  }
  if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }
  if (normalizedEmail.includes('..')) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }
  if (normalizedEmail) {
    const atIndex = normalizedEmail.lastIndexOf('@')
    const localPart = normalizedEmail.slice(0, atIndex)
    const domainPart = normalizedEmail.slice(atIndex + 1)

    if (
      localPart.startsWith('.') ||
      localPart.endsWith('.') ||
      domainPart.startsWith('.') ||
      domainPart.endsWith('.')
    ) {
      return NextResponse.json({ error: 'invalid email' }, { status: 400 })
    }

    const domainLabels = domainPart.split('.')
    if (domainLabels.some((label) => !label || label.startsWith('-') || label.endsWith('-'))) {
      return NextResponse.json({ error: 'invalid email' }, { status: 400 })
    }
  }

  if (category != null && typeof category !== 'string') {
    return NextResponse.json({ error: 'invalid category' }, { status: 400 })
  }

  const normalizedCategoryRaw =
    typeof category === 'string'
      ? category
          .trim()
          .toLowerCase()
          .replace(/[_\s]+/g, '-')
      : ''
  if (category != null && !normalizedCategoryRaw) {
    return NextResponse.json({ error: 'invalid category' }, { status: 400 })
  }
  if (/[\u0000-\u001F\u007F]/.test(normalizedCategoryRaw) || normalizedCategoryRaw.includes('\uFFFD')) {
    return NextResponse.json({ error: 'invalid category' }, { status: 400 })
  }
  if (/[\u200B-\u200D\u2060\uFEFF]/.test(normalizedCategoryRaw)) {
    return NextResponse.json({ error: 'invalid category' }, { status: 400 })
  }
  if (normalizedCategoryRaw.length > 32) {
    return NextResponse.json({ error: 'invalid category' }, { status: 400 })
  }

  const categoryAliases: Record<string, string> = {
    'feature-request': 'feature',
    'feature-idea': 'feature',
    'bug-report': 'bug',
    defect: 'bug',
    support: 'general',
    help: 'general',
    account: 'billing',
    payment: 'billing',
    'payment-issue': 'billing',
    invoice: 'billing',
    'billing-issue': 'billing',
    refund: 'billing',
    question: 'general',
  }
  const normalizedCategoryCandidate = categoryAliases[normalizedCategoryRaw] || normalizedCategoryRaw

  const allowedCategories = new Set(['general', 'bug', 'feature', 'billing', 'other'])
  const categoryFallbacks: Record<string, string> = {
    technical: 'bug',
    'tech-support': 'bug',
    suggestion: 'feature',
    complaint: 'general',
    'customer-service': 'general',
  }
  const normalizedCategoryResolved =
    normalizedCategoryCandidate && !allowedCategories.has(normalizedCategoryCandidate)
      ? (categoryFallbacks[normalizedCategoryCandidate] || normalizedCategoryCandidate)
      : normalizedCategoryCandidate

  if (normalizedCategoryResolved && !allowedCategories.has(normalizedCategoryResolved)) {
    return NextResponse.json({ error: 'invalid category' }, { status: 400 })
  }
  const normalizedCategory = normalizedCategoryResolved || 'general'

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
