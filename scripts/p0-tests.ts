import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import path from 'node:path'

import {
  getStripeWebhookRecord,
  markStripeWebhookStatus,
} from '../src/lib/stripe/webhook-events'
import {
  DATABASE_URL_CONFIGURED,
} from '../src/lib/prisma'
import {
  AIProviderError,
  resetAICircuitState,
  runWithAIProtection,
} from '../src/lib/ai/resilience'

const root = process.cwd()

async function testOwnershipGuards() {
  const checks: Array<{ file: string; mustInclude: string[] }> = [
    {
      file: 'src/app/api/notes/route.ts',
      mustInclude: [
        'updateMany({',
        'where: { id, userId: session.user.id }',
        'deleteMany({ where: { id, userId: session.user.id } })',
      ],
    },
    {
      file: 'src/app/api/goals/route.ts',
      mustInclude: ['updateMany({', 'where: { id, userId: session.user.id }'],
    },
    {
      file: 'src/app/api/deadlines/route.ts',
      mustInclude: ['updateMany({', 'where: { id, userId: session.user.id }'],
    },
    {
      file: 'src/app/api/flashcards/cards/route.ts',
      mustInclude: [
        'updateMany({',
        'deleteMany({ where: { id, userId: session.user.id } })',
        'where: { id: deckId, userId: session.user.id }',
      ],
    },
  ]

  for (const check of checks) {
    const fullPath = path.join(root, check.file)
    const content = await fs.readFile(fullPath, 'utf8')
    for (const expected of check.mustInclude) {
      assert.ok(
        content.includes(expected),
        `Expected "${expected}" in ${check.file} to enforce ownership-safe mutation`
      )
    }
  }
}

async function testStripeWebhookStoreReplay() {
  if (!DATABASE_URL_CONFIGURED) {
    console.log('Skipping Stripe webhook persistence test because DATABASE_URL is not configured')
    return
  }

  const eventId = 'evt_test_replay_123'
  await markStripeWebhookStatus(eventId, 'customer.subscription.updated', 'received')
  await markStripeWebhookStatus(eventId, 'customer.subscription.updated', 'processed')

  const saved = await getStripeWebhookRecord(eventId)
  assert.ok(saved, 'Expected webhook event to be persisted')
  assert.equal(saved?.status, 'processed', 'Expected processed status after replay-safe mark')
}

async function testAITimeoutAndCircuit() {
  resetAICircuitState()

  await assert.rejects(
    async () =>
      runWithAIProtection(
        'openai',
        async () =>
          new Promise((resolve) => {
            setTimeout(() => resolve('late'), 100)
          }),
        10
      ),
    (error: unknown) => {
      assert.ok(error instanceof AIProviderError)
      assert.equal((error as AIProviderError).code, 'TIMEOUT')
      return true
    },
    'Expected timeout classification'
  )

  for (let i = 0; i < 3; i += 1) {
    await assert.rejects(async () => {
      await runWithAIProtection('openai', async () => {
        throw new Error('provider down')
      }, 100)
    })
  }

  await assert.rejects(
    async () => {
      await runWithAIProtection('openai', async () => 'should_not_run', 100)
    },
    (error: unknown) => {
      assert.ok(error instanceof AIProviderError)
      assert.equal((error as AIProviderError).code, 'CIRCUIT_OPEN')
      return true
    },
    'Expected open circuit after consecutive failures'
  )
}

async function main() {
  await testOwnershipGuards()
  await testStripeWebhookStoreReplay()
  await testAITimeoutAndCircuit()
  console.log('P0 tests passed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
