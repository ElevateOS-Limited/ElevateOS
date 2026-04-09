import { NextResponse } from 'next/server'
import { getSessionOrDemo } from '@/lib/auth/session'
import { forbiddenResponse, hasRequiredRole } from '@/lib/auth/roles'
import { prisma } from '@/lib/prisma'
import { feedbackCreateSchema } from '@/lib/tutoring/contracts'
import { getAccessibleTutoringStudentIds } from '@/lib/tutoring/access'
import { normalizeStringList } from '@/lib/tutoring/db'

type RouteParams = {
  params: Promise<{ submissionId: string }>
}

function toFeedbackResponse(feedback: {
  id: string
  taskId: string
  submissionId: string | null
  score: number | null
  comments: string
  strengths: string[]
  weaknesses: string[]
  nextAction: string | null
  weakTopics: string[]
  reviewedAt: Date
  reviewer: { id: string; name: string | null } | null
}) {
  return {
    id: feedback.id,
    taskId: feedback.taskId,
    submissionId: feedback.submissionId || null,
    score: feedback.score ?? null,
    summary: feedback.comments,
    strengths: feedback.strengths,
    weaknesses: feedback.weaknesses,
    nextSteps: feedback.nextAction || null,
    weakTopics: feedback.weakTopics,
    reviewedAt: feedback.reviewedAt.toISOString(),
    reviewer: feedback.reviewer?.name || 'Tutor',
  }
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { submissionId } = await params
  const submission = await prisma.tutoringSubmission.findUnique({
    where: { id: submissionId },
    include: {
      task: {
        select: { studentUserId: true },
      },
      feedback: {
        orderBy: { reviewedAt: 'desc' },
        include: {
          reviewer: {
            select: { id: true, name: true },
          },
        },
      },
    },
  })

  if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 })

  const accessibleStudentIds = await getAccessibleTutoringStudentIds(session)
  const isStaff = hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR'])
  if (!isStaff && !accessibleStudentIds.includes(submission.task.studentUserId)) {
    return forbiddenResponse()
  }

  return NextResponse.json(
    {
      feedback: submission.feedback.map(toFeedbackResponse),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR'])) return forbiddenResponse()

  const { submissionId } = await params
  const submission = await prisma.tutoringSubmission.findUnique({
    where: { id: submissionId },
    include: {
      task: {
        select: { id: true, studentUserId: true },
      },
    },
  })

  if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 })

  const accessibleStudentIds = await getAccessibleTutoringStudentIds(session)
  const canManageAnyStudent = hasRequiredRole(session.user.role, ['OWNER', 'ADMIN'])
  if (!canManageAnyStudent && !accessibleStudentIds.includes(submission.task.studentUserId)) {
    return forbiddenResponse()
  }

  try {
    const parsed = feedbackCreateSchema.parse({
      ...(await request.json()),
      taskId: submission.taskId,
      submissionId,
    })

    const feedback = await prisma.tutoringFeedback.create({
      data: {
        taskId: submission.taskId,
        submissionId,
        reviewerUserId: session.user.id,
        score: parsed.score ?? null,
        comments: parsed.summary,
        strengths: normalizeStringList(parsed.strengths),
        weaknesses: normalizeStringList(parsed.weaknesses),
        nextAction: parsed.nextSteps,
        weakTopics: normalizeStringList(parsed.weakTopicTags),
      },
      include: {
        reviewer: {
          select: { id: true, name: true },
        },
      },
    })

    await prisma.tutoringTask.update({
      where: { id: submission.taskId },
      data: {
        status: 'REVIEWED',
        completionNote: parsed.nextSteps,
        completedAt: new Date(),
      },
    })

    return NextResponse.json(
      {
        feedback: toFeedbackResponse(feedback),
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      const issues = (error as { issues?: Array<{ message?: string }> }).issues
      return NextResponse.json({ error: issues?.[0]?.message || 'Invalid feedback payload' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Unable to save feedback' }, { status: 500 })
  }
}
