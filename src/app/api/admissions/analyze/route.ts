import { NextRequest, NextResponse } from 'next/server'
import { analyzeUniversityFit } from '@/lib/ai'
import { getSessionOrDemo } from '@/lib/auth/session'
import { enforceAIDemoGuard, shouldUseStaticDemoResponses, demoAdmissionsAnalysis } from '@/lib/demo-ai'

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrDemo()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const guard = await enforceAIDemoGuard(session, 'admissions.analyze')
    if (guard) return guard

    const { universities, gpa, satScore, actScore, curriculum, intendedMajor } = await request.json()

    if (!universities?.length) {
      return NextResponse.json({ error: 'Please add at least one university' }, { status: 400 })
    }

    if (shouldUseStaticDemoResponses()) {
      return NextResponse.json(demoAdmissionsAnalysis(universities, intendedMajor))
    }

    const results = await Promise.all(
      universities.map(async (university: string) => {
        const analysis = await analyzeUniversityFit({
          university,
          studentGPA: parseFloat(gpa) || 3.5,
          satScore: satScore ? parseInt(satScore) : undefined,
          actScore: actScore ? parseInt(actScore) : undefined,
          curriculum,
          intendedMajor,
        })
        return { university, analysis }
      })
    )

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Admissions analysis error:', error)
    return NextResponse.json({ error: 'Failed to analyze admissions' }, { status: 500 })
  }
}
