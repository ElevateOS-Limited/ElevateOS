import { NextRequest, NextResponse } from 'next/server'
import { getSessionOrDemo } from '@/lib/auth/session'
import { forbiddenResponse, hasRequiredRole } from '@/lib/auth/roles'
import { aiErrorResponse } from '@/lib/ai/http'
import { prisma, DATABASE_URL_CONFIGURED } from '@/lib/prisma'
import { getTutoringWorkspaceSnapshot } from '@/lib/tutoring/workspace'
import { buildWeeklyParentReport, generateWeeklyParentAiSummary } from '@/lib/tutoring/report'

export async function GET(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR', 'PARENT', 'STUDENT'])) return forbiddenResponse()

  try {
    const snapshot = await getTutoringWorkspaceSnapshot(session)
    const accessibleStudentIdSet = new Set(snapshot.students.map((student) => student.id))
    const requestedStudentId = (req.nextUrl.searchParams.get('studentId') || '').trim()
    if (requestedStudentId && !accessibleStudentIdSet.has(requestedStudentId)) {
      return forbiddenResponse()
    }
    const selectedStudentId = requestedStudentId || snapshot.students[0]?.id || ''

    if (!selectedStudentId) {
      return NextResponse.json({ error: 'No accessible student found for this report' }, { status: 404 })
    }

    const student = snapshot.students.find((item) => item.id === selectedStudentId)
    if (!student) {
      return NextResponse.json({ error: 'Student not found in tutoring snapshot' }, { status: 404 })
    }

    const tasks = snapshot.tasks.filter((task) => task.studentId === selectedStudentId)
    const submissions = snapshot.submissions.filter((submission) => submission.studentId === selectedStudentId)
    const feedback = snapshot.feedback.filter((item) => item.studentId === selectedStudentId)

    const report = buildWeeklyParentReport({
      student,
      parentNames: student.parentNames,
      tutorNames: student.tutorNames,
      tasks,
      submissions,
      feedback,
      generatedAt: new Date().toISOString(),
    })

    if (process.env.DEMO_STATIC_RESPONSES !== 'true') {
      const aiSummary = await generateWeeklyParentAiSummary(report)
      if (aiSummary) {
        report.aiSummary = aiSummary
      }
    }

    if (DATABASE_URL_CONFIGURED) {
      await prisma.eventLog.create({
        data: {
          userId: session.user.id,
          eventType: 'tutoring_report_generated',
          meta: {
            studentId: selectedStudentId,
            aiSummary: Boolean(report.aiSummary),
            at: new Date().toISOString(),
          },
        },
      })
    }

    return NextResponse.json(report, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    return aiErrorResponse('openai', error, 'Weekly report generation failed')
  }
}
