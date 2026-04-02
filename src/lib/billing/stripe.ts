import type { BillingInterval, PaidBillingPlanId } from './plans'
import { BILLING_PLANS } from './plans'

function readEnv(key: string) {
  return (process.env[key] || '').trim()
}

export function resolveStripePriceId(planId: PaidBillingPlanId, interval: BillingInterval) {
  const plan = BILLING_PLANS.find((item) => item.id === planId)
  if (!plan || plan.id === 'FREE') return null

  return readEnv(plan.stripePriceEnv[interval])
}
