import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getStripe } from '@/lib/stripe/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { getStripeWebhookRecord, markStripeWebhookStatus } from '@/lib/stripe/webhook-events'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing stripe signature or webhook secret' }, { status: 400 })
  }
  const stripe = getStripe()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const existing = await getStripeWebhookRecord(event.id)
  if (existing?.status === 'processed') {
    return NextResponse.json({ received: true, replay: true })
  }

  await markStripeWebhookStatus(event.id, event.type, 'received')

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
            subscriptionEnds: sub.items.data[0]?.current_period_end
              ? new Date(sub.items.data[0].current_period_end * 1000)
              : null,
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
    await markStripeWebhookStatus(event.id, event.type, 'processed')
    return NextResponse.json({ received: true })
  } catch (e: any) {
    await markStripeWebhookStatus(event.id, event.type, 'failed', e?.message || 'unknown_error')
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
