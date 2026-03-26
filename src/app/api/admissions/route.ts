import { NextResponse } from 'next/server'
import { generateStructuredOutput } from '@/lib/ai/openai'
import { z } from 'zod'
import { getSessionOrDemo } from '@/lib/auth/session'
import { enforceAIDemoGuard, shouldUseStaticDemoResponses } from '@/lib/demo-ai'

const schema = z.object({
  university: z.string(),
  major: z.string().optional(),
  gpa: z.number().optional(),
  satScore: z.number().optional(),
  actScore: z.number().optional(),
  curriculum: z.string().optional(),
})

export async function POST(req: Request) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const guard = await enforceAIDemoGuard(session, 'admissions.single')
    if (guard) return guard

    const body = await req.json()
    const data = schema.parse(body)

    if (shouldUseStaticDemoResponses()) {
      return NextResponse.json({
        university: data.university,
        acceptanceRate: '4%–12% (varies by cycle/program)',
        difficulty: 'reach',
        typicalGPA: '3.8 - 4.0',
        typicalSAT: '1480 - 1570',
        typicalACT: '33 - 35',
        studentAssessment: 'Promising profile for selective admissions if the application narrative is cohesive and backed by measurable extracurricular impact.',
        strengths: ['Clear motivation toward intended major', 'Competitive academic baseline if maintained'],
        improvements: ['Need one standout flagship activity', 'Increase external validation (competition/research/publication)'],
        recommendations: ['Build a 90-day action roadmap', 'Prioritize quality over quantity in activities', 'Start essay narrative framing early'],
        extracurricularsNeeded: ['Major-aligned project with outcomes', 'Leadership role with continuity'],
        deadlines: { early: 'Nov 1', regular: 'Jan 1' },
        essayTips: 'Focus on specific moments, measurable growth, and a clear future contribution angle.',
      })
    }

    const systemPrompt = `You are a university admissions expert with comprehensive knowledge of global universities.
    Provide realistic, data-driven admissions analysis.`

    const userPrompt = `Analyze admission prospects for:
University: ${data.university}
${data.major ? `Intended Major: ${data.major}` : ''}
Student Profile:
- GPA: ${data.gpa || 'Not provided'}
- SAT: ${data.satScore || 'Not provided'}
- ACT: ${data.actScore || 'Not provided'}
- Curriculum: ${data.curriculum || 'Not specified'}

Return JSON:
{
  "university": "${data.university}",
  "acceptanceRate": "X%",
  "difficulty": "reach/match/safety",
  "typicalGPA": "X.X - X.X",
  "typicalSAT": "XXXX - XXXX",
  "typicalACT": "XX - XX",
  "studentAssessment": "personalized assessment text",
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"],
  "recommendations": ["action1", "action2"],
  "extracurricularsNeeded": ["ec1", "ec2"],
  "deadlines": {"early": "date", "regular": "date"},
  "essayTips": "tips for this university's essays"
}`

    const result = await generateStructuredOutput(systemPrompt, userPrompt, 2000)
    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
