import { NextResponse } from 'next/server'
import { getSessionOrDemo } from '@/lib/auth/session'
import { forbiddenResponse, hasRequiredRole } from '@/lib/auth/roles'
import { prisma } from '@/lib/prisma'
import { getAccessibleTutoringStudentIds } from '@/lib/tutoring/access'
import { taskCreateSchema } from '@/lib/tutoring/contracts'

function toDbTaskStatus(value: string) {
  switch (value) {
    case 'submitted':
      return 'SUBMITTED'
    case 'reviewed':
      return 'REVIEWED'
    case 'overdue':
      return 'OVERDUE'
    case 'completed':
      return 'COMPLETED'
    default:
      return 'ASSIGNED'
  }
}

function fromDbTaskStatus(value: string) {
  switch ((value || '').toUpperCase()) {
    case 'SUBMITTED':
      return 'submitted'
    case 'REVIEWED':
      return 'reviewed'
    case 'OVERDUE':
      return 'overdue'
    case 'COMPLETED':
      return 'completed'
    default:
      return 'assigned'
  }
}

function parseDate(value?: string | null) {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function normalizePriority(value?: string | null) {
  const lower = (value || 'medium').toLowerCase()
  return lower === 'high' || lower === 'low' ? lower : 'medium'
}

function normalizeStringList(values: string[] | undefined) {
  return Array.from(new Set((values || []).map((value) => value.trim()).filter(Boolean)))
}

export async function GET() {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const accessibleStudentIds = await getAccessibleTutoringStudentIds(session)
  const isStaff = hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR'])

  if (!accessibleStudentIds.length && !isStaff) {
    return NextResponse.json({ tasks: [] }, { headers: { 'Cache-Control': 'no-store' } })
  }

  const tasks = await prisma.tutoringTask.findMany({
    where: accessibleStudentIds.length ? { studentUserId: { in: accessibleStudentIds } } : undefined,
    orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
    include: {
      student: {
        select: {
          id: true,
          name: true,
          role: true,
          studentProfile: {
            select: {
              gradeLevel: true,
              curriculum: true,
              schoolName: true,
              weeklyGoal: true,
            },
          },
        },
      },
      assignedBy: {
        select: { id: true, name: true },
      },
      submissions: {
        orderBy: { submittedAt: 'desc' },
        take: 1,
        include: {
          feedback: {
            select: { id: true },
          },
        },
      },
      feedback: {
        orderBy: { reviewedAt: 'desc' },
        take: 1,
        include: {
          reviewer: {
            select: { id: true, name: true },
          },
        },
      },
      resources: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          title: true,
          kind: true,
          accessTier: true,
          summary: true,
          fileName: true,
          externalLink: true,
        },
      },
    },
  })

  return NextResponse.json(
    {
      tasks: tasks.map((task) => ({
        id: task.id,
        studentId: task.studentUserId,
        studentName: task.student?.name || 'Student',
        studentGrade: task.student?.studentProfile?.gradeLevel || null,
        subject: task.subject,
        topic: task.topic,
        title: task.title,
        instructions: task.instructions,
        status: fromDbTaskStatus(task.status),
        dueAt: task.dueAt?.toISOString() || null,
        completedAt: task.completedAt?.toISOString() || null,
        priority: normalizePriority(task.priority),
        completionNote: task.completionNote || null,
        weakTopics: Array.isArray(task.weakTopics) ? task.weakTopics : [],
        assignedBy: task.assignedBy?.name || 'Tutor',
        resources: task.resources.map((resource) => ({
          id: resource.id,
          title: resource.title,
          kind: resource.kind,
          accessTier: resource.accessTier,
          summary: resource.summary || null,
          fileName: resource.fileName || null,
          externalLink: resource.externalLink || null,
        })),
        latestSubmissionAt: task.submissions[0]?.submittedAt?.toISOString() || null,
        latestFeedbackAt: task.feedback[0]?.reviewedAt?.toISOString() || null,
      })),
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  )
}

export async function POST(request: Request) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR'])) return forbiddenResponse()

  try {
    const body = taskCreateSchema.parse(await request.json())
    const accessibleStudentIds = await getAccessibleTutoringStudentIds(session)
    const canManageAnyStudent = hasRequiredRole(session.user.role, ['OWNER', 'ADMIN'])

    if (!canManageAnyStudent && !accessibleStudentIds.includes(body.studentId)) {
      return forbiddenResponse()
    }

    const task = await prisma.tutoringTask.create({
      data: {
        studentUserId: body.studentId,
        assignedByUserId: session.user.id,
        subject: body.subject,
        topic: body.topic,
        title: body.title,
        instructions: body.description,
        status: 'ASSIGNED',
        dueAt: parseDate(body.dueAt),
        priority: normalizePriority(body.priority),
        weakTopics: normalizeStringList(body.weakTopics),
      },
    })

    if (body.resourceTitles.length) {
      await prisma.tutoringResource.createMany({
        data: body.resourceTitles.map((title) => ({
          title,
          subject: body.subject,
          topic: body.topic,
          kind: 'TUTOR_RESOURCE',
          accessTier: 'TUTORING_PREMIUM',
          summary: `Attached to task: ${body.title}`,
          taskId: task.id,
          studentUserId: body.studentId,
          uploadedByUserId: session.user.id,
        })),
      })
    }

    return NextResponse.json(
      {
        task: {
          id: task.id,
          studentId: task.studentUserId,
          assignedByUserId: task.assignedByUserId,
          subject: task.subject,
          topic: task.topic,
          title: task.title,
          instructions: task.instructions,
          status: 'assigned',
          dueAt: task.dueAt?.toISOString() || null,
          priority: task.priority,
          weakTopics: task.weakTopics,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      const issues = (error as { issues?: Array<{ message?: string }> }).issues
      return NextResponse.json({ error: issues?.[0]?.message || 'Invalid task payload' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Unable to create task' }, { status: 500 })
  }
}
