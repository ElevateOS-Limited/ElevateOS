import { getStripe } from '@/lib/stripe/stripe'

export async function createCheckoutSession(params: {
  userId: string
  email: string
  priceId: string
  successUrl: string
  cancelUrl: string
  customerId?: string
  metadata?: Record<string, string>
}) {
  const session = await getStripe().checkout.sessions.create({
    ...(params.customerId
      ? { customer: params.customerId }
      : { customer_email: params.email }),
    client_reference_id: params.userId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    subscription_data: {
      trial_period_days: 7,
      metadata: {
        userId: params.userId,
        ...(params.metadata ?? {}),
      },
    },
  })
  return session
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  return getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}
