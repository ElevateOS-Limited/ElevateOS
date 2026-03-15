import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const isDemoMode = process.env.DEMO_MODE === 'true' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export async function POST(req: Request) {
  if (isDemoMode) {
    return NextResponse.json({ received: true, mode: 'demo', stripe: 'disabled' })
  }

  const body = await req.text()
  const headerStore = await headers()
  const signature = headerStore.get('stripe-signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
  }

  const [{ stripe }, { prisma }] = await Promise.all([import('@/lib/stripe/stripe'), import('@/lib/prisma')])

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (e) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        await prisma.user.update({
          where: { stripeCustomerId: sub.customer as string },
          data: {
            stripeSubscriptionId: sub.id,
            stripePriceId: sub.items.data[0].price.id,
            subscriptionStatus: sub.status,
            subscriptionEnds: new Date(sub.current_period_end * 1000),
          },
        })
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await prisma.user.update({
          where: { stripeCustomerId: sub.customer as string },
          data: { stripeSubscriptionId: null, subscriptionStatus: 'canceled' },
        })
        break
      }
    }
    return NextResponse.json({ received: true })
  } catch (e) {
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
