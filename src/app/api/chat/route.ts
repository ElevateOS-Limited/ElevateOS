import { NextResponse } from 'next/server'
import { generateText } from '@/lib/ai/provider'
import { prisma, DATABASE_URL_CONFIGURED } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { AIConfigError } from '@/lib/ai/errors'
import { enforceAIDemoGuard, shouldUseStaticDemoResponses } from '@/lib/demo-ai'
import { aiErrorResponse } from '@/lib/ai/http'

export async function POST(req: Request) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const guard = await enforceAIDemoGuard(session, 'chat')
    if (guard) return guard

    const { message, history = [] } = await req.json()
    const cleanMessage = typeof message === 'string' ? message.trim() : ''

    if (!DATABASE_URL_CONFIGURED || shouldUseStaticDemoResponses()) {
      const reply = `Here is a practical next step: clarify the goal, focus on one priority for this week, and set a simple timeline with one checkpoint.`
      if (DATABASE_URL_CONFIGURED) {
        await prisma.chatMessage.createMany({
          data: [
            { userId: session.user.id, role: 'user', content: cleanMessage || 'Empty message' },
            { userId: session.user.id, role: 'assistant', content: reply },
          ],
        })
      }
      return NextResponse.json({ message: reply })
    }

    const systemPrompt = `You help students with IB-first revision, tutoring execution, and parent-ready summaries.
ElevateOS is a study and tutoring workspace for IB students that runs on the execution loop: Assign -> Submit -> Feedback -> Track -> Report -> Repeat.

You can help with:
- Study help: upload materials to get summaries, notes, flashcards, and study plans
- Worksheet generation: create practice questions for any subject
- Past paper practice: run timed exam simulations
- Feedback compression: turn tutor notes into parent-friendly weekly summaries
- Weak-topic diagnosis: identify recurring mistakes and next steps
- Profile details: update academic information

Always be encouraging, specific, and helpful. Keep responses concise and actionable. Do not mention prompts, policies, or internal implementation details.`

    const messages = [
      ...history.slice(-10),
      { role: 'user' as const, content: cleanMessage || 'I need help organizing my work this week.' },
    ]

    const reply =
      (await generateText({
        system: systemPrompt,
        messages,
        maxTokens: 500,
        temperature: 0.7,
      })) || 'Sorry, I could not generate a response.'

    // Save to DB
    await prisma.chatMessage.createMany({
      data: [
        { userId: session.user.id, role: 'user', content: cleanMessage || 'Empty message' },
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
    return aiErrorResponse('openai', e, 'AI assistant is temporarily unavailable')
  }
}

