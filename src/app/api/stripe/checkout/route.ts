import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAppUrl } from '@/lib/app-url'
import { getSessionOrDemo } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { createCheckoutSession } from '@/lib/stripe'
import { getStripe } from '@/lib/stripe/stripe'
import { resolveStripePriceId } from '@/lib/billing/stripe'
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

    const stripe = getStripe()
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
      })
      customerId = customer.id
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    const appUrl = getAppUrl(request)
    const checkoutSession = await createCheckoutSession({
      userId: user.id,
      email: user.email,
      customerId,
      priceId,
      successUrl: `${appUrl}/dashboard?upgraded=true`,
      cancelUrl: `${appUrl}/pricing?interval=${interval}`,
      metadata: { plan, interval },
    })

    if (!checkoutSession.url) {
      return NextResponse.json({ error: 'Checkout session could not be created' }, { status: 500 })
    }

    await prisma.eventLog.create({
      data: {
        userId: user.id,
        eventType: 'checkout_started',
        meta: {
          plan,
          interval,
          priceId,
          customerId,
        },
      },
    }).catch((error) => {
      console.warn('checkout_started_log_failed', {
        userId: user.id,
        error: error instanceof Error ? error.message : String(error),
      })
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
