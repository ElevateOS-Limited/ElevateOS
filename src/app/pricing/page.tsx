'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react'
import toast from '@/lib/toast'
import {
  BILLING_PLAN_ORDER,
  BILLING_PLANS,
  type BillingInterval,
  type BillingPlan,
  type BillingPlanId,
} from '@/lib/billing/plans'

const intervalOptions: Array<{
  id: BillingInterval
  label: string
  note: string
}> = [
  { id: 'monthly', label: 'Monthly', note: 'Flexible billing' },
  { id: 'yearly', label: 'Yearly', note: '2 months free' },
]

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function formatPrice(price: number) {
  return price === 0 ? '$0' : money.format(price)
}

function getActionLabel(plan: BillingPlan, currentRank: number, hasSession: boolean) {
  const planRank = BILLING_PLAN_ORDER[plan.id]

  if (plan.id === 'FREE') {
    if (currentRank > planRank) return 'Included in your plan'
    if (currentRank === planRank && hasSession) return 'Current plan'
    return plan.cta
  }

  if (currentRank > planRank) return 'Included in your plan'
  if (currentRank === planRank && hasSession) return 'Current plan'
  if (plan.id === 'PRO') return 'Start Pro trial'
  return 'Start Elite trial'
}

function IntervalToggle({
  interval,
  onChange,
}: {
  interval: BillingInterval
  onChange: (interval: BillingInterval) => void
}) {
  return (
    <div className="inline-flex rounded-full border border-slate-900/10 bg-white/75 p-1 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
      {intervalOptions.map((option) => {
        const selected = interval === option.id
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              selected
                ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/10 dark:bg-white dark:text-slate-950'
                : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            <span className="block">{option.label}</span>
            <span className={`block text-[11px] font-medium ${selected ? 'text-white/70 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>
              {option.note}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function PlanCard({
  plan,
  interval,
  currentRank,
  hasSession,
  pendingPlan,
  onCheckout,
}: {
  plan: BillingPlan
  interval: BillingInterval
  currentRank: number
  hasSession: boolean
  pendingPlan: BillingPlanId | null
  onCheckout: (planId: BillingPlanId) => Promise<void>
}) {
  const price = interval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
  const planRank = BILLING_PLAN_ORDER[plan.id]
  const isFeatured = plan.featured
  const isDark = plan.id === 'ELITE'
  const isPending = pendingPlan === plan.id
  const actionLabel = getActionLabel(plan, currentRank, hasSession)
  const isIncluded = currentRank > planRank
  const isCurrent = currentRank === planRank && hasSession

  return (
    <article
      className={`relative flex h-full flex-col rounded-[2rem] border p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/5 ${
        isDark
          ? 'border-slate-950 bg-slate-950 text-white shadow-2xl shadow-slate-950/15 dark:border-white/10'
          : isFeatured
            ? 'border-slate-950/15 bg-white dark:border-white/10 dark:bg-white/5'
            : 'border-slate-900/10 bg-white/85 dark:border-white/10 dark:bg-white/5'
      }`}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-6">
          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${isDark ? 'bg-white text-slate-950' : 'bg-[#f2c06d]/20 text-[#9a5b00] dark:text-[#f5d59f]'}`}>
            {plan.badge}
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-white/50' : 'text-[#d97706]'}`}>
            {plan.id === 'FREE' ? 'Starter' : 'Paid plan'}
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{plan.name}</h2>
        </div>
        {plan.id !== 'FREE' && <Star className={`h-5 w-5 ${isFeatured ? 'text-[#d97706]' : 'text-white/70'}`} />}
      </div>

      <p className={`mt-4 text-sm leading-7 ${isDark ? 'text-white/72' : 'text-slate-600 dark:text-slate-300'}`}>{plan.description}</p>

      <div className="mt-6 flex items-end gap-2">
        <p className="text-5xl font-semibold tracking-tight">{formatPrice(price)}</p>
        <div className="pb-1">
          <p className={`text-sm font-semibold ${isDark ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>/{interval}</p>
          {plan.id !== 'FREE' && (
            <p className={`text-xs ${isDark ? 'text-white/45' : 'text-slate-500 dark:text-slate-400'}`}>7-day trial included</p>
          )}
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className={`flex items-start gap-3 text-sm ${isDark ? 'text-white/80' : 'text-slate-600 dark:text-slate-300'}`}>
            <CheckCircle2 className={`mt-0.5 h-4 w-4 flex-shrink-0 ${isDark ? 'text-[#f2c06d]' : 'text-[#d97706]'}`} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        {plan.id === 'FREE' ? (
          isCurrent || isIncluded ? (
            <button
              type="button"
              disabled
              className="inline-flex w-full items-center justify-center rounded-full border border-slate-900/10 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/55"
            >
              {actionLabel}
            </button>
          ) : (
            <Link
              href={hasSession ? '/dashboard' : '/auth/signup?from=pricing'}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white"
            >
              {actionLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )
        ) : isCurrent || isIncluded ? (
          <button
            type="button"
            disabled
            className="inline-flex w-full items-center justify-center rounded-full border border-slate-900/10 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/55"
          >
            {actionLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void onCheckout(plan.id)}
            disabled={isPending}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
              isDark
                ? 'bg-white text-slate-950 hover:opacity-95'
                : 'bg-slate-950 text-white hover:-translate-y-0.5 dark:bg-white dark:text-slate-950'
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {isPending ? 'Redirecting...' : actionLabel}
            {!isPending && <ArrowRight className="h-4 w-4" />}
          </button>
        )}
      </div>
    </article>
  )
}

function FeatureStrip() {
  const items = [
    {
      icon: Sparkles,
      title: 'More capacity',
      text: 'Paid plans remove the manual limits that slow down study practice and admissions work.',
    },
    {
      icon: ShieldCheck,
      title: 'More context',
      text: 'Plans stay tied to the same profile, goals, and weekly availability inside one workspace.',
    },
    {
      icon: Zap,
      title: 'More support',
      text: 'Elite is for families and tutors who need deeper review instead of generic outputs.',
    },
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="rounded-[1.5rem] border border-slate-900/10 bg-white/80 p-5 backdrop-blur dark:border-white/10 dark:bg-white/5">
            <item.icon className="h-5 w-5 text-[#d97706]" />
            <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default function PricingPage() {
  const { data: session } = useSession()
  const [interval, setInterval] = useState<BillingInterval>('yearly')
  const [pendingPlan, setPendingPlan] = useState<BillingPlanId | null>(null)

  const currentPlan = ((session?.user?.plan as BillingPlanId | undefined) ?? 'FREE').toUpperCase() as BillingPlanId
  const currentRank = BILLING_PLAN_ORDER[currentPlan] ?? 0
  const hasSession = Boolean(session?.user?.id)

  const handleCheckout = async (plan: BillingPlanId) => {
    if (!hasSession) {
      window.location.href = '/auth/signup?from=pricing'
      return
    }

    setPendingPlan(plan)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, interval }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Checkout failed')
      }

      if (!data?.url) {
        throw new Error('Checkout link was not returned')
      }

      window.location.assign(data.url)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Checkout failed')
    } finally {
      setPendingPlan(null)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8f5ef] text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[#f2c06d]/20 blur-3xl" />
        <div className="absolute right-[-8rem] top-28 h-80 w-80 rounded-full bg-slate-950/10 blur-3xl dark:bg-white/8" />
      </div>

      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-[#f8f5ef] shadow-lg shadow-slate-950/10 dark:bg-white dark:text-slate-950">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="font-display text-lg text-slate-950 dark:text-white">ElevateOS</p>
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Billing / Plan</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="hidden rounded-full border border-slate-900/10 bg-white/75 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white sm:inline-flex"
          >
            Open demo
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-[#f8f5ef] transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
          >
            Create account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="relative pb-20">
        <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:pt-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/75 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <CreditCard className="h-4 w-4 text-[#d97706]" />
              Flexible billing for students, tutors, and families
            </div>

            <h1 className="font-display mt-6 text-5xl leading-[0.95] tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
              Pick the level of support that matches how you work.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Free is enough to explore the workspace. Pro handles the core study workflow. Elite adds higher-touch support
              for tutors, parents, and students who want a more guided setup.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <IntervalToggle interval={interval} onChange={setInterval} />
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/75 px-4 py-2 text-sm text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <BadgeCheck className="h-4 w-4 text-[#d97706]" />
                All paid plans include a 7-day trial.
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:pt-12">
          <div className="grid gap-5 lg:grid-cols-3">
            {BILLING_PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                interval={interval}
                currentRank={currentRank}
                hasSession={hasSession}
                pendingPlan={pendingPlan}
                onCheckout={handleCheckout}
              />
            ))}
          </div>
        </section>

        <FeatureStrip />

        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-[2rem] border border-slate-900/10 bg-slate-950 px-7 py-8 text-white shadow-2xl shadow-slate-950/10 dark:border-white/10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-[#f2c06d]">Need a reset?</p>
                <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">Open the dashboard and keep the same workspace.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72">
                  Your plan, profile, and weekly context stay in the same place, so upgrading never means rebuilding the setup.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
                >
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
