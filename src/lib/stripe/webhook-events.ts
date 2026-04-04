import { prisma } from '@/lib/prisma'
import { withServiceDbContext } from '@/lib/db/rls'

type StripeWebhookStatus = 'received' | 'processed' | 'failed'

export interface StripeWebhookRecord {
  eventId: string
  eventType: string
  status: StripeWebhookStatus
  receivedAt: string
  updatedAt: string
  error?: string | null
}

function toRecord(row: {
  eventId: string
  eventType: string
  status: string
  receivedAt: Date
  updatedAt: Date
  error: string | null
}): StripeWebhookRecord {
  return {
    eventId: row.eventId,
    eventType: row.eventType,
    status: row.status as StripeWebhookStatus,
    receivedAt: row.receivedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    error: row.error,
  }
}

export async function getStripeWebhookRecord(eventId: string) {
  return withServiceDbContext(async () => {
    const row = await prisma.stripeWebhookEvent.findUnique({
      where: { eventId },
    })

    return row ? toRecord(row) : null
  })
}

export async function markStripeWebhookStatus(
  eventId: string,
  eventType: string,
  status: StripeWebhookStatus,
  error?: string
) {
  return withServiceDbContext(async () => {
    const row = await prisma.stripeWebhookEvent.upsert({
      where: { eventId },
      create: {
        eventId,
        eventType,
        status,
        error: error ?? null,
      },
      update: {
        eventType,
        status,
        error: error ?? null,
      },
    })

    return toRecord(row)
  })
}

export async function listStripeWebhookRecords() {
  return withServiceDbContext(async () => {
    const rows = await prisma.stripeWebhookEvent.findMany({
      orderBy: [{ receivedAt: 'desc' }, { eventId: 'desc' }],
    })

    return rows.map(toRecord)
  })
}
