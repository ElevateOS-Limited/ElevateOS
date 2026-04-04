import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { getAppUrl } from '@/lib/app-url'
import { z } from 'zod'
import { createPaidCheckoutSession } from '@/lib/billing/checkout'

const checkoutSchema = z.object({
  priceId: z.string().min(1),
})

export async function POST(req: Request) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const parsed = checkoutSchema.safeParse(await req.json().catch(() => ({})))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid checkout request' }, { status: 400 })
    }

    const { priceId } = parsed.data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, stripeCustomerId: true },
    })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (!user.email) return NextResponse.json({ error: 'Missing account email' }, { status: 400 })

    const appUrl = getAppUrl(req)
    const checkoutSession = await createPaidCheckoutSession({
      user,
      priceId,
      successUrl: `${appUrl}/dashboard?success=true`,
      cancelUrl: `${appUrl}/pricing?canceled=true`,
      eventType: 'checkout_started',
      eventMeta: {
        priceId,
        source: 'create-checkout',
      },
    })

    if (!checkoutSession.url) {
      return NextResponse.json({ error: 'Checkout session could not be created' }, { status: 500 })
    }

    return NextResponse.json({ url: checkoutSession.url })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
