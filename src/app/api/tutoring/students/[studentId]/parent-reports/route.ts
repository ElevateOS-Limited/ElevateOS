import { NextResponse } from 'next/server'
import { getSessionOrDemo } from '@/lib/auth/session'
import { forbiddenResponse, hasRequiredRole } from '@/lib/auth/roles'
import { prisma } from '@/lib/prisma'
import { getAccessibleTutoringStudentIds } from '@/lib/tutoring/access'
import { draftParentReport } from '@/lib/tutoring/ai'
import { parentReportCreateSchema } from '@/lib/tutoring/contracts'
import { average, clampPercent, normalizeStringList, parseDateOrNull } from '@/lib/tutoring/db'

type RouteParams = {
  params: Promise<{ studentId: string }>
}

async function buildProgressSnapshot(params: {
  studentId: string
  createdByUserId: string
  periodStart: Date
  periodEnd: Date
  parentReportId: string
}) {
  const [tasks, submissions, feedback] = await Promise.all([
    prisma.tutoringTask.findMany({
      where: {
        studentUserId: params.studentId,
        createdAt: { lte: params.periodEnd },
      },
      select: {
        id: true,
        status: true,
        dueAt: true,
        weakTopics: true,
      },
    }),
    prisma.tutoringSubmission.findMany({
      where: {
        studentUserId: params.studentId,
        submittedAt: {
          gte: params.periodStart,
          lte: params.periodEnd,
        },
      },
      select: {
        id: true,
        taskId: true,
        submittedAt: true,
      },
    }),
    prisma.tutoringFeedback.findMany({
      where: {
        OR: [
          {
            task: {
              studentUserId: params.studentId,
            },
          },
          {
            submission: {
              studentUserId: params.studentId,
            },
          },
        ],
        reviewedAt: {
          gte: params.periodStart,
          lte: params.periodEnd,
        },
      },
      select: {
        score: true,
        reviewedAt: true,
        weakTopics: true,
        submission: {
          select: {
            submittedAt: true,
            taskId: true,
          },
        },
      },
    }),
  ])

  const completedCount = tasks.filter((task) => task.status === 'COMPLETED' || task.status === 'REVIEWED').length
  const submittedOnTimeCount = submissions.filter((submission) => {
    const task = tasks.find((item) => item.id === submission.taskId)
    if (!task?.dueAt) return true
    return submission.submittedAt <= task.dueAt
  }).length
  const avgScore = clampPercent(average(feedback.map((item) => item.score ?? 0)))
  const reviewLatencyHours = feedback.length
    ? average(
        feedback.map((item) => {
          const submittedAt = item.submission?.submittedAt
          if (!submittedAt) return 0
          return Math.max(0, (item.reviewedAt.getTime() - submittedAt.getTime()) / 3_600_000)
        }),
      )
    : 0
  const weakTopics = normalizeStringList([
    ...tasks.flatMap((task) => task.weakTopics || []),
    ...feedback.flatMap((item) => item.weakTopics || []),
  ])

  return prisma.tutoringProgressSnapshot.create({
    data: {
      studentUserId: params.studentId,
      createdByUserId: params.createdByUserId,
      parentReportId: params.parentReportId,
      periodStart: params.periodStart,
      periodEnd: params.periodEnd,
      headline:
        completedCount > 0 || avgScore >= 75
          ? 'Steady tutoring progress'
          : 'Tutoring needs attention',
      summary: `During this period the student completed ${completedCount} task(s), submitted ${submittedOnTimeCount} on time, and averaged ${avgScore}% on reviewed work.`,
      completionRate: clampPercent((completedCount / Math.max(1, tasks.length)) * 100),
      submittedOnTimeRate: clampPercent((submittedOnTimeCount / Math.max(1, submissions.length)) * 100),
      avgScore,
      reviewLatencyHours: Number(reviewLatencyHours.toFixed(1)),
      openTasks: tasks.filter((task) => task.status !== 'COMPLETED' && task.status !== 'REVIEWED').length,
      weakTopics,
      metrics: {
        tasks: tasks.length,
        submissions: submissions.length,
        feedback: feedback.length,
      },
    },
  })
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { studentId } = await params
  const accessibleStudentIds = await getAccessibleTutoringStudentIds(session)
  const isStaff = hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR'])
  if (!isStaff && !accessibleStudentIds.includes(studentId)) {
    return forbiddenResponse()
  }

  const reports = await prisma.tutoringParentReport.findMany({
    where: { studentUserId: studentId },
    orderBy: { periodEnd: 'desc' },
    include: {
      tutor: {
        select: { id: true, name: true },
      },
      createdBy: {
        select: { id: true, name: true },
      },
      sessionNote: {
        select: {
          id: true,
          sessionDate: true,
          summary: true,
        },
      },
    },
  })

  return NextResponse.json(
    {
      reports: reports.map((report) => ({
        id: report.id,
        studentId: report.studentUserId,
        tutorId: report.tutorUserId || null,
        sessionNoteId: report.sessionNoteId || null,
        periodStart: report.periodStart.toISOString(),
        periodEnd: report.periodEnd.toISOString(),
        topicsCovered: report.topicsCovered,
        strengths: report.strengths,
        weaknesses: report.weaknesses,
        homeworkAssigned: report.homeworkAssigned,
        progressNote: report.progressNote,
        generatedText: report.generatedText,
        deliveryStatus: report.deliveryStatus,
        channel: report.channel,
        recipientEmail: report.recipientEmail || null,
        aiSummary: report.aiSummary || null,
        createdBy: report.createdBy?.name || 'Tutor',
        sessionNote: report.sessionNote
          ? {
              id: report.sessionNote.id,
              sessionDate: report.sessionNote.sessionDate.toISOString(),
              summary: report.sessionNote.summary,
            }
          : null,
      })),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR'])) return forbiddenResponse()

  const { studentId } = await params
  const accessibleStudentIds = await getAccessibleTutoringStudentIds(session)
  const canManageAnyStudent = hasRequiredRole(session.user.role, ['OWNER', 'ADMIN'])
  if (!canManageAnyStudent && !accessibleStudentIds.includes(studentId)) {
    return forbiddenResponse()
  }

  try {
    const body = parentReportCreateSchema.parse(await request.json())
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        studentProfile: {
          select: {
            gradeLevel: true,
            curriculum: true,
          },
        },
      },
    })

    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

    const sessionNote = body.sessionNoteId
      ? await prisma.tutoringSessionNote.findUnique({
          where: { id: body.sessionNoteId },
          select: {
            id: true,
            tutorUserId: true,
            sessionDate: true,
            summary: true,
            rawNotes: true,
            topicsCovered: true,
            homeworkAssigned: true,
            weakTopics: true,
            nextSteps: true,
          },
        })
      : null

    const periodEnd = parseDateOrNull(body.periodEnd) || sessionNote?.sessionDate || new Date()
    const periodStart =
      parseDateOrNull(body.periodStart) ||
      (sessionNote ? new Date(sessionNote.sessionDate.getTime() - 3 * 24 * 60 * 60 * 1000) : new Date(periodEnd.getTime() - 7 * 24 * 60 * 60 * 1000))

    const draft = await draftParentReport({
      studentName: student.name || 'Student',
      gradeLevel: student.studentProfile?.gradeLevel || undefined,
      curriculum: student.studentProfile?.curriculum || undefined,
      topicsCovered: body.topicsCovered.length ? body.topicsCovered : sessionNote?.topicsCovered || [],
      strengths: body.strengths,
      weaknesses: body.weaknesses,
      homeworkAssigned: body.homeworkAssigned.length ? body.homeworkAssigned : sessionNote?.homeworkAssigned || [],
      progressNote: body.progressNote || sessionNote?.summary || '',
      weakTopics: body.weaknesses.length ? body.weaknesses : sessionNote?.weakTopics || [],
    })

    const parentLink = await prisma.tutoringStudentParent.findFirst({
      where: { studentUserId: studentId },
      include: {
        parent: {
          select: { email: true },
        },
      },
    })

    const report = await prisma.tutoringParentReport.create({
      data: {
        studentUserId: studentId,
        tutorUserId: sessionNote?.tutorUserId || session.user.id,
        createdByUserId: session.user.id,
        sessionNoteId: body.sessionNoteId || null,
        periodStart,
        periodEnd,
        topicsCovered: normalizeStringList(body.topicsCovered.length ? body.topicsCovered : sessionNote?.topicsCovered || []),
        strengths: normalizeStringList(body.strengths),
        weaknesses: normalizeStringList(body.weaknesses),
        homeworkAssigned: normalizeStringList(body.homeworkAssigned.length ? body.homeworkAssigned : sessionNote?.homeworkAssigned || []),
        progressNote: body.progressNote || sessionNote?.summary || draft.generatedText,
        generatedText: body.generatedText || draft.generatedText,
        deliveryStatus: body.deliveryStatus,
        channel: body.channel,
        recipientEmail: body.channel === 'email' ? parentLink?.parent?.email || null : null,
        aiSummary: draft.source === 'ai' ? draft.generatedText : null,
      },
    })

    const snapshot = await buildProgressSnapshot({
      studentId,
      createdByUserId: session.user.id,
      periodStart,
      periodEnd,
      parentReportId: report.id,
    })

    return NextResponse.json(
      {
        report: {
          id: report.id,
          studentId: report.studentUserId,
          sessionNoteId: report.sessionNoteId || null,
          periodStart: report.periodStart.toISOString(),
          periodEnd: report.periodEnd.toISOString(),
          topicsCovered: report.topicsCovered,
          strengths: report.strengths,
          weaknesses: report.weaknesses,
          homeworkAssigned: report.homeworkAssigned,
          progressNote: report.progressNote,
          generatedText: report.generatedText,
          deliveryStatus: report.deliveryStatus,
          channel: report.channel,
          recipientEmail: report.recipientEmail || null,
          aiSummary: report.aiSummary || null,
          aiSource: draft.source,
        },
        snapshot: {
          id: snapshot.id,
          headline: snapshot.headline,
          summary: snapshot.summary,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      const issues = (error as { issues?: Array<{ message?: string }> }).issues
      return NextResponse.json({ error: issues?.[0]?.message || 'Invalid parent report payload' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Unable to save parent report' }, { status: 500 })
  }
}
