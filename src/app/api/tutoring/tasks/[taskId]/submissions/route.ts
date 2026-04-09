import { NextResponse } from 'next/server'
import { getSessionOrDemo } from '@/lib/auth/session'
import { forbiddenResponse, hasRequiredRole } from '@/lib/auth/roles'
import { prisma } from '@/lib/prisma'
import { getAccessibleTutoringStudentIds } from '@/lib/tutoring/access'
import { submissionCreateSchema } from '@/lib/tutoring/contracts'

type RouteParams = {
  params: Promise<{ taskId: string }>
}

async function loadTask(taskId: string) {
  return prisma.tutoringTask.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      studentUserId: true,
    },
  })
}

async function parseSubmissionPayload(request: Request, taskId: string) {
  const contentType = request.headers.get('content-type') || ''
  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    const base = submissionCreateSchema.parse({
      taskId,
      textResponse: (formData.get('textResponse')?.toString() || '').trim() || undefined,
      externalLink: (formData.get('externalLink')?.toString() || '').trim() || undefined,
      notes: (formData.get('notes')?.toString() || '').trim() || undefined,
    })

    const fileEntry = formData.get('file')
    return {
      body: base,
      file: fileEntry instanceof File ? fileEntry : null,
    }
  }

  const body = await request.json()
  return {
    body: submissionCreateSchema.parse({
      taskId,
      ...body,
    }),
    file: null,
  }
}

function toSubmissionResponse(submission: {
  id: string
  submittedAt: Date
  textResponse: string | null
  fileName: string | null
  fileMimeType: string | null
  externalLink: string | null
  notes: string | null
  submittedBy: { id: string; name: string | null } | null
  feedback: Array<{ id: string }>
}) {
  return {
    id: submission.id,
    submittedAt: submission.submittedAt.toISOString(),
    textResponse: submission.textResponse || '',
    fileName: submission.fileName || null,
    fileMimeType: submission.fileMimeType || null,
    externalLink: submission.externalLink || null,
    notes: submission.notes || null,
    submittedBy: submission.submittedBy?.name || 'Student',
    feedbackCount: submission.feedback.length,
  }
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId } = await params
  const task = await loadTask(taskId)
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  const accessibleStudentIds = await getAccessibleTutoringStudentIds(session)
  const isStaff = hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR'])
  if (!isStaff && !accessibleStudentIds.includes(task.studentUserId)) {
    return forbiddenResponse()
  }

  const submissions = await prisma.tutoringSubmission.findMany({
    where: { taskId },
    orderBy: { submittedAt: 'desc' },
    include: {
      submittedBy: {
        select: { id: true, name: true },
      },
      feedback: {
        select: { id: true },
      },
    },
  })

  return NextResponse.json(
    {
      submissions: submissions.map(toSubmissionResponse),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId } = await params
  const task = await loadTask(taskId)
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  const accessibleStudentIds = await getAccessibleTutoringStudentIds(session)
  const canManageAnyStudent = hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR'])
  const canSelfSubmit = session.user.id === task.studentUserId

  if (!canManageAnyStudent && !accessibleStudentIds.includes(task.studentUserId)) {
    return forbiddenResponse()
  }
  if (!canManageAnyStudent && !canSelfSubmit) {
    return forbiddenResponse()
  }

  try {
    const parsed = await parseSubmissionPayload(request, taskId)
    const file = parsed.file
    let fileName: string | null = null
    let fileMimeType: string | null = null
    let fileBytes: Uint8Array<ArrayBuffer> | null = null

    if (file) {
      fileName = file.name || 'upload'
      fileMimeType = file.type || 'application/octet-stream'
      fileBytes = new Uint8Array((await file.arrayBuffer()) as ArrayBuffer)
    }

    const createdSubmission = await prisma.tutoringSubmission.create({
      data: {
        taskId,
        studentUserId: task.studentUserId,
        submittedByUserId: session.user.id,
        submittedAt: new Date(),
        textResponse: parsed.body.textResponse || null,
        fileName,
        fileMimeType,
        fileBytes: fileBytes || undefined,
        externalLink: parsed.body.externalLink || null,
        notes: parsed.body.notes || null,
      },
    })

    const submission = await prisma.tutoringSubmission.findUnique({
      where: { id: createdSubmission.id },
      include: {
        submittedBy: {
          select: { id: true, name: true },
        },
        feedback: {
          select: { id: true },
        },
      },
    })

    if (!submission) {
      return NextResponse.json({ error: 'Unable to load created submission' }, { status: 500 })
    }

    await prisma.tutoringTask.update({
      where: { id: taskId },
      data: {
        status: 'SUBMITTED',
      },
    })

    return NextResponse.json(
      {
        submission: toSubmissionResponse(submission),
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      const issues = (error as { issues?: Array<{ message?: string }> }).issues
      return NextResponse.json({ error: issues?.[0]?.message || 'Invalid submission payload' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Unable to create submission' }, { status: 500 })
  }
}
