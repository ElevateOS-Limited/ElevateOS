import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe/stripe'
import { createCheckoutSession } from '@/lib/stripe'

type CheckoutUser = {
  id: string
  email: string | null
  name: string | null
  stripeCustomerId: string | null
}

export async function ensureStripeCustomerId(user: CheckoutUser) {
  if (!user.email) {
    throw new Error('Missing account email')
  }

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

  return customerId
}

export async function createPaidCheckoutSession(params: {
  user: CheckoutUser
  priceId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
  eventType?: string
  eventMeta?: Record<string, unknown>
}) {
  const customerId = await ensureStripeCustomerId(params.user)
  if (!params.user.email) {
    throw new Error('Missing account email')
  }
  const checkoutSession = await createCheckoutSession({
    userId: params.user.id,
    email: params.user.email,
    customerId,
    priceId: params.priceId,
    successUrl: params.successUrl,
    cancelUrl: params.cancelUrl,
    metadata: params.metadata,
  })

  if (!checkoutSession.url) {
    return { url: null, customerId }
  }

  if (params.eventType) {
    await prisma.eventLog
      .create({
        data: {
          userId: params.user.id,
          eventType: params.eventType,
          meta: {
            ...(params.eventMeta ?? {}),
            customerId,
          },
        },
      })
      .catch((error) => {
        console.warn(`${params.eventType}_log_failed`, {
          userId: params.user.id,
          error: error instanceof Error ? error.message : String(error),
        })
      })
  }

  return { url: checkoutSession.url, customerId }
}
