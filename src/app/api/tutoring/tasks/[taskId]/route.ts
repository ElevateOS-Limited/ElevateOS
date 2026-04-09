import { NextResponse } from 'next/server'
import { getSessionOrDemo } from '@/lib/auth/session'
import { forbiddenResponse, hasRequiredRole } from '@/lib/auth/roles'
import { prisma } from '@/lib/prisma'
import { getAccessibleTutoringStudentIds } from '@/lib/tutoring/access'
import { taskUpdateSchema } from '@/lib/tutoring/contracts'
import { fromDbTaskStatus, normalizePriority, parseDateOrNull, toDbTaskStatus, normalizeStringList } from '@/lib/tutoring/db'

type RouteParams = {
  params: Promise<{ taskId: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId } = await params
  const task = await prisma.tutoringTask.findUnique({
    where: { id: taskId },
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
              notes: true,
            },
          },
        },
      },
      assignedBy: {
        select: { id: true, name: true },
      },
      submissions: {
        orderBy: { submittedAt: 'desc' },
        include: {
          feedback: {
            orderBy: { reviewedAt: 'desc' },
            include: {
              reviewer: {
                select: { id: true, name: true },
              },
            },
          },
          submittedBy: {
            select: { id: true, name: true },
          },
        },
      },
      feedback: {
        orderBy: { reviewedAt: 'desc' },
        include: {
          reviewer: {
            select: { id: true, name: true },
          },
          submission: {
            select: {
              id: true,
              submittedAt: true,
            },
          },
        },
      },
      resources: {
        orderBy: { createdAt: 'asc' },
        include: {
          uploadedBy: {
            select: { id: true, name: true },
          },
        },
      },
    },
  })

  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  const accessibleStudentIds = await getAccessibleTutoringStudentIds(session)
  const isStaff = hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR'])

  if (!isStaff && !accessibleStudentIds.includes(task.studentUserId)) {
    return forbiddenResponse()
  }

  return NextResponse.json(
    {
      task: {
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
          uploadedBy: resource.uploadedBy?.name || 'Tutor',
        })),
        submissions: task.submissions.map((submission) => ({
          id: submission.id,
          submittedAt: submission.submittedAt.toISOString(),
          textResponse: submission.textResponse || '',
          fileName: submission.fileName || null,
          fileMimeType: submission.fileMimeType || null,
          externalLink: submission.externalLink || null,
          notes: submission.notes || null,
          submittedBy: submission.submittedBy?.name || 'Student',
          feedbackCount: submission.feedback.length,
        })),
        feedback: task.feedback.map((feedback) => ({
          id: feedback.id,
          reviewedAt: feedback.reviewedAt.toISOString(),
          score: feedback.score ?? null,
          comments: feedback.comments,
          strengths: feedback.strengths,
          weaknesses: feedback.weaknesses,
          nextAction: feedback.nextAction || null,
          weakTopics: feedback.weakTopics,
          reviewer: feedback.reviewer?.name || 'Tutor',
        })),
      },
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR'])) return forbiddenResponse()

  const { taskId } = await params
  const task = await prisma.tutoringTask.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      studentUserId: true,
    },
  })

  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  const accessibleStudentIds = await getAccessibleTutoringStudentIds(session)
  const canManageAnyStudent = hasRequiredRole(session.user.role, ['OWNER', 'ADMIN'])
  if (!canManageAnyStudent && !accessibleStudentIds.includes(task.studentUserId)) {
    return forbiddenResponse()
  }

  try {
    const body = taskUpdateSchema.parse(await request.json())
    const updated = await prisma.tutoringTask.update({
      where: { id: taskId },
      data: {
        title: body.title,
        instructions: body.description,
        subject: body.subject,
        topic: body.topic,
        dueAt: body.dueAt === null ? null : parseDateOrNull(body.dueAt),
        priority: body.priority ? normalizePriority(body.priority) : undefined,
        status: body.status ? toDbTaskStatus(body.status) : undefined,
        completionNote: body.completionNote ?? undefined,
        weakTopics: body.weakTopics ? normalizeStringList(body.weakTopics) : undefined,
      },
    })

    return NextResponse.json({
      task: {
        id: updated.id,
        studentId: updated.studentUserId,
        title: updated.title,
        status: fromDbTaskStatus(updated.status),
        dueAt: updated.dueAt?.toISOString() || null,
        priority: normalizePriority(updated.priority),
      },
    })
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      const issues = (error as { issues?: Array<{ message?: string }> }).issues
      return NextResponse.json({ error: issues?.[0]?.message || 'Invalid task payload' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Unable to update task' }, { status: 500 })
  }
}
