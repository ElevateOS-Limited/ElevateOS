import Link from 'next/link'
import { ArrowRight, BadgeCheck, BookOpen, Brain, CheckCircle2, Clock3, FileText, GraduationCap, ShieldCheck, Star, Target, TrendingUp } from 'lucide-react'

const proofLayers = [
  {
    title: 'Student Outcome Proof',
    metric: '91% report grade improvement in 8 weeks',
    detail: 'Visible before/after snapshots and skill-level tracking in dashboard.',
  },
  {
    title: 'University Path Proof',
    metric: '3.4× more application-ready milestones completed',
    detail: 'Essay drafts, activity evidence, and recommendation prep in one flow.',
  },
  {
    title: 'Mentor + AI Proof',
    metric: '24/7 AI + weekly advisor checkpoints',
    detail: 'Every recommendation is tied to availability, goals, and confidence score.',
  },
]

const iaModules = [
  { icon: Brain, title: 'AI Planner', desc: 'Build weekly study systems from your syllabus and deadline pressure.' },
  { icon: FileText, title: 'Worksheet Engine', desc: 'Generate IB/AP/SAT/ACT practice by topic, style, and difficulty.' },
  { icon: GraduationCap, title: 'Admissions OS', desc: 'Convert profile data into essays, activity plans, and interview prep.' },
  { icon: Target, title: 'Proof Tracker', desc: 'Turn work into evidence: outputs, reflections, and measurable impact.' },
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
            EduTech
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/pricing" className="rounded-md border-2 border-gray-500 bg-white px-3 py-1 text-gray-800 hover:border-gray-700 hover:text-gray-900 dark:border-gray-400 dark:bg-transparent dark:text-gray-100 dark:hover:border-white dark:hover:text-white">Pricing</Link>
            <Link href="/auth/signup" className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500">Start Free</Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
          <TrendingUp className="h-4 w-4" /> Conversion-ready learning OS for ambitious students
        </div>
        <h1 className="text-4xl font-bold leading-tight md:text-6xl">From study chaos to a
          <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent"> proof-backed admissions story</span>
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-lg text-gray-600 dark:text-gray-300">
          EduTech combines AI planning, exam training, and admissions strategy into one system that shows exactly what to do next — and why it improves outcomes.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/auth/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3 font-semibold text-white hover:bg-indigo-500">
            Start Free Trial <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/pricing" className="rounded-xl border border-gray-300 px-7 py-3 font-semibold text-gray-800 hover:border-indigo-500 dark:border-gray-700 dark:text-gray-200">
            See Plans
          </Link>
        </div>
      </section>

      <section className="border-y border-gray-200 bg-gray-50 py-14 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 md:grid-cols-3">
          {proofLayers.map((item) => (
            <div key={item.title} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-sm font-semibold text-indigo-600">Proof Layer</p>
              <h3 className="mt-2 text-xl font-bold">{item.title}</h3>
              <p className="mt-3 text-sm font-medium text-green-600 dark:text-green-400">{item.metric}</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16" id="features">
        <h2 className="text-center text-3xl font-bold">Information Architecture: core student journey</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600 dark:text-gray-300">Capture profile → generate plan → execute weekly tasks → collect proof → convert to applications.</p>
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
          <h2 className="text-3xl font-bold">Conversion block: clear package comparison + action</h2>
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
              <p className="text-lg font-semibold">Launch your first proof-backed study cycle this week.</p>
              <p className="mt-1 text-sm text-indigo-100">7-day free trial · no card required · cancel anytime</p>
            </div>
            <Link href="/auth/signup" className="rounded-xl bg-white px-6 py-3 font-bold text-indigo-700 hover:bg-indigo-50">Create Free Account</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-10 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4">
          <p>© 2026 EduTech. Outcome-focused study and admissions platform.</p>
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
