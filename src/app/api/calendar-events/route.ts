import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'

const isDemoMode = process.env.DEMO_MODE === 'true' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

type CalendarEventItem = {
  id: string
  title: string
  startsAt: string
  endsAt: string
  source: string
  module: string | null
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function createDemoEvents(): CalendarEventItem[] {
  const today = new Date()
  return [
    {
      id: 'demo-event-1',
      title: 'Math tutoring session',
      startsAt: addDays(today, 1),
      endsAt: addDays(today, 1),
      source: 'demo',
      module: 'planner',
    },
    {
      id: 'demo-event-2',
      title: 'Admissions check-in',
      startsAt: addDays(today, 3),
      endsAt: addDays(today, 3),
      source: 'demo',
      module: 'planner',
    },
  ].map((item, idx) => {
    const startsAt = new Date(item.startsAt)
    startsAt.setHours(16 + idx, 0, 0, 0)
    const endsAt = new Date(item.endsAt)
    endsAt.setHours(17 + idx, 0, 0, 0)
    return {
      ...item,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    }
  })
}

let demoEvents = createDemoEvents()

function normalizeEvent(item: any): CalendarEventItem {
  return {
    id: String(item.id),
    title: String(item.title || ''),
    startsAt: new Date(item.startsAt).toISOString(),
    endsAt: new Date(item.endsAt).toISOString(),
    source: String(item.source || 'manual'),
    module: item.module ?? null,
  }
}

function sortEvents(items: CalendarEventItem[]) {
  return [...items].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}

export async function GET() {
  if (isDemoMode) {
    return NextResponse.json(sortEvents(demoEvents))
  }

  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const events = await prisma.calendarEvent.findMany({ where: { userId: session.user.id }, orderBy: { startsAt: 'asc' } })
  return NextResponse.json(events)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { title, startsAt, endsAt, source, module } = body as {
    title?: string
    startsAt?: string
    endsAt?: string
    source?: string
    module?: string | null
  }

  if (!title || !startsAt || !endsAt) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (isDemoMode) {
    const item: CalendarEventItem = {
      id: `demo-event-${Date.now()}`,
      title,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      source: source || 'manual',
      module: module || null,
    }
    demoEvents = sortEvents([...demoEvents, item])
    return NextResponse.json(item)
  }

  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const item = await prisma.calendarEvent.create({
    data: {
      userId: session.user.id,
      title,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      source: source || 'manual',
      module: module || null,
    },
  })
  return NextResponse.json(item)
}
