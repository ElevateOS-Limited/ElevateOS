import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { forbiddenResponse, hasRequiredRole } from '@/lib/auth/roles'
import { withOrgScope } from '@/lib/db/org-scope'

const createSchema = z.object({
  title: z.string().min(2),
  providerName: z.string().optional(),
  description: z.string().min(10),
  category: z.string().min(2),
  mode: z.enum(['online', 'hybrid', 'in_person']).default('online'),
  region: z.string().optional(),
  eligibility: z.any().optional(),
  costMin: z.number().optional(),
  costMax: z.number().optional(),
  currency: z.string().optional(),
  hoursPerWeekMin: z.number().int().optional(),
  hoursPerWeekMax: z.number().int().optional(),
  durationWeeks: z.number().int().optional(),
  deadlineAt: z.string().datetime().optional(),
  sourceType: z.enum(['manual', 'partner', 'feed']).default('manual'),
  sourceUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
})

function getSessionOrgId(session: Awaited<ReturnType<typeof getSessionOrDemo>>): string | null {
  const orgId = (session?.user as { orgId?: string | null } | undefined)?.orgId
  if (typeof orgId === 'string' && orgId.trim().length > 0) return orgId
  const userId = session?.user?.id
  return typeof userId === 'string' && userId.trim().length > 0 ? userId : null
}

export async function GET(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR', 'PARENT', 'STUDENT', 'USER'])) return forbiddenResponse()

  const canManage = hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR'])
  const orgId = getSessionOrgId(session)
  const requestedStatus = req.nextUrl.searchParams.get('status') || 'active'
  const status = canManage ? requestedStatus : 'active'
  const category = req.nextUrl.searchParams.get('category') || undefined
  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') || 50), 200)

  const items = await prisma.activityOpportunity.findMany({
    where: withOrgScope(orgId, {
      status,
      ...(category ? { category } : {}),
    }),
    include: {
      tags: true,
      evidenceTemplates: true,
    },
    orderBy: [{ verifiedAt: 'desc' }, { updatedAt: 'desc' }],
    take: limit,
  })

  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR', 'USER'])) return forbiddenResponse()

  const parsed = createSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const orgId = getSessionOrgId(session)
  const item = await prisma.activityOpportunity.create({
    data: {
      orgId,
      createdByUserId: session.user.id,
      title: data.title,
      providerName: data.providerName,
      description: data.description,
      category: data.category,
      mode: data.mode,
      region: data.region,
      eligibility: data.eligibility,
      costMin: data.costMin,
      costMax: data.costMax,
      currency: data.currency,
      hoursPerWeekMin: data.hoursPerWeekMin,
      hoursPerWeekMax: data.hoursPerWeekMax,
      durationWeeks: data.durationWeeks,
      deadlineAt: data.deadlineAt ? new Date(data.deadlineAt) : null,
      sourceType: data.sourceType,
      sourceUrl: data.sourceUrl,
      status: 'needs_review',
      tags: {
        create: data.tags.map((tag) => ({ tag: tag.trim().toLowerCase() })).filter((t) => t.tag.length > 0),
      },
      reviewLogs: {
        create: {
          reviewerId: session.user.id,
          action: 'created',
          notes: 'Initial activity submission created via API',
        },
      },
    },
    include: { tags: true, reviewLogs: true },
  })

  return NextResponse.json(item, { status: 201 })
}
