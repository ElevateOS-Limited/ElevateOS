import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { forbiddenResponse, hasRequiredRole } from '@/lib/auth/roles'
import { withOrgScope } from '@/lib/db/org-scope'

const patchSchema = z.object({
  title: z.string().min(2).optional(),
  providerName: z.string().optional(),
  description: z.string().min(10).optional(),
  category: z.string().min(2).optional(),
  mode: z.enum(['online', 'hybrid', 'in_person']).optional(),
  region: z.string().optional(),
  eligibility: z.any().optional(),
  costMin: z.number().optional(),
  costMax: z.number().optional(),
  currency: z.string().optional(),
  hoursPerWeekMin: z.number().int().optional(),
  hoursPerWeekMax: z.number().int().optional(),
  durationWeeks: z.number().int().optional(),
  deadlineAt: z.string().datetime().nullable().optional(),
  sourceType: z.enum(['manual', 'partner', 'feed']).optional(),
  sourceUrl: z.string().url().optional(),
  status: z.enum(['needs_review', 'active', 'archived', 'expired']).optional(),
  verified: z.boolean().optional(),
})

function getSessionOrgId(session: Awaited<ReturnType<typeof getSessionOrDemo>>): string | null {
  const orgId = (session?.user as { orgId?: string | null } | undefined)?.orgId
  return typeof orgId === 'string' && orgId.trim().length > 0 ? orgId : null
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR', 'PARENT', 'STUDENT', 'USER'])) return forbiddenResponse()

  const canManage = hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR'])
  const orgId = getSessionOrgId(session)

  const item = await prisma.activityOpportunity.findFirst({
    where: withOrgScope(orgId, { id: params.id }),
    include: {
      tags: true,
      evidenceTemplates: true,
      ...(canManage ? { reviewLogs: { orderBy: { createdAt: 'desc' }, take: 20 } } : {}),
    },
  })

  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!canManage && item.createdByUserId !== session.user.id && item.status !== 'active') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(item)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR', 'USER'])) return forbiddenResponse()

  const canManage = hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR'])
  const orgId = getSessionOrgId(session)

  const parsed = patchSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const body = parsed.data
  if (!canManage && (body.status !== undefined || body.verified !== undefined)) {
    return forbiddenResponse()
  }

  const scopedWhere = canManage
    ? withOrgScope(orgId, { id: params.id })
    : withOrgScope(orgId, { id: params.id, createdByUserId: session.user.id })

  const existing = await prisma.activityOpportunity.findFirst({
    where: scopedWhere,
    select: { id: true },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.activityOpportunity.update({
    where: { id: existing.id },
    data: {
      title: body.title,
      providerName: body.providerName,
      description: body.description,
      category: body.category,
      mode: body.mode,
      region: body.region,
      eligibility: body.eligibility,
      costMin: body.costMin,
      costMax: body.costMax,
      currency: body.currency,
      hoursPerWeekMin: body.hoursPerWeekMin,
      hoursPerWeekMax: body.hoursPerWeekMax,
      durationWeeks: body.durationWeeks,
      deadlineAt: body.deadlineAt === undefined ? undefined : body.deadlineAt === null ? null : new Date(body.deadlineAt),
      sourceType: body.sourceType,
      sourceUrl: body.sourceUrl,
      status: canManage ? body.status : undefined,
      verifiedAt: canManage && body.verified ? new Date() : undefined,
      reviewLogs: {
        create: {
          reviewerId: session.user.id,
          action: 'updated',
          notes: `Updated fields: ${Object.keys(body).join(', ')}`,
        },
      },
    },
    include: { tags: true, reviewLogs: true },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR', 'USER'])) return forbiddenResponse()

  const canManage = hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR'])
  const orgId = getSessionOrgId(session)
  const scopedWhere = canManage
    ? withOrgScope(orgId, { id: params.id })
    : withOrgScope(orgId, { id: params.id, createdByUserId: session.user.id })

  const existing = await prisma.activityOpportunity.findFirst({
    where: scopedWhere,
    select: { id: true },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.activityOpportunity.update({
    where: { id: existing.id },
    data: {
      status: 'archived',
      reviewLogs: {
        create: {
          reviewerId: session.user.id,
          action: 'archived',
          notes: 'Archived via API',
        },
      },
    },
  })

  return NextResponse.json({ ok: true })
}
