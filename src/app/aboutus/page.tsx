import Link from 'next/link'
import { ArrowRight, ShieldCheck, Users, Sparkles, ClipboardList } from 'lucide-react'

const principles = [
  {
    icon: ShieldCheck,
    title: 'Trust first',
    copy: 'Families need a calm, transparent workflow. The product should reduce uncertainty, not add another dashboard.',
  },
  {
    icon: ClipboardList,
    title: 'Execution over features',
    copy: 'The MVP exists to move tutoring work forward: assign, submit, review, summarize, and keep history.',
  },
  {
    icon: Sparkles,
    title: 'AI is support',
    copy: 'AI helps compress notes and report writing. It does not become the product.',
  },
]

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f5ef_0%,#ffffff_100%)] px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">About us</p>
            <h1 className="font-display mt-2 text-4xl tracking-tight">Built for a tutoring business, not a feature showcase.</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
              Start onboarding <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/home" className="rounded-full border border-slate-900/10 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:text-white">
              Home
            </Link>
          </div>
        </header>

        <section className="grid gap-5 py-8 lg:grid-cols-[1fr_.95fr]">
          <article className="rounded-[2rem] border border-slate-900/10 bg-[#f8f5ef] p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Our focus</p>
            <h2 className="mt-3 text-3xl font-semibold">A small, clear tutoring execution system for families who want structure.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              ElevateOS is being shaped around real tutoring operations: lead intake, role routing, student tasks, tutor feedback, and parent summaries. Everything else is deferred until the core loop is reliable.
            </p>
          </article>

          <article className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/10 dark:border-white/10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f2c06d]">What we are not building</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-white/78">
              <p>Not a broad tutoring marketplace.</p>
              <p>Not a giant content platform.</p>
              <p>Not an autonomous AI tutor.</p>
              <p>Not a simulation or admissions engine.</p>
              <p>Not a billing-heavy product before the service works.</p>
            </div>
          </article>
        </section>

        <section className="grid gap-5 py-5 md:grid-cols-3">
          {principles.map((item) => (
            <article key={item.title} className="rounded-[1.8rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <item.icon className="h-5 w-5 text-[#9a5b00]" />
              <h3 className="mt-4 text-2xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.copy}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}
