import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { ACTIVITY_CATALOG } from '@/lib/activities'
import { DEMO_MODE } from '@/lib/auth/demo'

type AvailabilityMap = Record<string, 'busy' | 'open'>

function normalizeTags(input: string[]) {
  return input.map((i) => i.toLowerCase().trim()).filter(Boolean)
}

export async function GET(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let user: {
    plan: string
    intendedMajor: string | null
    careerInterests: string[]
    customPreferences: string | null
    weeklyAvailability: unknown
    goals: unknown
  } | null = null

  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        plan: true,
        intendedMajor: true,
        careerInterests: true,
        customPreferences: true,
        weeklyAvailability: true,
        goals: true,
      },
    })
  } catch {
    // Graceful fallback when DB/SSL connectivity is temporarily broken.
    // We still return recommendations so the activities page remains usable.
  }

  if (!user) {
    user = {
      plan: 'FREE',
      intendedMajor: null,
      careerInterests: [],
      customPreferences: null,
      weeklyAvailability: {},
      goals: [],
    }
  }

  const params = req.nextUrl.searchParams
  const requestedLimit = Number(params.get('limit') ?? '6')
  const requestedMinScore = Number(params.get('minScore') ?? '0')
  const supportBy = (params.get('supportBy') ?? '').trim().toLowerCase()
  const category = (params.get('category') ?? '').trim().toLowerCase()
  const sortBy = (params.get('sortBy') ?? 'score').trim().toLowerCase()
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 12) : 6
  const minScore = Number.isFinite(requestedMinScore) ? Math.max(Math.trunc(requestedMinScore), 0) : 0
  const appliedFilterCount = [minScore > 0, Boolean(supportBy), Boolean(category), limit !== 6].filter(Boolean).length

  const rawAvailability = (user.weeklyAvailability as any) ?? {}
  const availability = (rawAvailability?.weekly && typeof rawAvailability.weekly === 'object'
    ? rawAvailability.weekly
    : rawAvailability) as AvailabilityMap
  const blockedDates = Array.isArray(rawAvailability?.blockedDates) ? rawAvailability.blockedDates : []
  const derivedOpenDays = Object.entries(availability)
    .filter(([, status]) => status === 'open')
    .map(([day]) => day)
  const openDays = derivedOpenDays.length ? derivedOpenDays : ['Tuesday', 'Thursday', 'Saturday']

  const tags = normalizeTags([
    ...(user.careerInterests ?? []),
    ...(Array.isArray(user.goals) ? user.goals.map((g: any) => g?.title ?? '') : []),
    user.intendedMajor ?? 'computer science',
    user.customPreferences ?? 'community impact and top university admissions',
    'top university',
  ])

  const effectivePlan = DEMO_MODE ? 'ELITE' : user.plan

  const scored = ACTIVITY_CATALOG
    .filter((a) => (effectivePlan === 'FREE' ? a.subscription === 'FREE' : effectivePlan === 'PRO' ? a.subscription !== 'ELITE' : true))
    .filter((a) => (supportBy ? a.supportBy.toLowerCase().includes(supportBy) : true))
    .filter((a) => (category ? a.category.toLowerCase() === category : true))
    .map((activity) => {
      const tagScore = activity.fitTags.reduce((acc, tag) => acc + (tags.some((t) => t.includes(tag) || tag.includes(t)) ? 1 : 0), 0)
      const dayScore = openDays.length ? activity.days.filter((d) => openDays.includes(d)).length : 0
      return { ...activity, score: tagScore * 2 + dayScore }
    })
    .filter((activity) => activity.score >= minScore)

  const sorted = [...scored].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title)
    return b.score - a.score
  })

  const recommendations = sorted.slice(0, limit)

  const isEmptyResult = recommendations.length === 0
  const emptyStateHint = isEmptyResult
    ? (appliedFilterCount > 0
      ? 'No matches yet — try lowering minimum fit score, removing one filter, or increasing result count.'
      : 'No recommendations available right now. Add profile goals/interests or expand open days to improve matching.')
    : null

  return NextResponse.json({
    openDays,
    blockedDates,
    filters: { limit, minScore, supportBy: supportBy || null, category: category || null, sortBy },
    meta: {
      totalCatalog: ACTIVITY_CATALOG.length,
      matchedCount: scored.length,
      returnedCount: recommendations.length,
      appliedFilterCount,
      hasActiveFilters: appliedFilterCount > 0,
      isEmptyResult,
      emptyStateHint,
    },
    recommendations,
    availableSupport: ACTIVITY_CATALOG.map(({ title, supportBy, supportOffer, subscription }) => ({ title, supportBy, supportOffer, subscription })),
  })
}
