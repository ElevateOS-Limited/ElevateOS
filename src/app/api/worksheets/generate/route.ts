import { NextRequest, NextResponse } from 'next/server'
import { generateWorksheet } from '@/lib/ai'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { AIConfigError } from '@/lib/ai/errors'
import { enforceAIDemoGuard, shouldUseStaticDemoResponses, demoWorksheet } from '@/lib/demo-ai'
import { forbiddenResponse, hasRequiredRole } from '@/lib/auth/roles'
import { aiErrorResponse } from '@/lib/ai/http'

function getSessionOrgId(session: Awaited<ReturnType<typeof getSessionOrDemo>>) {
  const orgId = (session?.user as { orgId?: string | null } | undefined)?.orgId
  if (typeof orgId === 'string' && orgId.trim().length > 0) return orgId
  const userId = session?.user?.id
  return typeof userId === 'string' && userId.trim().length > 0 ? userId : null
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrDemo()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const allowedRoles = ['OWNER', 'ADMIN', 'TUTOR', 'USER'] as const
    const allowed = hasRequiredRole(session.user.role, [...allowedRoles])
    if (!allowed) return forbiddenResponse()

    const guard = await enforceAIDemoGuard(session, 'worksheets.generate')
    if (guard) return guard

    const orgId = getSessionOrgId(session)
    const body = await request.json()
    const { subject, curriculum, topic, difficulty, count, questionTypes, content } = body
    const normalizedTopic = typeof topic === 'string' ? topic.trim() : ''
    const normalizedSubject = typeof subject === 'string' ? subject.trim() : ''
    const normalizedCurriculum = typeof curriculum === 'string' ? curriculum.trim() : ''
    const normalizedDifficultyRaw = typeof difficulty === 'string' ? difficulty.trim().toLowerCase() : ''
    const difficultyMap: Record<string, string> = {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      exam: 'Exam',
    }
    const normalizedDifficulty = difficultyMap[normalizedDifficultyRaw] ?? 'Medium'
    const titlePrefix = normalizedSubject || normalizedCurriculum || 'General'
    const questionType = questionTypes?.[0] || 'Mixed'
    const requestedCount = count === undefined ? 10 : Number.parseInt(String(count), 10)
    if (!Number.isFinite(requestedCount) || requestedCount <= 0) {
      return NextResponse.json({ error: 'Count must be a positive integer' }, { status: 400 })
    }
    const safeCount = Math.min(requestedCount, 30)

    if (!normalizedTopic) return NextResponse.json({ error: 'Topic is required' }, { status: 400 })

    const result = shouldUseStaticDemoResponses()
      ? demoWorksheet(normalizedTopic)
      : await generateWorksheet({
          subject: subject || 'General',
          curriculum: curriculum || 'IB',
          topic: normalizedTopic,
          difficulty: normalizedDifficulty,
          questionTypes: questionTypes || ['Multiple Choice', 'Short Answer'],
          count: safeCount,
          content,
        })

    await prisma.worksheet.create({
      data: {
        orgId: orgId ?? undefined,
        userId: session.user.id,
        title: `${titlePrefix} — ${normalizedTopic}`,
        subject,
        curriculum,
        difficulty: normalizedDifficulty,
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
    return aiErrorResponse('anthropic', error, 'Failed to generate worksheet')
  }
}

