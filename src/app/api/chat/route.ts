import { NextResponse } from 'next/server'
import { getOpenAI, AI_MODEL } from '@/lib/ai/openai'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { AIConfigError } from '@/lib/ai/errors'
import { enforceAIDemoGuard, shouldUseStaticDemoResponses } from '@/lib/demo-ai'

export async function POST(req: Request) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const guard = await enforceAIDemoGuard(session, 'chat')
    if (guard) return guard

    const { message, history = [] } = await req.json()

    if (shouldUseStaticDemoResponses()) {
      const reply = `Demo Assistant (static): Based on your message, I recommend a 3-step plan — (1) clarify target universities and major, (2) prioritize one flagship extracurricular with measurable impact, and (3) build a 90-day execution timeline with weekly checkpoints.`
      await prisma.chatMessage.createMany({
        data: [
          { userId: session.user.id, role: 'user', content: message },
          { userId: session.user.id, role: 'assistant', content: reply },
        ],
      })
      return NextResponse.json({ message: reply })
    }

    const systemPrompt = `You are EduTech Assistant, a helpful AI assistant for the EduTech platform.
EduTech is a premium AI-powered study platform for high school students preparing for IB, AP, SAT, ACT, and university admissions.

Features you can help with:
- Study Assistant: Upload materials to get summaries, notes, flashcards, and study plans
- Worksheet Generator: Create practice questions for any subject
- Past Paper Simulation: Practice with timed exam simulations
- University Admissions: Analyze admission chances and get essay help
- Internship Recommender: Find relevant internship opportunities
- Profile Settings: Update your academic profile

Always be encouraging, specific, and helpful. Keep responses concise and actionable.`

    const messages = [
      ...history.slice(-10),
      { role: 'user' as const, content: message },
    ]

    const response = await getOpenAI().chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 500,
      temperature: 0.7,
    })

    const reply = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    // Save to DB
    await prisma.chatMessage.createMany({
      data: [
        { userId: session.user.id, role: 'user', content: message },
        { userId: session.user.id, role: 'assistant', content: reply },
      ],
    })

    return NextResponse.json({ message: reply })
  } catch (e: any) {
    if (e instanceof AIConfigError) {
      return NextResponse.json(
        { error: 'AI service is not configured. Please set a valid API key.' },
        { status: 503 }
      )
    }
    console.error(e)
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 })
  }
}
