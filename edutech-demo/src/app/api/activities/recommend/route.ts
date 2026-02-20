import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { ACTIVITY_CATALOG } from '@/lib/activities'

type AvailabilityMap = Record<string, 'busy' | 'open'>

function normalizeTags(input: string[]) {
  return input.map((i) => i.toLowerCase().trim()).filter(Boolean)
}

export async function GET() {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
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

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const availability = (user.weeklyAvailability as AvailabilityMap | null) ?? {}
  const openDays = Object.entries(availability)
    .filter(([, status]) => status === 'open')
    .map(([day]) => day)

  const tags = normalizeTags([
    ...(user.careerInterests ?? []),
    ...(Array.isArray(user.goals) ? user.goals.map((g: any) => g?.title ?? '') : []),
    user.intendedMajor ?? '',
    user.customPreferences ?? '',
  ])

  const scored = ACTIVITY_CATALOG
    .filter((a) => (user.plan === 'FREE' ? a.subscription === 'FREE' : user.plan === 'PRO' ? a.subscription !== 'ELITE' : true))
    .map((activity) => {
      const tagScore = activity.fitTags.reduce((acc, tag) => acc + (tags.some((t) => t.includes(tag) || tag.includes(t)) ? 1 : 0), 0)
      const dayScore = openDays.length ? activity.days.filter((d) => openDays.includes(d)).length : 0
      return { ...activity, score: tagScore * 2 + dayScore }
    })
    .sort((a, b) => b.score - a.score)

  return NextResponse.json({
    openDays,
    recommendations: scored.slice(0, 6),
    availableSupport: ACTIVITY_CATALOG.map(({ title, supportBy, supportOffer, subscription }) => ({ title, supportBy, supportOffer, subscription })),
  })
}
