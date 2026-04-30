'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { CheckCircle2, BookOpen, ArrowRight, ShieldCheck, Clock3, BadgeCheck } from 'lucide-react'
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
    highlight: false,
  },
  {
    name: 'Pro',
    price: 19,
    period: '/month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID,
    features: ['Unlimited AI study sessions', 'Unlimited worksheets', 'Past paper simulations', 'Admissions workspace', 'Internship recommender', 'Priority AI responses', 'Export to PDF'],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Pro Yearly',
    price: 149,
    period: '/year',
    priceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID,
    badge: 'Save 35%',
    features: ['Everything in Pro', '2 months free', 'Priority email support', 'Early feature access', 'Best value for ongoing tutoring'],
    cta: 'Start Free Trial',
    highlight: false,
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
    <div className="min-h-screen overflow-x-hidden bg-[#f8f5ef] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[#f2c06d]/25 blur-3xl" />
        <div className="absolute right-[-8rem] top-32 h-80 w-80 rounded-full bg-slate-900/10 blur-3xl dark:bg-[#1f2f54]/40" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-900/5 bg-[#f8f5ef]/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-[#f8f5ef] dark:bg-white dark:text-slate-950">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-lg text-slate-950 dark:text-white">ElevateOS</p>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Pricing</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/demo" className="hidden rounded-full border border-slate-900/10 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:text-white sm:inline-flex">
              See demo
            </Link>
            <Link href="/auth/signup" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-[#f8f5ef] transition-transform hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d97706] mb-3">Pricing</p>
          <h1 className="font-display text-4xl tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            {siteVariant === 'tutoring' ? 'Simple pricing for tutoring workflows' : 'Simple pricing for study operations'}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300">
            {siteVariant === 'tutoring'
              ? 'Start free, then upgrade when you need more practice, planning, and progress capacity.'
              : 'Start free, upgrade when you need more practice, planning, and analytics capacity.'}
          </p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50/60 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-900/10 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            7-day free trial on all paid plans · Cancel anytime
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {planSet.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-[2rem] border p-7 transition-transform hover:-translate-y-1 ${
                plan.highlight
                  ? 'border-[#d97706]/30 bg-white shadow-xl shadow-[#d97706]/5 dark:border-[#d97706]/30 dark:bg-slate-900/80'
                  : 'border-slate-900/10 bg-white/80 dark:border-white/10 dark:bg-white/5'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[#d97706] px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-[#d97706]/20">
                    Most popular
                  </span>
                </div>
              )}
              {plan.badge && (
                <div className="absolute -top-3.5 right-6">
                  <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">{plan.badge}</span>
                </div>
              )}

              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{plan.name}</h2>
              <div className="mt-3 mb-6">
                <span className="text-4xl font-semibold text-slate-950 dark:text-white">${plan.price}</span>
                {plan.period && <span className="text-sm text-slate-500 dark:text-slate-400">{plan.period}</span>}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-[#d97706] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.href ? (
                <Link
                  href={plan.href}
                  className={`block w-full text-center rounded-xl py-3 text-sm font-semibold transition-all ${
                    plan.highlight
                      ? 'bg-slate-950 text-white hover:opacity-90 dark:bg-white dark:text-slate-950'
                      : 'border border-slate-900/10 text-slate-700 hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  onClick={() => { if (!session) { window.location.href = '/auth/signup'; return } if (plan.priceId) checkoutMutation.mutate(plan.priceId as string) }}
                  disabled={checkoutMutation.isPending}
                  className={`w-full rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-50 ${
                    plan.highlight
                      ? 'bg-slate-950 text-white hover:opacity-90 dark:bg-white dark:text-slate-950'
                      : 'border border-slate-900/10 text-slate-700 hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:text-white'
                  }`}
                >
                  {checkoutMutation.isPending ? 'Loading...' : plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer links */}
        <div className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link href="/terms" className="hover:text-slate-950 dark:hover:text-white">Terms</Link>
          {' · '}
          <Link href="/privacy" className="hover:text-slate-950 dark:hover:text-white">Privacy</Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/10 bg-white/60 py-10 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-slate-950 dark:text-white">ElevateOS</p>
            <p className="mt-1">Study systems, tutoring support, and progress tracking on one workspace.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#d97706]" /> Privacy-first</span>
            <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#d97706]" /> Weekly progress</span>
            <span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-[#d97706]" /> Built for tutoring</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
