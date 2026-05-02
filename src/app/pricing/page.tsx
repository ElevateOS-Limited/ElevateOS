import Link from 'next/link'
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { BILLING_PLANS } from '@/lib/billing/plans'

const highlights = [
  'Demo access is public and does not require a login.',
  'Free sign-up starts the student workspace without a payment step.',
  'Paid plans route through the normal sign-in and checkout flow.',
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(245,201,111,.18),_transparent_28%),linear-gradient(180deg,#f8f5ef_0%,#ffffff_100%)] text-slate-950 dark:bg-slate-950 dark:text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">ElevateOS</p>
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Pricing</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
          <Link href="/demo" className="hover:text-slate-950 dark:hover:text-white">
            Demo
          </Link>
          <Link href="/dashboard" className="hover:text-slate-950 dark:hover:text-white">
            Workspace
          </Link>
          <Link href="/login" className="hover:text-slate-950 dark:hover:text-white">
            Login
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/demo" className="rounded-full border border-slate-900/10 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:text-white">
            Open demo
          </Link>
          <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <section className="grid gap-8 py-10 lg:grid-cols-[1.08fr_.92fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <ShieldCheck className="h-4 w-4 text-[#9a5b00]" />
              Amber and slate pricing, matching the rest of the product
            </div>

            <h1 className="font-display mt-6 max-w-3xl text-5xl leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
              Pricing that keeps the demo visible and the upgrade path simple.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Start with the public demo, move into the free workspace, and upgrade only when the student actually needs the heavier workflow.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
              <Link href="/demo" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">
                Open the demo <Sparkles className="h-4 w-4" />
              </Link>
              <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/80 px-6 py-3 text-slate-700 backdrop-blur transition hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white">
                Start free
              </Link>
            </div>

            <div className="mt-8 space-y-3">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#9a5b00]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10 dark:border-white/10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2c06d]">Included in every plan</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                'Student profile and target schools',
                'Study assistant and worksheet generation',
                'Progress tracking and admissions planning',
                'Planner and weekly activity blocks',
              ].map((item) => (
                <div key={item} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/80">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {BILLING_PLANS.map((plan) => {
            const isFeatured = 'featured' in plan && Boolean(plan.featured)
            const ctaHref =
              plan.id === 'FREE'
                ? '/auth/signup'
                : plan.id === 'PRO'
                  ? '/onboarding?role=student'
                  : '/onboarding?role=tutor'

            return (
              <article
                key={plan.id}
                className={[
                  'rounded-[2rem] border p-6 shadow-sm',
                  isFeatured
                    ? 'border-[#f2c06d]/50 bg-[#fff7e6] dark:border-[#f2c06d]/20 dark:bg-white/5'
                    : 'border-slate-900/10 bg-white/90 dark:border-white/10 dark:bg-white/5',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">{plan.id === 'FREE' ? 'Starter' : plan.badge || 'Plan'}</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{plan.name}</h2>
                  </div>
                  {isFeatured ? (
                    <span className="rounded-full border border-[#f2c06d]/40 bg-[#f8f0d6] px-3 py-1 text-xs font-semibold text-[#8a5a00]">
                      Most popular
                    </span>
                  ) : null}
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{plan.description}</p>

                <div className="mt-6 border-y border-slate-900/10 py-5 dark:border-white/10">
                  <div className="flex items-end gap-2">
                    <p className="text-4xl font-semibold text-slate-950 dark:text-white">
                      ${plan.monthlyPrice}
                    </p>
                    <p className="pb-1 text-sm text-slate-500 dark:text-slate-400">/mo</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    ${plan.yearlyPrice}/yr or equivalent checkout after sign-in.
                  </p>
                </div>

                <div className="mt-5 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-200">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#9a5b00]" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={ctaHref}
                  className={[
                    'mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5',
                    isFeatured
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                      : 'border border-slate-900/10 bg-white text-slate-700 hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white',
                  ].join(' ')}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            )
          })}
        </section>
      </main>
    </div>
  )
}
