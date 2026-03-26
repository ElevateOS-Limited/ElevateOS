import { NextRequest, NextResponse } from 'next/server'
import { getInternshipRecommendations } from '@/lib/ai'
import { getSessionOrDemo } from '@/lib/auth/session'
import { enforceAIDemoGuard, shouldUseStaticDemoResponses, demoInternshipRecommendations } from '@/lib/demo-ai'

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrDemo()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const guard = await enforceAIDemoGuard(session, 'internships.recommend')
    if (guard) return guard

    const { major, careerInterests, skills, location } = await request.json()

    if (shouldUseStaticDemoResponses()) {
      return NextResponse.json(demoInternshipRecommendations(major, location))
    }

    const recommendations = await getInternshipRecommendations({
      major, careerInterests, skills, location,
    })

    return NextResponse.json({ recommendations })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 })
  }
}
