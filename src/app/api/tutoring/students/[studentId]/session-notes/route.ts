import { NextResponse } from 'next/server'
import { getSessionOrDemo } from '@/lib/auth/session'
import { forbiddenResponse, hasRequiredRole } from '@/lib/auth/roles'
import { prisma } from '@/lib/prisma'
import { getAccessibleTutoringStudentIds } from '@/lib/tutoring/access'
import { draftSessionSummary } from '@/lib/tutoring/ai'
import { sessionNoteCreateSchema } from '@/lib/tutoring/contracts'
import { parseDateOrNull, normalizeStringList } from '@/lib/tutoring/db'

type RouteParams = {
  params: Promise<{ studentId: string }>
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

  const notes = await prisma.tutoringSessionNote.findMany({
    where: { studentUserId: studentId },
    orderBy: { sessionDate: 'desc' },
    include: {
      tutor: {
        select: { id: true, name: true },
      },
      createdBy: {
        select: { id: true, name: true },
      },
    },
  })

  return NextResponse.json(
    {
      notes: notes.map((note) => ({
        id: note.id,
        studentId: note.studentUserId,
        tutorId: note.tutorUserId || null,
        sessionDate: note.sessionDate.toISOString(),
        subject: note.subject || null,
        topicsCovered: note.topicsCovered,
        homeworkAssigned: note.homeworkAssigned,
        weakTopics: note.weakTopics,
        nextSteps: note.nextSteps,
        summary: note.summary,
        rawNotes: note.rawNotes || null,
        aiSummary: note.aiSummary || null,
        createdBy: note.createdBy?.name || 'Tutor',
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
    const body = sessionNoteCreateSchema.parse(await request.json())
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

    const noteDate = parseDateOrNull(body.sessionDate) || new Date()
    const aiSummary = await draftSessionSummary({
      studentName: student.name || 'Student',
      gradeLevel: student.studentProfile?.gradeLevel || undefined,
      curriculum: student.studentProfile?.curriculum || undefined,
      subject: body.subject || undefined,
      sessionDate: body.sessionDate,
      topicsCovered: body.topicsCovered,
      homeworkAssigned: body.homeworkAssigned,
      weakTopics: body.weakTopics,
      rawNotes: [body.summary, body.rawNotes || ''].filter(Boolean).join('\n\n'),
    })

    const note = await prisma.tutoringSessionNote.create({
      data: {
        studentUserId: studentId,
        tutorUserId: body.tutorUserId || session.user.id,
        createdByUserId: session.user.id,
        sessionDate: noteDate,
        subject: body.subject || null,
        topicsCovered: normalizeStringList(body.topicsCovered),
        homeworkAssigned: normalizeStringList(body.homeworkAssigned),
        weakTopics: normalizeStringList(body.weakTopics),
        nextSteps: normalizeStringList(body.nextSteps),
        summary: body.summary,
        rawNotes: body.rawNotes || null,
        aiSummary: aiSummary.summary,
      },
      include: {
        tutor: {
          select: { id: true, name: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(
      {
        note: {
          id: note.id,
          studentId: note.studentUserId,
          tutorId: note.tutorUserId || null,
          sessionDate: note.sessionDate.toISOString(),
          subject: note.subject || null,
          topicsCovered: note.topicsCovered,
          homeworkAssigned: note.homeworkAssigned,
          weakTopics: note.weakTopics,
          nextSteps: note.nextSteps,
          summary: note.summary,
          rawNotes: note.rawNotes || null,
          aiSummary: note.aiSummary || null,
          aiSource: aiSummary.source,
          createdBy: note.createdBy?.name || 'Tutor',
        },
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      const issues = (error as { issues?: Array<{ message?: string }> }).issues
      return NextResponse.json({ error: issues?.[0]?.message || 'Invalid session note payload' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Unable to save session note' }, { status: 500 })
  }
}
