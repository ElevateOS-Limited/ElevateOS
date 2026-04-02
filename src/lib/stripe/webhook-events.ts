import { promises as fs } from 'node:fs'
import path from 'node:path'

type StripeWebhookStatus = 'received' | 'processed' | 'failed'

export interface StripeWebhookRecord {
  eventId: string
  eventType: string
  status: StripeWebhookStatus
  receivedAt: string
  updatedAt: string
  error?: string
}

type StoreShape = {
  events: Record<string, StripeWebhookRecord>
}

const STORE_DIR = path.join(process.cwd(), '.runtime')
const STORE_PATH = path.join(STORE_DIR, 'stripe-webhook-events.json')

async function ensureStore(): Promise<StoreShape> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8')
    const parsed = JSON.parse(raw) as StoreShape
    return { events: parsed.events ?? {} }
  } catch {
    await fs.mkdir(STORE_DIR, { recursive: true })
    const initial: StoreShape = { events: {} }
    await fs.writeFile(STORE_PATH, JSON.stringify(initial, null, 2), 'utf8')
    return initial
  }
}

async function saveStore(store: StoreShape) {
  await fs.mkdir(STORE_DIR, { recursive: true })
  const tmpPath = `${STORE_PATH}.tmp`
  await fs.writeFile(tmpPath, JSON.stringify(store, null, 2), 'utf8')
  await fs.rename(tmpPath, STORE_PATH)
}

export async function getStripeWebhookRecord(eventId: string) {
  const store = await ensureStore()
  return store.events[eventId] || null
}

export async function markStripeWebhookStatus(
  eventId: string,
  eventType: string,
  status: StripeWebhookStatus,
  error?: string
) {
  const store = await ensureStore()
  const now = new Date().toISOString()
  const existing = store.events[eventId]
  store.events[eventId] = {
    eventId,
    eventType,
    status,
    receivedAt: existing?.receivedAt || now,
    updatedAt: now,
    ...(error ? { error } : {}),
  }
  await saveStore(store)
  return store.events[eventId]
}

export async function listStripeWebhookRecords() {
  const store = await ensureStore()
  return Object.values(store.events).sort((a, b) => (a.receivedAt < b.receivedAt ? 1 : -1))
}
