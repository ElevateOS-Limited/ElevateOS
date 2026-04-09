import Link from 'next/link'
import { ArrowRight, CheckCircle2, ClipboardList, MessageSquareText, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { LeadCaptureForm } from '@/components/public/LeadCaptureForm'

const valueProps = [
  {
    icon: ClipboardList,
    title: 'Structured tutoring loop',
    copy: 'Tasks, submissions, feedback, and session notes stay connected instead of disappearing into chat threads.',
  },
  {
    icon: MessageSquareText,
    title: 'Parent visibility',
    copy: 'Families get concise updates that show what was covered, what is next, and where the student still needs support.',
  },
  {
    icon: Sparkles,
    title: 'AI only where it helps',
    copy: 'AI compresses tutor notes into usable summaries. It does not replace the tutor or the workflow.',
  },
]

const workflow = [
  'Lead captured or family onboarded',
  'User signs in and lands in the correct role view',
  'Tutor assigns work or logs a session note',
  'Student submits work and sees feedback',
  'Parent receives a clean progress summary',
  'The next session starts with context already in place',
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(245,201,111,.18),_transparent_30%),linear-gradient(180deg,#f8f5ef_0%,#ffffff_100%)] text-slate-950 dark:bg-slate-950 dark:text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6">
        <Link href="/home" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">ElevateOS</p>
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Tutoring execution system</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
          <a href="#workflow" className="hover:text-slate-950 dark:hover:text-white">Workflow</a>
          <a href="#parent-view" className="hover:text-slate-950 dark:hover:text-white">Parent view</a>
          <a href="#lead" className="hover:text-slate-950 dark:hover:text-white">Contact</a>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-full border border-slate-900/10 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:text-white">
            Login
          </Link>
          <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
            Start onboarding <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-24">
        <section className="grid gap-8 py-10 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:py-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <ShieldCheck className="h-4 w-4 text-[#9a5b00]" />
              Calm, structured tutoring for families who need clarity
            </div>

            <h1 className="font-display mt-6 max-w-3xl text-5xl leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Tutoring operations that parents can trust and students can actually follow.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              ElevateOS keeps tutoring work simple: assign the next step, capture the submission, review it once, and send a clean summary to the parent.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/onboarding" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">
                Request tutoring <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/tutors" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 backdrop-blur hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white">
                Tutor portal
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {valueProps.map((item) => (
                <article key={item.title} className="rounded-[1.4rem] border border-slate-900/10 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                  <item.icon className="h-5 w-5 text-[#9a5b00]" />
                  <h2 className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-700 dark:text-slate-100">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.copy}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/10 dark:border-white/10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f2c06d]">What the workflow looks like</p>
            <div className="mt-5 space-y-3">
              {workflow.map((item, index) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f2c06d]/15 text-sm font-semibold text-[#f5d59f]">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-white/80">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">Why parents stay engaged</p>
              <p className="mt-2 text-sm leading-7 text-white/72">
                They do not need a crowded dashboard. They need one readable summary that shows progress, weak spots, homework, and the next action.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 py-8 md:grid-cols-3">
          {[
            ['Students', 'A clear answer to “what do I do now?” with deadlines, instructions, and feedback in one place.'],
            ['Parents', 'A calm summary that shows accountability without exposing every operational detail.'],
            ['Tutors', 'A compact workspace for assignments, review, session notes, and follow-up.'],
          ].map(([title, copy]) => (
            <article key={title} className="rounded-[1.8rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <CheckCircle2 className="h-5 w-5 text-[#9a5b00]" />
              <h2 className="mt-4 text-2xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{copy}</p>
            </article>
          ))}
        </section>

        <section id="parent-view" className="grid gap-5 py-8 lg:grid-cols-[.95fr_1.05fr] lg:items-start">
          <article className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Parent visibility</p>
            <h2 className="mt-3 text-3xl font-semibold">No jargon. No clutter. Just the essentials.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              The first version focuses on a clean family update: what happened in the session, what the student should do next, and where attention is needed.
            </p>
            <div className="mt-5 space-y-3 text-sm text-slate-700 dark:text-slate-200">
              {[
                'Topics covered',
                'Strengths and weak points',
                'Homework assigned',
                'Progress note',
                'Parent-ready summary text',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-900/10 bg-[#f8f5ef] px-4 py-3 dark:border-white/10 dark:bg-white/5">
                  {item}
                </div>
              ))}
            </div>
          </article>

          <article id="lead" className="rounded-[2rem] border border-slate-900/10 bg-[#f8f5ef] p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/60">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Get in touch</p>
            <h2 className="mt-3 text-3xl font-semibold">Tell us who needs support</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Use this for tutoring inquiries, onboarding, or a simple parent intro. We keep the first contact short.
            </p>
            <LeadCaptureForm source="home" className="mt-5" />
          </article>
        </section>
      </main>
    </div>
  )
}
