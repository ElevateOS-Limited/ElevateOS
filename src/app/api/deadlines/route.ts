import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { writeAuditLog } from '@/lib/audit'

const isDemoMode = process.env.DEMO_MODE === 'true' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

type DeadlineItem = {
  id: string
  title: string
  dueAt: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  goalId: string | null
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function createDemoDeadlines(): DeadlineItem[] {
  const today = new Date()
  return [
    {
      id: 'demo-deadline-portfolio',
      title: 'Draft activity portfolio outline',
      dueAt: addDays(today, 1).toISOString(),
      priority: 'high',
      completed: false,
      goalId: null,
    },
    {
      id: 'demo-deadline-summer',
      title: 'Submit 1 summer program application',
      dueAt: addDays(today, 3).toISOString(),
      priority: 'medium',
      completed: false,
      goalId: null,
    },
    {
      id: 'demo-deadline-checkpoint',
      title: 'Schedule counselor checkpoint',
      dueAt: addDays(today, 5).toISOString(),
      priority: 'medium',
      completed: false,
      goalId: null,
    },
    {
      id: 'demo-deadline-post',
      title: 'Create project progress post',
      dueAt: addDays(today, 7).toISOString(),
      priority: 'low',
      completed: false,
      goalId: null,
    },
  ]
}

let demoDeadlines = createDemoDeadlines()

function normalizeDeadline(item: any): DeadlineItem {
  return {
    id: String(item.id),
    title: String(item.title || ''),
    dueAt: new Date(item.dueAt).toISOString(),
    priority: (item.priority === 'low' || item.priority === 'high' ? item.priority : 'medium') as DeadlineItem['priority'],
    completed: Boolean(item.completed),
    goalId: item.goalId ?? null,
  }
}

function sortDeadlines(items: DeadlineItem[]) {
  return [...items].sort((a, b) => a.dueAt.localeCompare(b.dueAt))
}

export async function GET() {
  if (isDemoMode) {
    return NextResponse.json(sortDeadlines(demoDeadlines))
  }

  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const deadlines = await prisma.deadline.findMany({ where: { userId: session.user.id }, orderBy: { dueAt: 'asc' } })
  return NextResponse.json(deadlines)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { title, dueAt, priority, goalId } = body as {
    title?: string
    dueAt?: string
    priority?: string
    goalId?: string
  }

  if (!title || !dueAt) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (isDemoMode) {
    const item: DeadlineItem = {
      id: `demo-deadline-${Date.now()}`,
      title,
      dueAt: new Date(dueAt).toISOString(),
      priority: priority === 'low' || priority === 'high' ? priority : 'medium',
      completed: false,
      goalId: goalId || null,
    }
    demoDeadlines = sortDeadlines([...demoDeadlines, item])
    return NextResponse.json(item)
  }

  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const item = await prisma.deadline.create({
    data: { userId: session.user.id, title, dueAt: new Date(dueAt), priority: priority || 'medium', goalId: goalId || null },
  })
  await writeAuditLog({
    actorUserId: session.user.id,
    resourceType: 'deadline',
    resourceId: item.id,
    action: 'create',
    result: 'success',
  })
  return NextResponse.json(item)
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const id = typeof body.id === 'string' ? body.id : ''
  if (!id) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  if (isDemoMode) {
    const completed = Boolean(body.completed)
    demoDeadlines = demoDeadlines.map((item) => (item.id === id ? { ...item, completed } : item))
    const item = demoDeadlines.find((deadline) => deadline.id === id)
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(item)
  }

  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const updateResult = await prisma.deadline.updateMany({
    where: { id, userId: session.user.id },
    data: { completed: Boolean(body.completed) },
  })
  if (updateResult.count === 0) {
    await writeAuditLog({
      actorUserId: session.user.id,
      resourceType: 'deadline',
      resourceId: id,
      action: 'update',
      result: 'forbidden',
    })
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const item = await prisma.deadline.findFirst({ where: { id, userId: session.user.id } })
  await writeAuditLog({
    actorUserId: session.user.id,
    resourceType: 'deadline',
    resourceId: id,
    action: 'update',
    result: 'success',
  })
  return NextResponse.json(item)
}
