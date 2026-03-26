import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'
import { getSessionOrDemo } from '@/lib/auth/session'
import { getAppUrl } from '@/lib/app-url'

const PRICE_MAP: Record<string, string> = {
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
  premium_monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
  premium_yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || '',
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrDemo()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { priceId, yearly } = await request.json()
    const key = `${priceId}${yearly ? '_yearly' : ''}`
    const stripePrice = PRICE_MAP[key]

    if (!stripePrice) {
      return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 })
    }

    const appUrl = getAppUrl(new URL(request.url).origin)
    const checkoutSession = await createCheckoutSession({
      userId: session.user.id,
      email: session.user.email!,
      priceId: stripePrice,
      successUrl: `${appUrl}/dashboard?upgraded=true`,
      cancelUrl: `${appUrl}/pricing`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
