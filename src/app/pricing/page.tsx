'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Check, BookOpen } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

const plans = [
  {
    name: 'Free',
    price: 0,
    period: null,
    features: ['5 AI study sessions/month', '3 worksheet generations/month', 'Student profile + planner', 'Platform chatbot', 'Community access'],
    cta: 'Get Started Free',
    href: '/auth/signup',
    gradient: false,
  },
  {
    name: 'Pro',
    price: 19,
    period: '/month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID,
    features: ['Unlimited AI study sessions', 'Unlimited worksheets', 'Past paper simulations', 'Admissions workspace', 'Internship recommender', 'Priority AI responses', 'Export to PDF'],
    cta: 'Start Free Trial',
    gradient: true,
  },
  {
    name: 'Pro Yearly',
    price: 149,
    period: '/year',
    priceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID,
    badge: 'Save 35%',
    features: ['Everything in Pro', '2 months free', 'Priority email support', 'Early feature access', 'Best value for ongoing tutoring'],
    cta: 'Start Free Trial',
    gradient: false,
  },
]

export default function PricingPage() {
  const { data: session } = useSession()
  const [siteVariant, setSiteVariant] = useState<'main' | 'tutoring'>('main')

  useEffect(() => {
    const host = window.location.hostname.toLowerCase()
    setSiteVariant(host === 'tutoring.elevateos.org' || host.startsWith('tutoring.') ? 'tutoring' : 'main')
  }, [])

  const planSet = plans.map((plan) => {
    if (plan.name === 'Pro') {
      return {
        ...plan,
        features:
          siteVariant === 'tutoring'
            ? ['Unlimited AI study sessions', 'Unlimited worksheets', 'Past paper simulations', 'Weekly planning tools', 'PDF exports', 'Priority AI responses']
            : plan.features,
      }
    }

    if (plan.name === 'Pro Yearly') {
      return {
        ...plan,
        features:
          siteVariant === 'tutoring'
            ? ['Everything in Pro', '2 months free', 'Priority email support', 'Early access to study tools', 'Best value for tutoring programs']
            : plan.features,
      }
    }

    return plan
  })

  const checkoutMutation = useMutation({
    mutationFn: (priceId: string) => fetch('/api/stripe/create-checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ priceId }),
    }).then(r => r.json()),
    onSuccess: (data) => { if (data.url) window.location.href = data.url },
    onError: () => toast.error('Checkout failed'),
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">ElevateOS</span>
          </Link>
          <h1 className="text-5xl font-bold mb-4">{siteVariant === 'tutoring' ? 'Simple pricing for tutoring workflows' : 'Simple pricing for study operations'}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {siteVariant === 'tutoring'
              ? 'Start free, then upgrade when you need more practice, planning, and progress capacity.'
              : 'Start free, upgrade when you need more practice, planning, and analytics capacity'}
          </p>
          <p className="text-sm text-green-600 mt-2 font-medium">7-day free trial on all paid plans · Cancel anytime</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {planSet.map((plan) => (
            <div key={plan.name} className={`relative bg-white dark:bg-gray-900 rounded-2xl border-2 p-8 ${plan.gradient ? 'border-indigo-500 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30' : 'border-gray-200 dark:border-gray-800'}`}>
              {plan.gradient && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-full">MOST POPULAR</span>
                </div>
              )}
              {plan.badge && (
                <div className="absolute -top-3 right-6">
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">{plan.badge}</span>
                </div>
              )}
              <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                {plan.period && <span className="text-gray-500">{plan.period}</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.href ? (
                <Link href={plan.href} className={`block w-full text-center py-3 rounded-xl font-semibold transition-all ${plan.gradient ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90' : 'border-2 border-gray-300 dark:border-gray-700 hover:border-indigo-500 text-gray-700 dark:text-gray-300'}`}>
                  {plan.cta}
                </Link>
              ) : (
                <button
                  onClick={() => { if (!session) { window.location.href = '/auth/signup'; return } if (plan.priceId) checkoutMutation.mutate(plan.priceId as string) }}
                  disabled={checkoutMutation.isPending}
                  className={`w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-50 ${plan.gradient ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90' : 'border-2 border-gray-300 dark:border-gray-700 hover:border-indigo-500 text-gray-700 dark:text-gray-300'}`}>
                  {checkoutMutation.isPending ? 'Loading...' : plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link href="/terms" className="hover:underline">Terms</Link>
          {' · '}
          <Link href="/privacy" className="hover:underline">Privacy</Link>
        </div>
      </div>
    </div>
  )
}
