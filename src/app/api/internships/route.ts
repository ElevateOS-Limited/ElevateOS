import { NextResponse } from 'next/server'
import { generateStructuredOutput } from '@/lib/ai/openai'
import { z } from 'zod'
import { getSessionOrDemo } from '@/lib/auth/session'
import { enforceAIDemoGuard, shouldUseStaticDemoResponses } from '@/lib/demo-ai'

const schema = z.object({
  major: z.string(),
  interests: z.array(z.string()),
  skills: z.array(z.string()).optional(),
  location: z.string().optional(),
  gradeLevel: z.string().optional(),
})

export async function POST(req: Request) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const guard = await enforceAIDemoGuard(session, 'internships.list')
    if (guard) return guard

    const body = await req.json()
    const data = schema.parse(body)

    if (shouldUseStaticDemoResponses()) {
      return NextResponse.json({
        internships: [
          {
            title: `${data.major} Pre-College Research Program`,
            organization: 'Partner University Lab',
            type: 'research',
            location: data.location || 'Remote/Hybrid',
            duration: '6-8 weeks',
            stipend: 'Unpaid',
            applicationPeriod: 'Nov - Jan',
            description: 'Structured mentoring and portfolio-building research suitable for high school applicants.',
            requirements: ['Statement of interest', 'Transcript', 'Teacher reference'],
            applicationTips: 'Show sustained interest and one concrete project outcome.',
            websiteHint: 'Search: pre-college research program + your region',
          },
          {
            title: 'Youth Innovation Challenge',
            organization: 'Global Student Innovation Network',
            type: 'program',
            location: 'Online',
            duration: '10 weeks',
            stipend: 'N/A',
            applicationPeriod: 'Rolling',
            description: 'Team-based challenge with mentorship, ideal for leadership and impact evidence.',
            requirements: ['Short proposal', 'Team or solo application'],
            applicationTips: 'Highlight problem selection and measurable impact.',
            websiteHint: 'Search: high school innovation challenge global',
          },
        ],
        generalAdvice: 'Pick 1 flagship and 1 supporting opportunity this cycle; depth beats activity stacking.',
      })
    }

    const systemPrompt = `You are an internship and career advisor specializing in helping high school students build competitive university applications.`

    const userPrompt = `Recommend internships and opportunities for:
Major Interest: ${data.major}
Interests: ${data.interests.join(', ')}
Skills: ${data.skills?.join(', ') || 'Not specified'}
Location: ${data.location || 'Worldwide'}
Grade: ${data.gradeLevel || 'High school'}

Return JSON:
{
  "internships": [
    {
      "title": "Program Name",
      "organization": "Company/Org",
      "type": "internship/research/program",
      "location": "city or remote",
      "duration": "X weeks/months",
      "stipend": "paid/unpaid/X/month",
      "applicationPeriod": "month range",
      "description": "2-3 sentence description",
      "requirements": ["req1", "req2"],
      "applicationTips": "how to stand out",
      "websiteHint": "search terms to find it"
    }
  ],
  "generalAdvice": "general advice for this profile"
}`

    const result = await generateStructuredOutput(systemPrompt, userPrompt, 3000)
    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 })
  }
}
