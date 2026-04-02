import { NextResponse } from 'next/server'
import { prisma, DATABASE_URL_CONFIGURED } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { generateStructuredOutput } from '@/lib/ai/openai'
import { z } from 'zod'
import { enforceAIDemoGuard, shouldUseStaticDemoResponses, demoStudyPack } from '@/lib/demo-ai'
import { aiErrorResponse } from '@/lib/ai/http'

const schema = z.object({
  title: z.string(),
  subject: z.string(),
  level: z.string().optional(),
  curriculum: z.string().optional(),
  content: z.string(),
  contentType: z.enum(['text', 'url', 'youtube']),
})

function buildDemoStudyMaterial(input: {
  id?: string
  title: string
  subject: string
  level?: string
  curriculum?: string
  content: string
  contentType: 'text' | 'url' | 'youtube'
}) {
  const demo = demoStudyPack(input.subject || 'General', input.curriculum || 'IB')
  return {
    id: input.id ?? 'demo-study-material',
    userId: 'demo-user',
    title: input.title,
    subject: input.subject,
    level: input.level ?? null,
    curriculum: input.curriculum ?? null,
    contentType: input.contentType,
    content: input.content,
    summary: demo.summary,
    notes: `## Core concepts\n- Focus on definitions and exam command terms\n- Practice one timed question set daily\n\n## Common mistakes\n- Skipping keyword precision\n- Weak structure in long answers\n\n## Revision strategy\n- Active recall + spaced repetition + timed practice`,
    keyTopics: demo.keyConcepts,
    flashcards: demo.flashcards,
    studyPlan: demo.studyPlan.map((s) => `- ${s}`).join('\n'),
    createdAt: new Date().toISOString(),
  }
}

export async function POST(req: Request) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const guard = await enforceAIDemoGuard(session, 'study.create')
    if (guard) return guard

    const body = await req.json()
    const data = schema.parse(body)

    let result: {
      summary: string
      notes: string
      keyTopics: string[]
      flashcards: Array<{ front: string; back: string }>
      studyPlan: string
    }

    const previewMode = !DATABASE_URL_CONFIGURED

    if (previewMode || shouldUseStaticDemoResponses()) {
      const demo = demoStudyPack(data.subject || 'General', data.curriculum || 'IB')
      result = {
        summary: demo.summary,
        notes: `## Core concepts\n- Focus on definitions and exam command terms\n- Practice one timed question set daily\n\n## Common mistakes\n- Skipping keyword precision\n- Weak structure in long answers\n\n## Revision strategy\n- Active recall + spaced repetition + timed practice`,
        keyTopics: demo.keyConcepts,
        flashcards: demo.flashcards,
        studyPlan: demo.studyPlan.map((s) => `- ${s}`).join('\n'),
      }
    } else {
      const systemPrompt = `You are an expert academic tutor specializing in ${data.curriculum || 'international'} curriculum at ${data.level || 'advanced'} level. 
    Analyze the provided study material and generate comprehensive study resources.`

      const userPrompt = `Subject: ${data.subject}
Content: ${data.content.substring(0, 8000)}

Generate a JSON response with:
{
  "summary": "concise 2-3 paragraph summary",
  "notes": "structured markdown study notes with headers and bullet points",
  "keyTopics": ["topic1", "topic2", ...],
  "flashcards": [{"front": "question", "back": "answer"}, ...],
  "studyPlan": "week-by-week study plan markdown"
}`

      result = await generateStructuredOutput<{
        summary: string
        notes: string
        keyTopics: string[]
        flashcards: Array<{ front: string; back: string }>
        studyPlan: string
      }>(systemPrompt, userPrompt, 4000)
    }

    if (previewMode) {
      return NextResponse.json({
        ...buildDemoStudyMaterial({
          id: `demo-study-${Date.now()}`,
          title: data.title,
          subject: data.subject,
          level: data.level,
          curriculum: data.curriculum,
          content: data.content,
          contentType: data.contentType,
        }),
        userId: session.user.id,
        summary: result.summary,
        notes: result.notes,
        keyTopics: result.keyTopics,
        flashcards: result.flashcards,
        studyPlan: result.studyPlan,
      })
    }

    const material = await prisma.studyMaterial.create({
      data: {
        userId: session.user.id,
        title: data.title,
        subject: data.subject,
        level: data.level,
        curriculum: data.curriculum,
        contentType: data.contentType,
        content: data.content,
        summary: result.summary,
        notes: result.notes,
        keyTopics: result.keyTopics,
        flashcards: result.flashcards,
        studyPlan: result.studyPlan,
      },
    })

    return NextResponse.json(material)
  } catch (e) {
    console.error(e)
    return aiErrorResponse('openai', e, 'Failed to process material')
  }
}

export async function GET(req: Request) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!DATABASE_URL_CONFIGURED) {
    return NextResponse.json([
      buildDemoStudyMaterial({
        id: 'demo-study-1',
        title: 'IB Biology Cell Theory Review',
        subject: 'Biology',
        level: 'HL',
        curriculum: 'IB',
        contentType: 'text',
        content: 'Cell theory, microscopy, and organelle functions.',
      }),
      buildDemoStudyMaterial({
        id: 'demo-study-2',
        title: 'SAT Math Functions Drill',
        subject: 'Mathematics',
        level: 'SAT',
        curriculum: 'SAT',
        contentType: 'text',
        content: 'Linear, quadratic, and exponential function patterns.',
      }),
    ])
  }

  const materials = await prisma.studyMaterial.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(materials)
}

