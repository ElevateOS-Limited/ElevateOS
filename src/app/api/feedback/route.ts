import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { forbiddenResponse, hasRequiredRole } from '@/lib/auth/roles'

const DEFAULT_FEEDBACK_LIST_LIMIT = 20
const MAX_FEEDBACK_LIST_LIMIT = 100
const FEEDBACK_LIMIT_MAX_DIGITS = 3
const INVALID_LIMIT_ERROR = { error: 'invalid limit' } as const
const FEEDBACK_LIMIT_DIGITS_REGEX = /^\d+$/
const FEEDBACK_LIMIT_LEADING_ZERO_REGEX = /^0+(?=\d)/
const FEEDBACK_LIMIT_QUERY_PARAM = 'limit'
const HTTP_BAD_REQUEST = 400
const FEEDBACK_LIMIT_MIN_VALUE = 1

function getSessionOrgId(session: Awaited<ReturnType<typeof getSessionOrDemo>>) {
  const orgId = (session?.user as { orgId?: string | null } | undefined)?.orgId
  return typeof orgId === 'string' && orgId.trim().length > 0 ? orgId : null
}

export async function GET(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR', 'USER'])) return forbiddenResponse()
  const orgId = getSessionOrgId(session)
  if (orgId) {
    // Feedback rows are user-scoped in current schema; orgId is derived server-side for tenant context.
  }

  const limitParam = req.nextUrl.searchParams.get(FEEDBACK_LIMIT_QUERY_PARAM)
  const normalizedLimitParam = typeof limitParam === 'string' ? limitParam.trim() : ''
  if (normalizedLimitParam && !FEEDBACK_LIMIT_DIGITS_REGEX.test(normalizedLimitParam)) {
    return NextResponse.json(INVALID_LIMIT_ERROR, { status: HTTP_BAD_REQUEST })
  }
  if (normalizedLimitParam.length > FEEDBACK_LIMIT_MAX_DIGITS) {
    return NextResponse.json(INVALID_LIMIT_ERROR, { status: HTTP_BAD_REQUEST })
  }
  const canonicalLimitParam = normalizedLimitParam.replace(FEEDBACK_LIMIT_LEADING_ZERO_REGEX, '')
  const parsedLimit = canonicalLimitParam ? Number(canonicalLimitParam) : DEFAULT_FEEDBACK_LIST_LIMIT
  if (!Number.isInteger(parsedLimit) || parsedLimit < FEEDBACK_LIMIT_MIN_VALUE) {
    return NextResponse.json(INVALID_LIMIT_ERROR, { status: HTTP_BAD_REQUEST })
  }
  const take = Math.min(parsedLimit, MAX_FEEDBACK_LIST_LIMIT)

  const list = await prisma.feedback.findMany({
    where: { userId: session.user.id, orgId: orgId ?? null },
    select: {
      id: true,
      category: true,
      message: true,
      createdAt: true,
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take,
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
  const orgId = getSessionOrgId(session)
  if (orgId) {
    // Feedback rows are user-scoped in current schema; orgId is derived server-side for tenant context.
  }

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
          .replace(/[\/_\s+.]+/g, '-')
          .replace(/&/g, '-and-')
          .replace(/[^a-z0-9-]/g, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
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

  const allowedCategories = new Set(['general', 'bug', 'feature', 'billing', 'other'])
  const categoryAliases: Record<string, string> = {
    'feature-request': 'feature',
    'feature-idea': 'feature',
    suggestion: 'feature',
    'bug-report': 'bug',
    'ui-bug': 'bug',
    'bug-issue': 'bug',
    bugfix: 'bug',
    defect: 'bug',
    technical: 'bug',
    support: 'general',
    help: 'general',
    question: 'general',
    complaint: 'general',
    'service-issue': 'general',
    'customer-care': 'general',
    'client-support': 'general',
    'billing-support': 'general',
    helpdesk: 'general',
    'tech-support': 'general',
    'technical-support': 'general',
    'product-support': 'general',
    'school-support': 'general',
    'academic-support': 'general',
    'curriculum-support': 'general',
    'learning-support': 'general',
    'class-support': 'general',
    'course-support': 'general',
    'education-support': 'general',
    'teacher-support': 'general',
    'parent-teacher-support': 'general',
    'pta-support': 'general',
    'school-home-support': 'general',
    'homeroom-support': 'general',
    'student-support': 'general',
    'learner-support': 'general',
    'family-support': 'general',
    'parent-support': 'general',
    'guardian-support': 'general',
    'caregiver-support': 'general',
    'home-support': 'general',
    'household-support': 'general',
    'domestic-support': 'general',
    'customer-service': 'general',
    account: 'billing',
    payment: 'billing',
    'payment-issue': 'billing',
    invoice: 'billing',
    'billing-issue': 'billing',
    'billing-help': 'billing',
    refund: 'billing',
    'general-support': 'general',
  }

  const normalizedCategoryCandidate = categoryAliases[normalizedCategoryRaw] || normalizedCategoryRaw
  if (normalizedCategoryCandidate && !allowedCategories.has(normalizedCategoryCandidate)) {
    return NextResponse.json({ error: 'invalid category' }, { status: 400 })
  }
  const normalizedCategory = normalizedCategoryCandidate || 'general'

  const row = await prisma.feedback.create({
    data: {
      orgId: orgId ?? null,
      userId: session.user.id,
      email: normalizedEmail || null,
      category: normalizedCategory,
      message: normalizedMessage,
    },
    select: {
      id: true,
      category: true,
      message: true,
      createdAt: true,
    },
  })
  return NextResponse.json(row)
}
