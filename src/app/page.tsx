import Link from 'next/link'
import { ArrowRight, BadgeCheck, BookOpen, Brain, CheckCircle2, Clock3, FileText, GraduationCap, ShieldCheck, Target, TrendingUp, Users, Globe2, Sparkles } from 'lucide-react'

const founderHighlights = [
  {
    icon: Users,
    title: 'Youth Leadership at Scale',
    metric: '40+ members · ¥200,000+ raised',
    detail: 'Founded and scaled student-led service organizations with measurable community outcomes.',
  },
  {
    icon: Globe2,
    title: 'First Kiwanis Voice Club in Japan',
    metric: 'National representation + continuity model',
    detail: 'Built cross-club coordination across service, alumni mentorship, and institutional partnerships.',
  },
  {
    icon: Sparkles,
    title: 'Research + Product Execution',
    metric: 'Top 5% research + AI product build',
    detail: 'Combines cross-cultural research rigor with full-stack product execution through ElevateOS.',
  },
]

const iaModules = [
  { icon: Brain, title: 'Profile Analyzer', desc: 'Identify strengths, gaps, and priorities for your target universities.' },
  { icon: FileText, title: 'Study Support', desc: 'Generate study plans and focused practice for IB/AP/SAT/ACT.' },
  { icon: GraduationCap, title: 'Admissions Planner', desc: 'Create a realistic roadmap for academics, extracurriculars, and essays.' },
  { icon: Target, title: 'Progress Tracker', desc: 'Track weekly execution and build a stronger application over time.' },
]

const comparison = [
  { label: 'Personalized weekly plan', basic: false, pro: true, elite: true },
  { label: 'AI worksheet + mock exam generation', basic: true, pro: true, elite: true },
  { label: 'Admissions strategy workspace', basic: false, pro: true, elite: true },
  { label: 'Human mentor checkpoints', basic: false, pro: false, elite: true },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            ThinkCollegeLevel
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/pricing" className="rounded-md border-2 border-gray-500 bg-white px-3 py-1 text-gray-800 hover:border-gray-700 hover:text-gray-900 dark:border-gray-400 dark:bg-transparent dark:text-gray-100 dark:hover:border-white dark:hover:text-white">Pricing</Link>
            <Link href="/auth/signup" className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500">Start Free</Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
          <TrendingUp className="h-4 w-4" /> Personal profile · Founder track · Leadership portfolio
        </div>
        <h1 className="text-4xl font-bold leading-tight md:text-6xl">Chak Hang (Howard) Chan
          <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent"> — Builder, Researcher, Operator</span>
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-lg text-gray-600 dark:text-gray-300">
          Incoming HSPS student at the University of Cambridge, founder of ElevateOS, and founder/president of Kiwanis Voice Club of Nippon. I build systems that turn ambition into measurable outcomes across education, service, and technology.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="https://www.linkedin.com/in/chakhanghoward-chan" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3 font-semibold text-white hover:bg-indigo-500">
            View LinkedIn <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/dashboard" className="rounded-xl border border-gray-300 px-7 py-3 font-semibold text-gray-800 hover:border-indigo-500 dark:border-gray-700 dark:text-gray-200">
            Explore ElevateOS
          </Link>
        </div>
      </section>

      <section className="border-y border-gray-200 bg-gray-50 py-14 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 md:grid-cols-3">
          {founderHighlights.map((item) => (
            <div key={item.title} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
              <item.icon className="h-5 w-5 text-indigo-500" />
              <p className="mt-3 text-sm font-semibold text-indigo-600">Track Record</p>
              <h3 className="mt-2 text-xl font-bold">{item.title}</h3>
              <p className="mt-3 text-sm font-medium text-green-600 dark:text-green-400">{item.metric}</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16" id="features">
        <h2 className="text-center text-3xl font-bold">How it works</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600 dark:text-gray-300">Analyze profile → plan next steps → execute weekly → track outcomes.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {iaModules.map((m) => (
            <div key={m.title} className="rounded-2xl border border-gray-200 p-6 dark:border-gray-800">
              <m.icon className="h-6 w-6 text-indigo-500" />
              <h3 className="mt-3 text-xl font-semibold">{m.title}</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-indigo-600 to-purple-700 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold">Simple plans for every stage</h2>
          <div className="mt-7 overflow-hidden rounded-2xl border border-white/30">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/20 text-xs uppercase tracking-wide">
                <tr>
                  <th className="p-4">Capability</th>
                  <th className="p-4">Basic</th>
                  <th className="p-4">Pro</th>
                  <th className="p-4">Elite</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.label} className="border-t border-white/20">
                    <td className="p-4">{row.label}</td>
                    <td className="p-4">{row.basic ? <CheckCircle2 className="h-4 w-4" /> : '—'}</td>
                    <td className="p-4">{row.pro ? <CheckCircle2 className="h-4 w-4" /> : '—'}</td>
                    <td className="p-4">{row.elite ? <CheckCircle2 className="h-4 w-4" /> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl bg-white/10 p-6 md:flex-row md:items-center">
            <div>
              <p className="text-lg font-semibold">Start building a stronger student profile this week.</p>
              <p className="mt-1 text-sm text-indigo-100">7-day free trial · cancel anytime</p>
            </div>
            <Link href="/auth/signup" className="rounded-xl bg-white px-6 py-3 font-bold text-indigo-700 hover:bg-indigo-50">Create Free Account</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-10 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4">
          <p>© 2026 ThinkCollegeLevel · Howard Chan. Outcome-focused education and leadership execution.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Privacy-first by design</span>
            <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" /> Weekly measurable progress</span>
            <span className="inline-flex items-center gap-1"><BadgeCheck className="h-4 w-4" /> Built for IB/AP/SAT/ACT</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
