export type BillingInterval = 'monthly' | 'yearly'

export type BillingPlanId = 'FREE' | 'PRO' | 'ELITE'

export type PaidBillingPlanId = Exclude<BillingPlanId, 'FREE'>

export type BillingPlan = {
  id: BillingPlanId
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  features: readonly string[]
  cta: string
  badge?: string
  featured?: boolean
  href?: string
  stripePriceEnv?: Record<BillingInterval, string>
}

export const BILLING_PLAN_ORDER: Record<BillingPlanId, number> = {
  FREE: 0,
  PRO: 1,
  ELITE: 2,
}

export const BILLING_PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    description: 'A light starter plan for trying the free AI workspace and keeping a simple weekly rhythm.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ['Freemium AI onboarding', 'Basic worksheet generation', 'Platform chatbot', 'Shared demo workspace'],
    cta: 'Get started free',
    href: '/auth/signup',
  },
  {
    id: 'PRO',
    name: 'AI Premium',
    description: 'The core plan for students who need stronger AI support, structured study tools, and cleaner feedback loops.',
    monthlyPrice: 19,
    yearlyPrice: 149,
    badge: 'Most popular',
    featured: true,
    features: [
      'Unlimited AI study sessions',
      'Curriculum-aware worksheets and practice',
      'Weak-area summaries and feedback assist',
      'Priority AI responses and PDF exports',
    ],
    cta: 'Start 7-day trial',
    stripePriceEnv: {
      monthly: 'STRIPE_PRO_MONTHLY_PRICE_ID',
      yearly: 'STRIPE_PRO_YEARLY_PRICE_ID',
    },
  },
  {
    id: 'ELITE',
    name: 'Tutoring Premium',
    description: 'For families, tutors, and higher-touch workflows that need weekly execution support and parent visibility.',
    monthlyPrice: 39,
    yearlyPrice: 390,
    badge: 'Best for teams',
    features: [
      'Everything in AI Premium',
      'Weekly tasks, submissions, and feedback',
      'Parent progress visibility',
      'Tutor resource library and review queue',
    ],
    cta: 'Start 7-day trial',
    stripePriceEnv: {
      monthly: 'STRIPE_PREMIUM_MONTHLY_PRICE_ID',
      yearly: 'STRIPE_PREMIUM_YEARLY_PRICE_ID',
    },
  },
] as const satisfies readonly BillingPlan[]

export function getBillingPlan(planId: BillingPlanId) {
  return BILLING_PLANS.find((plan) => plan.id === planId) ?? BILLING_PLANS[0]
}
