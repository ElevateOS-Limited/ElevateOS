import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAppUrl } from '@/lib/app-url'
import { getSessionOrDemo } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { resolveStripePriceId } from '@/lib/billing/stripe'
import { createPaidCheckoutSession } from '@/lib/billing/checkout'
import type { BillingInterval, PaidBillingPlanId } from '@/lib/billing/plans'

const checkoutRequestSchema = z.object({
  plan: z.enum(['PRO', 'ELITE']),
  interval: z.enum(['monthly', 'yearly']).default('monthly'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrDemo()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const parsed = checkoutRequestSchema.safeParse(await request.json().catch(() => ({})))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid checkout request' }, { status: 400 })
    }

    const { plan, interval } = parsed.data
    const priceId = resolveStripePriceId(plan as PaidBillingPlanId, interval as BillingInterval)
    if (!priceId) {
      return NextResponse.json({ error: 'Pricing is not configured for that plan yet' }, { status: 500 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, stripeCustomerId: true },
    })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (!user.email) return NextResponse.json({ error: 'Missing account email' }, { status: 400 })

    const appUrl = getAppUrl(request)
    const checkoutSession = await createPaidCheckoutSession({
      user,
      priceId,
      successUrl: `${appUrl}/dashboard?upgraded=true`,
      cancelUrl: `${appUrl}/pricing?interval=${interval}`,
      metadata: { plan, interval },
      eventType: 'checkout_started',
      eventMeta: {
        plan,
        interval,
        priceId,
      },
    })

    if (!checkoutSession.url) {
      return NextResponse.json({ error: 'Checkout session could not be created' }, { status: 500 })
    }

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
