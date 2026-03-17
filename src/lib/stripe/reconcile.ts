import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe/stripe'

type ReconcileOptions = {
  userId?: string
  applyUpdates?: boolean
}

export async function reconcileStripeState(options: ReconcileOptions = {}) {
  const users = await prisma.user.findMany({
    where: {
      ...(options.userId ? { id: options.userId } : {}),
      OR: [{ stripeCustomerId: { not: null } }, { stripeSubscriptionId: { not: null } }],
    },
    select: {
      id: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      subscriptionStatus: true,
      stripePriceId: true,
      subscriptionEnds: true,
    },
    take: options.userId ? 1 : 200,
  })

  const mismatches: Array<Record<string, unknown>> = []
  let updated = 0

  for (const user of users) {
    const customerId = user.stripeCustomerId || undefined
    const subscriptionId = user.stripeSubscriptionId || undefined
    if (!customerId && !subscriptionId) continue

    let stripeSub: any = null
    try {
      if (subscriptionId) {
        stripeSub = await stripe.subscriptions.retrieve(subscriptionId)
      } else if (customerId) {
        const list = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 1 })
        stripeSub = list.data[0] || null
      }
    } catch (error) {
      mismatches.push({
        userId: user.id,
        reason: 'stripe_lookup_failed',
        error: error instanceof Error ? error.message : String(error),
      })
      continue
    }

    const target = {
      stripeSubscriptionId: stripeSub?.id ?? null,
      subscriptionStatus: stripeSub?.status ?? 'inactive',
      stripePriceId: stripeSub?.items?.data?.[0]?.price?.id ?? null,
      subscriptionEnds: stripeSub?.current_period_end ? new Date(stripeSub.current_period_end * 1000) : null,
    }

    const isMismatch =
      user.stripeSubscriptionId !== target.stripeSubscriptionId ||
      user.subscriptionStatus !== target.subscriptionStatus ||
      user.stripePriceId !== target.stripePriceId ||
      (user.subscriptionEnds?.toISOString() || null) !== (target.subscriptionEnds?.toISOString() || null)

    if (!isMismatch) continue

    mismatches.push({
      userId: user.id,
      before: {
        stripeSubscriptionId: user.stripeSubscriptionId,
        subscriptionStatus: user.subscriptionStatus,
        stripePriceId: user.stripePriceId,
        subscriptionEnds: user.subscriptionEnds,
      },
      after: target,
    })

    if (options.applyUpdates) {
      await prisma.user.update({
        where: { id: user.id },
        data: target,
      })
      updated += 1
    }
  }

  return {
    checked: users.length,
    mismatchCount: mismatches.length,
    updated,
    mismatches,
  }
}

export async function refreshUserStripeState(userId: string) {
  const report = await reconcileStripeState({ userId, applyUpdates: true })
  return report
}
