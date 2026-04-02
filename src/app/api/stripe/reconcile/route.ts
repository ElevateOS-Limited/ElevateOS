import { NextRequest, NextResponse } from 'next/server'
import { reconcileStripeState } from '@/lib/stripe/reconcile'

export async function POST(request: NextRequest) {
  const token = request.headers.get('x-reconcile-token')
  const expected = process.env.STRIPE_RECONCILE_TOKEN
  if (!expected || token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const applyUpdates = body?.applyUpdates !== false
  const report = await reconcileStripeState({ applyUpdates })
  return NextResponse.json(report)
}
