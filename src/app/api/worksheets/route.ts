import { NextResponse } from 'next/server'
import { prisma, DATABASE_URL_CONFIGURED } from '@/lib/prisma'
import { generateStructuredOutput } from '@/lib/ai/openai'
import { ZodError, z } from 'zod'
import { getSessionOrDemo } from '@/lib/auth/session'
import { enforceAIDemoGuard, shouldUseStaticDemoResponses, demoWorksheet } from '@/lib/demo-ai'
import { forbiddenResponse, hasRequiredRole } from '@/lib/auth/roles'
import { aiErrorResponse } from '@/lib/ai/http'

const schema = z.object({
  subject: z.string().trim().min(1, 'Subject is required'),
  curriculum: z.string().trim().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'exam']),
  questionType: z.string().trim().min(1, 'Question type is required'),
  topics: z.string().optional(),
  count: z.number().min(1).max(30).default(10),
})

function buildDemoWorksheetRecord(input: {
  id?: string
  subject: string
  curriculum?: string
  difficulty: 'easy' | 'medium' | 'hard' | 'exam'
  questionType: string
  title?: string
}) {
  const demo = demoWorksheet(input.subject)
  return {
    id: input.id ?? 'demo-worksheet',
    userId: 'demo-user',
    title: input.title ?? `${input.subject} Demo Worksheet`,
    subject: input.subject,
    curriculum: input.curriculum ?? null,
    difficulty: input.difficulty,
    questionType: input.questionType,
    questions: demo.questions.map((q, i) => ({
      id: i + 1,
      question: q.question,
      type: q.type,
      points: q.marks,
      options: q.options,
    })),
    answers: demo.questions.map((q, i) => ({
      id: i + 1,
      answer: q.answer,
      explanation: 'Model response for demo walkthrough.',
    })),
    createdAt: new Date().toISOString(),
  }
}

export async function POST(req: Request) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allowed = hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR', 'USER'])
  if (!allowed) return forbiddenResponse()

  try {
    const guard = await enforceAIDemoGuard(session, 'worksheets.create')
    if (guard) return guard

    const orgId = getSessionOrgId(session)
    const body = await req.json()
    const data = schema.parse(body)

    let result: {
      title: string
      questions: Array<{
        id: number
        question: string
        type: string
        points: number
        options?: string[]
      }>
      answers: Array<{
        id: number
        answer: string
        explanation: string
      }>
    }

    const previewMode = !DATABASE_URL_CONFIGURED

    if (previewMode || shouldUseStaticDemoResponses()) {
      const demo = demoWorksheet(data.topics || data.subject)
      result = {
        title: `${data.subject} Demo Worksheet`,
        questions: demo.questions.map((q, i) => ({ id: i + 1, question: q.question, type: q.type, points: q.marks, options: q.options })),
        answers: demo.questions.map((q, i) => ({ id: i + 1, answer: q.answer, explanation: 'Model response for demo walkthrough.' })),
      }
    } else {
      const systemPrompt = `You are an expert exam paper creator for ${data.curriculum || 'international'} curriculum.
    Create challenging, authentic exam-style questions.`

      const userPrompt = `Create ${data.count} ${data.questionType} questions for ${data.subject} at ${data.difficulty} difficulty.
    ${data.topics ? `Focus on: ${data.topics}` : ''}
    ${data.curriculum ? `Style: ${data.curriculum} exam format` : ''}

    Return JSON: {
      "title": "worksheet title",
      "questions": [
        {
          "id": 1,
          "question": "question text",
          "type": "${data.questionType}",
          "points": 5,
          "options": ["A) ...", "B) ...", "C) ...", "D) ..."] // only for multiple choice
        }
      ],
      "answers": [
        {
          "id": 1,
          "answer": "correct answer",
          "explanation": "why this is correct"
        }
      ]
    }`

      result = await generateStructuredOutput<{
        title: string
        questions: Array<{
          id: number
          question: string
          type: string
          points: number
          options?: string[]
        }>
        answers: Array<{
          id: number
          answer: string
          explanation: string
        }>
      }>(systemPrompt, userPrompt, 4000)
    }

    if (previewMode) {
      return NextResponse.json({
        ...buildDemoWorksheetRecord({
          id: `demo-worksheet-${Date.now()}`,
          subject: data.subject,
          curriculum: data.curriculum,
          difficulty: data.difficulty,
          questionType: data.questionType,
          title: result.title || `${data.subject} Worksheet`,
        }),
        userId: session.user.id,
        title: result.title || `${data.subject} Worksheet`,
        questions: result.questions,
        answers: result.answers,
      })
    }

    const worksheet = await prisma.worksheet.create({
      data: {
        orgId: orgId ?? undefined,
        userId: session.user.id,
        title: normalizedTitle,
        subject: data.subject,
        curriculum: data.curriculum,
        difficulty: data.difficulty,
        questionType: data.questionType,
        questions: result.questions,
        answers: result.answers,
      },
    })

    return NextResponse.json(worksheet)
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid worksheet payload', details: e.flatten() },
        { status: 400 }
      )
    }
    console.error(e)
    return aiErrorResponse('openai', e, 'Failed to generate worksheet')
  }
}

export async function GET(req: Request) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allowed = hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR', 'USER'])
  if (!allowed) return forbiddenResponse()

  if (!DATABASE_URL_CONFIGURED) {
    return NextResponse.json([
      buildDemoWorksheetRecord({
        id: 'demo-worksheet-1',
        subject: 'Biology',
        curriculum: 'IB',
        difficulty: 'exam',
        questionType: 'mixed',
      }),
    ])
  }

  const worksheets = await prisma.worksheet.findMany({
    where: orgId
      ? canReadAllOrgWorksheets
        ? { orgId }
        : { orgId, userId: session.user.id }
      : { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(worksheets)
}

