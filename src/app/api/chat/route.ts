import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { enforceAIDemoGuard, shouldUseStaticDemoResponses } from '@/lib/demo-ai'
import { generateText } from '@/lib/ai/provider'

type ChatBody = {
  message?: unknown
  history?: unknown
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function asHistory(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const record = item as Record<string, unknown>
      const role = record.role === 'assistant' ? 'assistant' : 'user'
      const content = asString(record.content)
      return content ? { role, content } : null
    })
    .filter((item): item is { role: 'user' | 'assistant'; content: string } => Boolean(item))
}

export async function POST(req: Request) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const demoGuard = await enforceAIDemoGuard(session, 'chat')
  if (demoGuard) return demoGuard

  const body = (await req.json().catch(() => ({}))) as ChatBody
  const message = asString(body.message)
  const history = asHistory(body.history)
  if (!message) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  if (shouldUseStaticDemoResponses()) {
    return NextResponse.json({ reply: 'Demo response: keep progress moving with one focused next step.' })
  }

  try {
    const reply = await generateText({
      messages: [...history, { role: 'user', content: message }],
      system: 'You are an execution-focused student planning assistant for ElevateOS.',
      maxTokens: 1200,
    })

    await prisma.chatMessage.createMany({
      data: [
        { userId: session.user.id, role: 'user', content: message },
        { userId: session.user.id, role: 'assistant', content: reply },
      ],
    })

    return NextResponse.json({ reply })
  } catch (error) {
    const status = typeof error === 'object' && error && 'status' in error ? Number((error as { status?: unknown }).status) : 500
    if (status === 429) {
      return NextResponse.json({ error: 'AI provider rate limited', code: 'RATE_LIMIT', provider: 'openai' }, { status: 429 })
    }

    return NextResponse.json({ error: 'Chat failed' }, { status: status >= 400 ? status : 500 })
  }
}
