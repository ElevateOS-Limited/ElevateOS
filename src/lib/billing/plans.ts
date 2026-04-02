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
    description: 'A light starter plan for trying the workspace and keeping a simple weekly rhythm.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ['5 AI study sessions per month', 'Basic worksheet generation', 'Platform chatbot', 'Shared demo workspace'],
    cta: 'Get started free',
    href: '/auth/signup',
  },
  {
    id: 'PRO',
    name: 'Pro',
    description: 'The core plan for students who need unlimited study tools and stronger admissions support.',
    monthlyPrice: 19,
    yearlyPrice: 149,
    badge: 'Most popular',
    featured: true,
    features: [
      'Unlimited AI study sessions',
      'Unlimited worksheets and past paper practice',
      'Admissions analysis and essay support',
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
    name: 'Elite',
    description: 'For families, tutors, and higher-touch workflows that need more support and visibility.',
    monthlyPrice: 39,
    yearlyPrice: 390,
    badge: 'Best for teams',
    features: [
      'Everything in Pro',
      'Essay review and tutoring support',
      'Application strategy summaries',
      'Priority support and early feature access',
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
