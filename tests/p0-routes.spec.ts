import { beforeEach, describe, expect, it, vi } from 'vitest'

type SessionLike = {
  user: { id: string; role?: string; email?: string | null; plan?: string }
}

const session: SessionLike = {
  user: { id: 'actor_user_1', role: 'USER', email: 'actor@example.com', plan: 'FREE' },
}

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
})

async function setupMutationRouteMocks() {
  const prisma = {
    note: { updateMany: vi.fn(), findFirst: vi.fn(), deleteMany: vi.fn(), create: vi.fn(), findMany: vi.fn() },
    goal: { updateMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), findMany: vi.fn() },
    deadline: { updateMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), findMany: vi.fn() },
    flashcard: { updateMany: vi.fn(), findFirst: vi.fn(), deleteMany: vi.fn(), create: vi.fn(), findMany: vi.fn() },
    flashcardDeck: { findFirst: vi.fn() },
    flashcardReview: { upsert: vi.fn() },
    eventLog: { create: vi.fn() },
  }

  vi.doMock('@/lib/prisma', () => ({ prisma }))
  vi.doMock('@/lib/auth/session', () => ({ getSessionOrDemo: vi.fn(async () => session) }))
  vi.doMock('@/lib/auth/roles', () => ({
    hasRequiredRole: vi.fn(() => true),
    forbiddenResponse: vi.fn(() => new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })),
  }))
  vi.doMock('@/lib/stats', () => ({ recordEvent: vi.fn(async () => undefined) }))
  vi.doMock('@/lib/audit', () => ({ writeAuditLog: vi.fn(async () => undefined) }))

  return { prisma }
}

describe('P0 ownership-safe route mutations', () => {
  it('blocks cross-user note PATCH mutation attempt', async () => {
    const { prisma } = await setupMutationRouteMocks()
    prisma.note.updateMany.mockResolvedValue({ count: 0 })

    const { PATCH } = await import('@/app/api/notes/route')
    const response = await PATCH(
      new Request('http://localhost/api/notes', {
        method: 'PATCH',
        body: JSON.stringify({ id: 'victim_note', title: 'tamper' }),
      }) as any
    )

    expect(response.status).toBe(404)
    expect(prisma.note.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'victim_note', userId: session.user.id },
      })
    )
  })

  it('blocks cross-user goal PATCH mutation attempt', async () => {
    const { prisma } = await setupMutationRouteMocks()
    prisma.goal.updateMany.mockResolvedValue({ count: 0 })

    const { PATCH } = await import('@/app/api/goals/route')
    const response = await PATCH(
      new Request('http://localhost/api/goals', {
        method: 'PATCH',
        body: JSON.stringify({ id: 'victim_goal', status: 'done' }),
      }) as any
    )

    expect(response.status).toBe(404)
    expect(prisma.goal.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'victim_goal', userId: session.user.id },
      })
    )
  })

  it('blocks cross-user deadline PATCH mutation attempt', async () => {
    const { prisma } = await setupMutationRouteMocks()
    prisma.deadline.updateMany.mockResolvedValue({ count: 0 })

    const { PATCH } = await import('@/app/api/deadlines/route')
    const response = await PATCH(
      new Request('http://localhost/api/deadlines', {
        method: 'PATCH',
        body: JSON.stringify({ id: 'victim_deadline', completed: true }),
      }) as any
    )

    expect(response.status).toBe(404)
    expect(prisma.deadline.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'victim_deadline', userId: session.user.id },
      })
    )
  })

  it('blocks cross-user flashcard PATCH and DELETE mutation attempts', async () => {
    const { prisma } = await setupMutationRouteMocks()
    prisma.flashcard.updateMany.mockResolvedValue({ count: 0 })
    prisma.flashcard.deleteMany.mockResolvedValue({ count: 0 })

    const { PATCH, DELETE } = await import('@/app/api/flashcards/cards/route')

    const patchResponse = await PATCH(
      new Request('http://localhost/api/flashcards/cards', {
        method: 'PATCH',
        body: JSON.stringify({ id: 'victim_card', front: 'hijack' }),
      }) as any
    )
    expect(patchResponse.status).toBe(404)
    expect(prisma.flashcard.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'victim_card', userId: session.user.id },
      })
    )

    const deleteResponse = await DELETE({
      nextUrl: new URL('http://localhost/api/flashcards/cards?id=victim_card'),
    } as any)
    expect(deleteResponse.status).toBe(404)
    expect(prisma.flashcard.deleteMany).toHaveBeenCalledWith({
      where: { id: 'victim_card', userId: session.user.id },
    })
  })
})

describe('P0 Stripe idempotent webhook processing', () => {
  it('short-circuits replayed processed event and avoids duplicate writes', async () => {
    const prisma = { user: { update: vi.fn() } }
    const markStripeWebhookStatus = vi.fn(async () => undefined)
    const getStripeWebhookRecord = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ eventId: 'evt_1', status: 'processed' })

    vi.doMock('@/lib/prisma', () => ({ prisma }))
    vi.doMock('next/headers', () => ({ headers: () => ({ get: () => 'sig' }) }))
    vi.doMock('@/lib/stripe/webhook-events', () => ({
      getStripeWebhookRecord,
      markStripeWebhookStatus,
    }))
    vi.doMock('@/lib/stripe/stripe', () => ({
      stripe: {
        webhooks: {
          constructEvent: vi.fn(() => ({
            id: 'evt_1',
            type: 'customer.subscription.updated',
            data: {
              object: {
                id: 'sub_1',
                customer: 'cus_1',
                current_period_end: 1893456000,
                items: { data: [{ price: { id: 'price_1' } }] },
                status: 'active',
              },
            },
          })),
        },
      },
    }))

    const { POST } = await import('@/app/api/stripe/webhook/route')

    const first = await POST(new Request('http://localhost/api/stripe/webhook', { method: 'POST', body: '{}' }))
    expect(first.status).toBe(200)
    expect(prisma.user.update).toHaveBeenCalledTimes(1)

    const replay = await POST(new Request('http://localhost/api/stripe/webhook', { method: 'POST', body: '{}' }))
    const payload = await replay.json()
    expect(replay.status).toBe(200)
    expect(payload.replay).toBe(true)
    expect(prisma.user.update).toHaveBeenCalledTimes(1)
  })
})

describe('P0 AI route behavior with mocked OpenAI failures', () => {
  it('returns classified 429 when provider is rate-limited', async () => {
    const prisma = { chatMessage: { createMany: vi.fn() } }

    vi.doMock('@/lib/prisma', () => ({ prisma }))
    vi.doMock('@/lib/auth/session', () => ({ getSessionOrDemo: vi.fn(async () => session) }))
    vi.doMock('@/lib/demo-ai', () => ({
      enforceAIDemoGuard: vi.fn(async () => null),
      useStaticDemoResponses: vi.fn(() => false),
    }))
    vi.doMock('@/lib/ai/openai', () => ({
      AI_MODEL: 'gpt-4o',
      getOpenAI: vi.fn(() => ({
        chat: {
          completions: {
            create: vi.fn(async () => {
              const error = new Error('rate limit')
              ;(error as any).status = 429
              throw error
            }),
          },
        },
      })),
    }))

    const { POST } = await import('@/app/api/chat/route')
    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'hello', history: [] }),
      })
    )
    const body = await response.json()

    expect(response.status).toBe(429)
    expect(body.code).toBe('RATE_LIMIT')
    expect(body.provider).toBe('openai')
  })
})
