import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, ClipboardList, MessageSquareText, Users } from 'lucide-react'
import { getSessionOrDemo } from '@/lib/auth/session'
import { getRoleHomePath } from '@/lib/auth/routes'
import { LeadCaptureForm } from '@/components/public/LeadCaptureForm'
import { OnboardingRolePicker } from '@/components/public/OnboardingRolePicker'
import { leadInterestValues } from '@/lib/tutoring/contracts'

type OnboardingPageProps = {
  searchParams?: Promise<{
    role?: string
  }>
}

const steps = [
  'Tell us who needs support and what subject matters most.',
  'We route the family to the correct role view and intake path.',
  'Tutor notes, student tasks, and parent summaries stay connected in one flow.',
]

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const session = await getSessionOrDemo()
  const params = await searchParams

  // Authenticated users with a real role already are sent home immediately.
  if (session?.user?.id && session.user.role && session.user.role !== 'USER') {
    redirect(getRoleHomePath(session.user.role))
  }

  const requestedRole = (params?.role || 'parent').toLowerCase()
  const defaultRoleInterest = leadInterestValues.includes(requestedRole as (typeof leadInterestValues)[number])
    ? (requestedRole as (typeof leadInterestValues)[number])
    : 'parent'

  // Authenticated user with no role assigned yet → show role picker.
  if (session?.user?.id) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(245,201,111,.16),_transparent_28%),linear-gradient(180deg,#f8f5ef_0%,#ffffff_100%)] px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-white">
        <div className="mx-auto max-w-3xl">
          <header className="flex flex-col gap-4 rounded-[2rem] border border-slate-900/10 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Almost there</p>
              <h1 className="font-display mt-2 text-3xl tracking-tight">Choose how you want to use ElevateOS.</h1>
            </div>
          </header>

          <OnboardingRolePicker className="mt-5" />
        </div>
      </div>
    )
  }

  // Unauthenticated → show lead capture form.
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(245,201,111,.16),_transparent_28%),linear-gradient(180deg,#f8f5ef_0%,#ffffff_100%)] px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-slate-900/10 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Onboarding</p>
            <h1 className="font-display mt-2 text-4xl tracking-tight">Set the tutoring relationship up once, then keep the workflow simple.</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/login" className="rounded-full border border-slate-900/10 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:text-white">
              Login
            </Link>
            <Link href="/home" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
              Back home <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <section className="grid gap-5 py-8 lg:grid-cols-[1fr_.95fr]">
          <article className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/10 dark:border-white/10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f2c06d]">Role selection</p>
            <h2 className="mt-3 text-3xl font-semibold">Choose the role that matches the real workflow.</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ['student', 'Student', 'Tasks, deadlines, submissions, and feedback.'],
                ['parent', 'Parent', 'Concise weekly summaries and next actions.'],
                ['tutor', 'Tutor', 'Assign, review, note, and report.'],
                ['other', 'Other', 'Use if you are coordinating the family intake.'],
              ].map(([role, title, copy]) => (
                <Link
                  key={role}
                  href={`/onboarding?role=${role}`}
                  className={`rounded-[1.5rem] border px-4 py-4 transition hover:-translate-y-0.5 ${
                    role === defaultRoleInterest
                      ? 'border-[#f2c06d]/70 bg-[#f2c06d]/15'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold">{title}</h3>
                    <Users className="h-4 w-4 text-[#f2c06d]" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/72">{copy}</p>
                </Link>
              ))}
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">How it works</p>
              <div className="mt-4 grid gap-3">
                {steps.map((step, index) => (
                  <div key={step} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f2c06d]/15 text-sm font-semibold text-[#f5d59f]">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-6 text-white/80">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-900/10 bg-[#f8f5ef] p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Book your free trial lesson</p>
            <h2 className="mt-3 text-3xl font-semibold">Tell us the subject and the support level.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              We only need enough to match you with the right tutor. No long intake forms.
            </p>

            <div className="mt-5 rounded-[1.5rem] border border-slate-900/10 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-950/40">
              <LeadCaptureForm source="onboarding" defaultRoleInterest={defaultRoleInterest} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: ClipboardList,
                  title: 'Intake stays short',
                  copy: 'We only ask for the information needed to route the family correctly.',
                },
                {
                  icon: MessageSquareText,
                  title: 'Communication stays clear',
                  copy: 'Parent-facing summaries are concise enough to read in one pass.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-[1.4rem] border border-slate-900/10 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-950/40">
                  <item.icon className="h-5 w-5 text-[#9a5b00]" />
                  <h3 className="mt-3 text-sm font-semibold uppercase tracking-[0.18em]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.copy}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </div>
  )
}
