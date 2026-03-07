import { NextRequest, NextResponse } from 'next/server'
import { generateWorksheet } from '@/lib/ai'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { AIConfigError } from '@/lib/ai/errors'
import { enforceAIDemoGuard, useStaticDemoResponses, demoWorksheet } from '@/lib/demo-ai'
import { forbiddenResponse, hasRequiredRole } from '@/lib/auth/roles'

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrDemo()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const allowed = hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR', 'USER'])
    if (!allowed) return forbiddenResponse()

    const guard = await enforceAIDemoGuard(session, 'worksheets.generate')
    if (guard) return guard

    const body = await request.json()
    const { subject, curriculum, topic, difficulty, count, questionTypes, content } = body
    const normalizedTopic = typeof topic === 'string' ? topic.trim() : ''
    const questionType = questionTypes?.[0] || 'Mixed'

    if (!normalizedTopic) return NextResponse.json({ error: 'Topic is required' }, { status: 400 })

    const result = useStaticDemoResponses()
      ? demoWorksheet(normalizedTopic)
      : await generateWorksheet({
          subject: subject || 'General',
          curriculum: curriculum || 'IB',
          topic: normalizedTopic,
          difficulty: difficulty || 'Medium',
          questionTypes: questionTypes || ['Multiple Choice', 'Short Answer'],
          count: parseInt(count) || 10,
          content,
        })

    await prisma.worksheet.create({
      data: {
        userId: session.user.id,
        title: `${subject || curriculum} — ${normalizedTopic}`,
        subject,
        curriculum,
        difficulty,
        questions: result.questions as any,
        answers: result.questions.map((q: any) => q.answer) as any,
        questionType,
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof AIConfigError) {
      return NextResponse.json(
        { error: 'AI service is not configured. Please set a valid API key.' },
        { status: 503 }
      )
    }
    console.error('Worksheet generation error:', error)
    return NextResponse.json({ error: 'Failed to generate worksheet' }, { status: 500 })
  }
}
