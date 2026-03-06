import { NextRequest, NextResponse } from 'next/server'
import { generateWorksheet } from '@/lib/ai'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { AIConfigError } from '@/lib/ai/errors'
import { enforceAIDemoGuard, useStaticDemoResponses, demoWorksheet } from '@/lib/demo-ai'
import { forbiddenResponse, hasRequiredRole } from '@/lib/auth/roles'
import { getAuthoritativeOrgId } from '@/lib/auth/org-context'

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrDemo()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const allowed = hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR'])
    if (!allowed) return forbiddenResponse()

    const guard = await enforceAIDemoGuard(session, 'worksheets.generate')
    if (guard) return guard

    const orgId = getAuthoritativeOrgId(session)
    if (!orgId) {
      return NextResponse.json(
        { error: 'Authoritative org membership is required for worksheet write operations.' },
        { status: 409 }
      )
    }

    const body = await request.json()
    const { subject, curriculum, topic, difficulty, count, questionTypes, content } = body
    const questionType = questionTypes?.[0] || 'Mixed'

    if (!topic) return NextResponse.json({ error: 'Topic is required' }, { status: 400 })

    const result = useStaticDemoResponses()
      ? demoWorksheet(topic)
      : await generateWorksheet({
          subject: subject || 'General',
          curriculum: curriculum || 'IB',
          topic,
          difficulty: difficulty || 'Medium',
          questionTypes: questionTypes || ['Multiple Choice', 'Short Answer'],
          count: parseInt(count) || 10,
          content,
        })

    await prisma.worksheet.create({
      data: {
        orgId,
        userId: session.user.id,
        title: `${subject || curriculum} — ${topic}`,
        subject,
        curriculum,
        difficulty,
        questions: result.questions as any,
        answers: result.questions.map((q: any) => q.answer) as any,
        questionType,
      },
    })

    return NextResponse.json({
      ...result,
      orgScope: 'authoritative',
    })
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
