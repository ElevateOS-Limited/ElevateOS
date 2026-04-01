import { NextRequest, NextResponse } from 'next/server'
import { generateVisionJson } from '@/lib/ai/provider'
import { getSessionOrDemo } from '@/lib/auth/session'
import { AIConfigError } from '@/lib/ai/errors'
import { enforceAIDemoGuard, shouldUseStaticDemoResponses, demoPaperGrade } from '@/lib/demo-ai'
import { aiErrorResponse } from '@/lib/ai/http'

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionOrDemo()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const guard = await enforceAIDemoGuard(session, 'papers.grade')
    if (guard) return guard

    const { imageDataUrl, answerKey, markingNotes } = await req.json()
    if (!imageDataUrl || !answerKey) {
      return NextResponse.json({ error: 'imageDataUrl and answerKey are required' }, { status: 400 })
    }

    if (shouldUseStaticDemoResponses()) {
      return NextResponse.json(demoPaperGrade(answerKey))
    }

    const prompt = `You are an exam grader. Extract student answers from the uploaded paper image, compare with the answer key, and return strict JSON:
{
  "detectedAnswers": [{"question":"1","studentAnswer":"..."}],
  "grading": [{"question":"1","correctAnswer":"...","studentAnswer":"...","isCorrect":true,"marksAwarded":1,"marksTotal":1,"reason":"..."}],
  "totalMarks": 0,
  "maxMarks": 0,
  "percentage": 0,
  "summary": "short feedback"
}

Answer key:
${JSON.stringify(answerKey)}

Marking notes:
${markingNotes || 'Strict exact matching for objective questions; allow equivalent wording for short answers.'}`

    const parsed = await generateVisionJson({
      prompt,
      imageDataUrl,
      system: 'You grade student papers from images and return valid JSON only.',
      maxTokens: 3000,
      temperature: 0.2,
    })
    return NextResponse.json(parsed)
  } catch (error: any) {
    if (error instanceof AIConfigError) {
      return NextResponse.json(
        { error: 'AI service is not configured. Please set a valid API key.' },
        { status: 503 }
      )
    }
    return aiErrorResponse('openai', error, 'Paper grading is temporarily unavailable')
  }
}

