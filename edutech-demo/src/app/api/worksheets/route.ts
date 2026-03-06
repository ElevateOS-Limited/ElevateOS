import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateStructuredOutput } from '@/lib/ai/openai'
import { z } from 'zod'
import { getSessionOrDemo } from '@/lib/auth/session'
import { enforceAIDemoGuard, useStaticDemoResponses, demoWorksheet } from '@/lib/demo-ai'
import { forbiddenResponse, hasRequiredRole } from '@/lib/auth/roles'
import { getAuthoritativeOrgId } from '@/lib/auth/org-context'

const schema = z.object({
  subject: z.string(),
  curriculum: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'exam']),
  questionType: z.string(),
  topics: z.string().optional(),
  count: z.number().min(1).max(30).default(10),
})

export async function POST(req: Request) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allowed = hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR'])
  if (!allowed) return forbiddenResponse()

  try {
    const guard = await enforceAIDemoGuard(session, 'worksheets.create')
    if (guard) return guard

    const orgId = getAuthoritativeOrgId(session)
    if (!orgId) {
      return NextResponse.json(
        { error: 'Authoritative org membership is required for worksheet write operations.' },
        { status: 409 }
      )
    }

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

    if (useStaticDemoResponses()) {
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

    const worksheet = await prisma.worksheet.create({
      data: {
        orgId,
        userId: session.user.id,
        title: result.title || `${data.subject} Worksheet`,
        subject: data.subject,
        curriculum: data.curriculum,
        difficulty: data.difficulty,
        questionType: data.questionType,
        questions: result.questions,
        answers: result.answers,
      },
    })

    return NextResponse.json({
      ...worksheet,
      orgScope: 'authoritative',
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to generate worksheet' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allowed = hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR'])
  if (!allowed) return forbiddenResponse()

  const orgId = getAuthoritativeOrgId(session)

  const worksheets = await prisma.worksheet.findMany({
    where: orgId ? { orgId } : { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    worksheets,
    orgScope: orgId ? 'authoritative' : 'unscoped',
    orgScopeNote: orgId ? undefined : 'Authoritative org membership unavailable; response is user-scoped fallback and not tenant-authoritative.',
  })
}
