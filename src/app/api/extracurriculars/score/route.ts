import { NextRequest, NextResponse } from 'next/server'
import { generateStructuredOutput } from '@/lib/ai/openai'
import { getSessionOrDemo } from '@/lib/auth/session'
import { enforceAIDemoGuard, useStaticDemoResponses, demoExtracurricularScore } from '@/lib/demo-ai'
import { aiErrorResponse } from '@/lib/ai/http'

type Activity = { name: string; role?: string; impact?: string; hoursPerWeek?: number }

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionOrDemo()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const guard = await enforceAIDemoGuard(session, 'extracurriculars.score')
    if (guard) return guard

    const { activities, targetUniversities, intendedMajor } = await req.json()
    if (!Array.isArray(activities) || !activities.length) {
      return NextResponse.json({ error: 'activities array is required' }, { status: 400 })
    }

    const payload = {
      activities: activities as Activity[],
      targetUniversities: targetUniversities || [],
      intendedMajor: intendedMajor || 'Undecided',
    }

    const system = 'You are an admissions advisor. Score extracurricular profiles for top university competitiveness.'
    const user = `Analyze this extracurricular profile and return JSON only with:
{
  "overallScore": number,
  "breakdown": {
    "leadership": number,
    "impact": number,
    "consistency": number,
    "distinction": number,
    "majorAlignment": number
  },
  "tier": "local|regional|national|international",
  "strengths": string[],
  "gaps": string[],
  "recommendedActions": [{"action":"...","priority":"high|medium|low","why":"..."}],
  "topUniversityReadiness": {"score": number, "comment": "..."}
}

Input:
${JSON.stringify(payload, null, 2)}`

    if (useStaticDemoResponses()) {
      return NextResponse.json(demoExtracurricularScore())
    }

    const result = await generateStructuredOutput<any>(system, user, 2200)
    return NextResponse.json(result)
  } catch (error: any) {
    return aiErrorResponse('openai', error, 'Failed to score extracurriculars')
  }
}

