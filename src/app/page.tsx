import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Brain,
  CalendarRange,
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'

const workflows = [
  {
    icon: Brain,
    title: 'Study Support',
    description: 'Turn notes and uploaded materials into summaries, flashcards, and next-step study plans.',
  },
  {
    icon: FileText,
    title: 'Practice Generation',
    description: 'Create worksheets, past-paper style practice, and quick revision material without leaving the dashboard.',
  },
  {
    icon: CalendarRange,
    title: 'Weekly Planning',
    description: 'Capture deadlines, blocked dates, and availability so work is scheduled around real constraints.',
  },
  {
    icon: TrendingUp,
    title: 'Progress Visibility',
    description: 'Track study consistency, weak areas, reviewed cards, and execution over time.',
  },
]

const audiences = [
  {
    icon: Users,
    title: 'Tutors',
    description: 'Keep session prep, assignments, study materials, and follow-up work in one place.',
  },
  {
    icon: Target,
    title: 'Students',
    description: 'Move from scattered notes to a clear weekly plan with practice and measurable progress.',
  },
  {
    icon: ShieldCheck,
    title: 'Families',
    description: 'Get a cleaner picture of what is planned, what is blocked, and what still needs attention.',
  },
]

const planComparison = [
  { label: 'Study notes, flashcards, and chat', free: true, pro: true, annual: true },
  { label: 'Worksheet and practice generation', free: true, pro: true, annual: true },
  { label: 'Past paper and advanced analytics', free: false, pro: true, annual: true },
  { label: 'Best annual pricing', free: false, pro: false, annual: true },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            ElevateOS
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/pricing" className="rounded-md border-2 border-gray-500 bg-white px-3 py-1 text-gray-800 hover:border-gray-700 hover:text-gray-900 dark:border-gray-400 dark:bg-transparent dark:text-gray-100 dark:hover:border-white dark:hover:text-white">
              Pricing
            </Link>
            <Link href="/auth/login" className="hidden rounded-lg px-4 py-2 font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white md:block">
              Sign in
            </Link>
            <Link href="/auth/signup" className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500">
              Start free
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            <BadgeCheck className="h-4 w-4" /> Built for real study workflows, not just a demo homepage
          </div>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">
            A focused workspace for study planning, tutoring, and weekly execution.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            ElevateOS helps students and tutors manage notes, practice, progress, deadlines, and planning in one place. Start with the core study workflow now, then layer on advanced modules as needed.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3 font-semibold text-white hover:bg-indigo-500">
              Create account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard" className="rounded-xl border border-gray-300 px-7 py-3 font-semibold text-gray-800 hover:border-indigo-500 dark:border-gray-700 dark:text-gray-200">
              Open dashboard
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {audiences.map((item) => (
            <div key={item.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
              <item.icon className="h-5 w-5 text-indigo-500" />
              <h2 className="mt-3 text-xl font-bold">{item.title}</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-gray-200 bg-gray-50 py-14 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">Core workflows</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600 dark:text-gray-300">
            The MVP is centered on four things: capture the material, generate useful practice, plan the week, and measure progress.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {workflows.map((workflow) => (
              <div key={workflow.title} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                <workflow.icon className="h-6 w-6 text-indigo-500" />
                <h3 className="mt-3 text-xl font-semibold">{workflow.title}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{workflow.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-gray-200 p-8 dark:border-gray-800">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Why teams keep it open</p>
            <ul className="mt-6 space-y-4">
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500" />
                <div>
                  <p className="font-semibold">One operational loop</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Profile, practice, planner, and progress live in the same workspace instead of across four tools.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500" />
                <div>
                  <p className="font-semibold">AI where it saves time</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Use AI to draft notes, questions, feedback, and recommendations, then keep execution grounded in your actual schedule.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500" />
                <div>
                  <p className="font-semibold">Fast to start, easy to extend</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Start with the free plan, then unlock deeper analytics and premium study modules only when the workflow justifies it.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-white">
            <h2 className="text-3xl font-bold">Simple pricing for the MVP</h2>
            <p className="mt-3 text-indigo-100">
              Free covers the core study loop. Paid plans add more capacity, deeper analytics, and premium modules.
            </p>
            <div className="mt-7 overflow-hidden rounded-2xl border border-white/30">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/20 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="p-4">Capability</th>
                    <th className="p-4">Free</th>
                    <th className="p-4">Pro</th>
                    <th className="p-4">Annual</th>
                  </tr>
                </thead>
                <tbody>
                  {planComparison.map((row) => (
                    <tr key={row.label} className="border-t border-white/20">
                      <td className="p-4">{row.label}</td>
                      <td className="p-4">{row.free ? <CheckCircle2 className="h-4 w-4" /> : '—'}</td>
                      <td className="p-4">{row.pro ? <CheckCircle2 className="h-4 w-4" /> : '—'}</td>
                      <td className="p-4">{row.annual ? <CheckCircle2 className="h-4 w-4" /> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/pricing" className="rounded-xl bg-white px-6 py-3 text-center font-bold text-indigo-700 hover:bg-indigo-50">
                View pricing
              </Link>
              <Link href="/auth/signup" className="rounded-xl border border-white/30 px-6 py-3 text-center font-semibold text-white hover:bg-white/10">
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-10 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4">
          <p>© 2026 ElevateOS. Study operations and tutoring workflows, delivered with privacy-first defaults.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> Privacy-first by design
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-4 w-4" /> Weekly measurable progress
            </span>
            <span className="inline-flex items-center gap-1">
              <BadgeCheck className="h-4 w-4" /> Built for IB/AP/SAT/ACT workflows
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-200">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-200">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
