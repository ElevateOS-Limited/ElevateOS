import { NextResponse } from 'next/server'
import { getSessionOrDemo } from '@/lib/auth/session'
import { ACTIVITY_CATALOG } from '@/lib/activities'
import { DEMO_MODE } from '@/lib/auth/demo'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const isDemoMode = DEMO_MODE || process.env.DEMO_MODE === 'true' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

async function getPrisma() {
  const { prisma } = await import('@/lib/prisma')
  return prisma
}

type AvailabilityMap = Record<string, 'busy' | 'open'>

function normalizeTags(input: string[]) {
  return input.map((i) => i.toLowerCase().trim()).filter(Boolean)
}

export async function GET() {
  if (isDemoMode) {
    return NextResponse.json({
      ok: true,
      demo: true,
      openDays: ['Tuesday', 'Thursday', 'Saturday'],
      blockedDates: [],
      recommendations: ACTIVITY_CATALOG.slice(0, 6),
      availableSupport: ACTIVITY_CATALOG.map(({ title, supportBy, supportOffer, subscription }) => ({ title, supportBy, supportOffer, subscription })),
    })
  }

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

  const prisma = await getPrisma()

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
    .map((activity) => {
      const tagScore = activity.fitTags.reduce((acc, tag) => acc + (tags.some((t) => t.includes(tag) || tag.includes(t)) ? 1 : 0), 0)
      const dayScore = openDays.length ? activity.days.filter((d) => openDays.includes(d)).length : 0
      return { ...activity, score: tagScore * 2 + dayScore }
    })
    .sort((a, b) => b.score - a.score)

  return NextResponse.json({
    openDays,
    blockedDates,
    recommendations: scored.slice(0, 6),
    availableSupport: ACTIVITY_CATALOG.map(({ title, supportBy, supportOffer, subscription }) => ({ title, supportBy, supportOffer, subscription })),
  })
}
