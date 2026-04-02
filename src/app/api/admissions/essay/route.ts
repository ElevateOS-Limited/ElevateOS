import { NextRequest, NextResponse } from 'next/server'
import { aiComplete } from '@/lib/ai'
import { getSessionOrDemo } from '@/lib/auth/session'
import { enforceAIDemoGuard, shouldUseStaticDemoResponses, demoEssayFeedback } from '@/lib/demo-ai'
import { aiErrorResponse } from '@/lib/ai/http'

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrDemo()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const guard = await enforceAIDemoGuard(session, 'admissions.essay')
    if (guard) return guard

    const { essay, major } = await request.json()
    if (!essay?.trim()) return NextResponse.json({ error: 'Essay content required' }, { status: 400 })

    if (shouldUseStaticDemoResponses()) {
      return NextResponse.json(demoEssayFeedback(major))
    }

    const feedback = await aiComplete({
      messages: [{
        role: 'user',
        content: `Please review this college application essay for a student applying for ${major || 'university'}. 

Essay:
${essay}

Provide detailed, constructive feedback covering:
1. **Overall Impression** — First impression and key strengths
2. **Storytelling & Narrative** — How compelling and personal is it?
3. **Structure & Flow** — Opening, body, conclusion effectiveness
4. **Voice & Authenticity** — Does it sound genuine and unique?
5. **Specific Improvements** — 3-5 concrete, actionable suggestions
6. **Strengths to Keep** — What works well that they should preserve
7. **Summary Score** — Rate each dimension 1-10

Be honest, specific, and encouraging. Focus on making it stronger, not just pointing out flaws.`,
      }],
      system: 'You are an expert college admissions essay coach who has helped students get into Ivy League and top universities worldwide.',
      maxTokens: 2000,
    })

    return NextResponse.json({ feedback })
  } catch (error) {
    return aiErrorResponse('anthropic', error, 'Failed to analyze essay')
  }
}

