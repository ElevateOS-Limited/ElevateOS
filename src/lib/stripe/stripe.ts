import Stripe from 'stripe'

let stripeClient: Stripe | null = null

function resolveStripeSecretKey() {
  const key = (process.env.STRIPE_SECRET_KEY || '').trim()
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return key
}

export function getStripe() {
  if (!stripeClient) {
    stripeClient = new Stripe(resolveStripeSecretKey(), {})
  }

  return stripeClient
}
