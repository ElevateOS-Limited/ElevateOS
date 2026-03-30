import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Brain,
  CheckCircle2,
  Cloud,
  Clock3,
  Database,
  FileText,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'

const featureBlocks = [
  {
    icon: Brain,
    title: 'Profile intelligence',
    desc: 'Turn grades, subjects, interests, and target universities into one practical roadmap.',
  },
  {
    icon: FileText,
    title: 'Study systems',
    desc: 'Generate notes, worksheets, and exam practice that actually match the curriculum.',
  },
  {
    icon: GraduationCap,
    title: 'Admissions planning',
    desc: 'Keep academics, activities, and essays in one workspace instead of scattered chats.',
  },
  {
    icon: Target,
    title: 'Execution tracking',
    desc: 'See what was completed, what slipped, and what needs attention this week.',
  },
]

const cloudStack = [
  ['Cloud Run', 'Vertex AI', 'Cloud SQL'],
  ['Cloud Storage', 'Logging', 'Monitoring'],
]

const comparison = [
  ['Weekly plan', 'Manual spreadsheets', 'Automated planning'],
  ['Practice materials', 'Copy-paste worksheets', 'Curriculum-aware generation'],
  ['Admissions strategy', 'Disconnected advice', 'One planning workspace'],
  ['Progress visibility', 'Scattered messages', 'Shared execution view'],
]

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f5ef] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[#f2c06d]/25 blur-3xl" />
        <div className="absolute right-[-8rem] top-32 h-80 w-80 rounded-full bg-slate-900/10 blur-3xl dark:bg-[#1f2f54]/40" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-slate-900/5 bg-[#f8f5ef]/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-[#f8f5ef] dark:bg-white dark:text-slate-950">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-lg text-slate-950 dark:text-white">ElevateOS</p>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">AI study systems</p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
            <a href="#product" className="hover:text-slate-950 dark:hover:text-white">Product</a>
            <a href="#cloud" className="hover:text-slate-950 dark:hover:text-white">Google Cloud</a>
            <a href="#plans" className="hover:text-slate-950 dark:hover:text-white">Plans</a>
            <a href="#audience" className="hover:text-slate-950 dark:hover:text-white">Who it serves</a>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/pricing" className="hidden rounded-full border border-slate-900/10 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:text-white sm:inline-flex">
              Pricing
            </Link>
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-[#f8f5ef] transition-transform hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">
              Open demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative">
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.15fr_.85fr] lg:pb-24 lg:pt-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <TrendingUp className="h-4 w-4 text-[#d97706]" />
              Built for students, tutors, and school teams that need clearer execution
            </div>

            <h1 className="font-display mt-6 text-5xl leading-[0.95] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
              An operating system for
              <span className="block bg-gradient-to-r from-slate-950 via-slate-700 to-[#d97706] bg-clip-text text-transparent dark:from-white dark:via-slate-200 dark:to-[#f2c06d]">
                academic execution and admissions.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              ElevateOS turns scattered study habits, profile building, and application planning into one
              focused workflow. It is designed for IB, AP, SAT, ACT, and school teams that want structure
              without adding more clutter.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-[#f8f5ef] shadow-lg shadow-slate-950/10 transition-transform hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">
                Open the demo workspace <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/pricing" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 backdrop-blur hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white">
                Review plans
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
              {['IB / AP / SAT / ACT', 'Google Cloud ready', 'Vertex AI routing', 'Built for schools'].map((item) => (
                <span key={item} className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                  <BadgeCheck className="h-4 w-4 text-[#d97706]" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#d97706]/10 via-transparent to-slate-900/10 blur-2xl dark:from-[#f2c06d]/10 dark:to-white/5" />
            <div className="glass relative overflow-hidden rounded-[2rem] border border-slate-900/10 bg-white/80 p-5 shadow-2xl shadow-slate-950/5 backdrop-blur dark:border-white/10 dark:bg-slate-900/75">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Executive overview</p>
                  <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">Today’s workflow in one view</p>
                </div>
                <div className="rounded-full bg-[#f2c06d]/20 px-3 py-1 text-xs font-semibold text-[#9a5b00] dark:text-[#f5d59f]">
                  GCP ready
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Next action</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">Generate a worksheet for IB Biology HL</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">The system already knows the curriculum, subject mix, and pace.</p>
                </div>
                <div className="rounded-2xl border border-slate-900/10 bg-slate-950 p-4 text-white dark:border-white/10">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Profile health</p>
                  <div className="mt-3 flex items-end gap-3">
                    <p className="text-4xl font-semibold">84</p>
                    <p className="pb-1 text-sm text-white/70">/ 100 execution score</p>
                  </div>
                  <p className="mt-2 text-sm text-white/70">Enough signal to plan next steps without rebuilding context every session.</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ['Study materials', 'Notes, quizzes, papers'],
                  ['Admissions', 'Target schools and strategy'],
                  ['Visibility', 'Parents, tutors, students'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-900/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-slate-900/10 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">Google Cloud deployment path</p>
                  <Sparkles className="h-4 w-4 text-[#d97706]" />
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {cloudStack.flat().map((item) => (
                    <div key={item} className="rounded-full border border-slate-900/10 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-200">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Weekly execution, not vague advice', 'Students get a clear next-action list tied to deadlines, class load, and target universities.'],
              ['Admissions depth that compounds', 'The system surfaces gaps, flags weak extracurricular signals, and helps build a coherent profile.'],
              ['Visibility for families and tutors', 'Progress stays legible without turning the workflow into constant check-ins or scattered chats.'],
            ].map(([title, detail]) => (
              <article key={title} className="rounded-[1.75rem] border border-slate-900/10 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#d97706]">Why it matters</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="product" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d97706]">Product</p>
              <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white sm:text-4xl">One system, four practical modules.</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              The product surface is intentionally narrow. It helps students execute, tutors review, and schools keep the process legible.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featureBlocks.map((item) => (
              <article key={item.title} className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/5 dark:border-white/10 dark:bg-slate-900/70">
                <item.icon className="h-6 w-6 text-[#d97706]" />
                <h3 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="audience" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
          <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
            <div className="rounded-[2rem] border border-slate-900/10 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d97706]">Audience</p>
              <h2 className="mt-3 font-display text-3xl tracking-tight text-slate-950 dark:text-white">Clear enough for families. Structured enough for serious applicants.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                This is not a generic AI wrapper. It is a workflow layer for people who need to see what happened, what is next, and what still needs attention.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                ['Students', 'Know what to do this week instead of holding the whole application process in memory.'],
                ['Tutors', 'Tie sessions to measurable outcomes and spend less time rebuilding context.'],
                ['Schools', 'Use one workspace for study support, admissions planning, and student visibility.'],
              ].map(([title, text]) => (
                <article key={title} className="rounded-[1.5rem] border border-slate-900/10 bg-[#f8f5ef] p-6 dark:border-white/10 dark:bg-slate-900/60">
                  <Users className="h-6 w-6 text-[#d97706]" />
                  <h3 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="cloud" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
          <div className="grid gap-6 rounded-[2rem] border border-slate-900/10 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/10 md:grid-cols-[1fr_.9fr] dark:border-white/10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f2c06d]">Infrastructure</p>
              <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">Use the GCP credits on something that can grow into production.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
                ElevateOS already supports a provider stack that can prefer Google Cloud when configured. That makes the credits useful for a real product path instead of a one-off demo.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {['Vertex AI', 'Cloud Run', 'Cloud SQL', 'Cloud Storage', 'Observability'].map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80">{item}</span>
                ))}
              </div>
            </div>
            <div className="grid gap-3">
              {[
                { icon: Cloud, title: 'Google Cloud ready', desc: 'A production deployment path instead of disposable demo infra.' },
                { icon: Sparkles, title: 'Vertex AI first', desc: 'AI routing can prefer Gemini when the project is configured for it.' },
                { icon: Database, title: 'Operationally sane', desc: 'Structured storage and repeatable workflows make the GCP credits matter.' },
              ].map((item) => (
                <div key={item.title} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[#f2c06d]/15 p-2 text-[#f2c06d]">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold">{item.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/70">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="plans" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-14">
          <div className="rounded-[2rem] border border-slate-900/10 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d97706]">Plan comparison</p>
                <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">What ElevateOS replaces</h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                The point is not more software. The point is fewer disconnected steps and more visible execution.
              </p>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-900/10 dark:border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-xs uppercase tracking-[0.2em] text-white">
                  <tr>
                    <th className="px-4 py-4">Capability</th>
                    <th className="px-4 py-4">Before</th>
                    <th className="px-4 py-4">With ElevateOS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/10 bg-white dark:divide-white/10 dark:bg-slate-950/40">
                  {comparison.map(([label, oldValue, newValue]) => (
                    <tr key={label}>
                      <td className="px-4 py-4 font-medium text-slate-950 dark:text-white">{label}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{oldValue}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#f2c06d]/15 px-3 py-1.5 font-medium text-[#9a5b00] dark:text-[#f5d59f]">
                          <CheckCircle2 className="h-4 w-4" />
                          {newValue}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">
          <div className="flex flex-col gap-4 rounded-[2rem] bg-slate-950 px-7 py-8 text-white shadow-2xl shadow-slate-950/10 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-[#f2c06d]">Next step</p>
              <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">Open the workspace and see how the system feels in use.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72">
                Start with the demo dashboard, then move into study, worksheets, admissions, and profile setup.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5">
                Open demo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/auth/signup" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">
                Create account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-900/10 bg-white/60 py-10 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-slate-950 dark:text-white">ElevateOS</p>
            <p className="mt-1">Study systems, admissions planning, and school visibility on one workspace.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#d97706]" /> Privacy-first by design</span>
            <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#d97706]" /> Weekly measurable progress</span>
            <span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-[#d97706]" /> Built for high-intent applicants</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
