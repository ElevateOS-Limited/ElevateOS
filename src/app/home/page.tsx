import Link from 'next/link'
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown, MessageSquareText, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { LeadCaptureForm } from '@/components/public/LeadCaptureForm'

const howItWorks = [
  {
    step: '01',
    title: 'Book a trial lesson',
    copy: 'Tell us your IB subjects and years remaining. We match you with a tutor who scored 40+ in your subjects.',
  },
  {
    step: '02',
    title: 'Learn with structured feedback',
    copy: 'Each session produces tasks, a submission review, and a session note — all linked, nothing lost in chat.',
  },
  {
    step: '03',
    title: 'Parents receive a clear report',
    copy: 'After every session, families get a concise summary: what was covered, homework set, and where to focus next.',
  },
]

const tutors = [
  {
    name: 'Alicia T.',
    score: '44 / 45',
    university: 'University of Cambridge',
    subjects: ['HL Mathematics', 'HL Physics', 'HL Chemistry'],
  },
  {
    name: 'Marcus L.',
    score: '42 / 45',
    university: 'London School of Economics',
    subjects: ['HL Economics', 'HL History', 'SL Mathematics'],
  },
  {
    name: 'Priya S.',
    score: '43 / 45',
    university: 'Imperial College London',
    subjects: ['HL Biology', 'HL Chemistry', 'HL English A'],
  },
]

const parentSummaryItems = [
  'Topics covered in the session',
  'Strengths and weak points identified',
  'Homework and tasks assigned',
  'Progress note from the tutor',
  'Recommended focus before the next session',
]

const faqs = [
  {
    q: 'How much does it cost?',
    a: 'Trial lessons are free. After the trial we offer flexible packages from a single session to a full IB term plan. Pricing is shared after your free trial.',
  },
  {
    q: 'How structured are the sessions?',
    a: 'Every session starts with a goal set from the previous session note. Work is assigned, submitted, reviewed, and carried forward — nothing resets between lessons.',
  },
  {
    q: 'How does AI fit in?',
    a: 'AI compresses tutor session notes into readable parent summaries. It does not replace the tutor, grade work autonomously, or make pedagogical decisions.',
  },
  {
    q: 'Can both parents and students see progress?',
    a: 'Yes. Students see their tasks and feedback. Parents receive separate summaries focused on accountability and next steps — no raw tutor notes, no clutter.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(245,201,111,.18),_transparent_30%),linear-gradient(180deg,#f8f5ef_0%,#ffffff_100%)] text-slate-950 dark:bg-slate-950 dark:text-white">

      {/* ── Nav ── */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6">
        <Link href="/home" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">ElevateOS</p>
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">IB Tutoring</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
          <a href="#how-it-works" className="hover:text-slate-950 dark:hover:text-white">How it works</a>
          <a href="#tutors" className="hover:text-slate-950 dark:hover:text-white">Our tutors</a>
          <Link href="/demo" className="hover:text-slate-950 dark:hover:text-white">Demo</Link>
          <Link href="/pricing" className="hover:text-slate-950 dark:hover:text-white">Pricing</Link>
          <a href="#parent-visibility" className="hover:text-slate-950 dark:hover:text-white">For parents</a>
          <a href="#book" className="hover:text-slate-950 dark:hover:text-white">Book trial</a>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-full border border-slate-900/10 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:text-white">
            Login
          </Link>
          <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
            Book trial <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">

        {/* ── 1. Hero ── */}
        <section className="py-16 lg:py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            <ShieldCheck className="h-4 w-4 text-[#9a5b00]" />
            IB-specialist tutors · Structured execution · Parent visibility
          </div>

          <h1 className="font-display mt-6 text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Structured IB tutoring<br className="hidden lg:block" /> with AI-powered support
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Execution, accountability, and parent visibility in one system — built for IB students who need more than generic homework help.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/demo" className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/80 px-7 py-3.5 text-sm font-semibold text-slate-700 backdrop-blur hover:border-slate-900/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              Open student demo <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">
              Book your free trial lesson <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how-it-works" className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/80 px-7 py-3.5 text-sm font-semibold text-slate-700 backdrop-blur hover:border-slate-900/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              See how it works <ChevronDown className="h-4 w-4" />
            </a>
          </div>
        </section>

        {/* ── 2. Problem ── */}
        <section className="py-12 lg:py-16">
          <div className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/10 dark:border-white/10 lg:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f2c06d]">The problem with IB tutoring today</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight lg:text-4xl">
              IB support is fragmented, opaque, and hard to track.
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                ['No continuity', 'Each session starts from scratch. Notes live in WhatsApp, PDFs go missing, and the tutor re-explains context every time.'],
                ['No accountability', 'Parents pay but cannot see what was covered, what was assigned, or whether the student actually submitted anything.'],
                ['No IB specificity', 'Generic tutors cover "math" — not HL Further Maths Paper 3 or the specific command terms examiners use to grade.'],
              ].map(([title, copy]) => (
                <div key={title as string} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <h3 className="text-base font-semibold text-[#f5d59f]">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/75">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Solution ── */}
        <section className="py-12 lg:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">The solution</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight lg:text-4xl">
            Structured tutoring with AI exactly where it helps — and nowhere else.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
            ElevateOS is an execution layer: assign work, capture submissions, review feedback, and send a clear summary to parents. AI handles one job — compressing tutor session notes into readable parent updates.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { icon: BookOpen, title: 'IB-specialist tutors', copy: 'Every tutor on the platform scored 40+ in the IB. They know the exact syllabus, mark schemes, and examiner expectations.' },
              { icon: MessageSquareText, title: 'Execution & accountability', copy: 'Tasks are assigned, deadlines are tracked, submissions are reviewed. Nothing disappears between sessions.' },
              { icon: Sparkles, title: 'AI-powered session recaps', copy: 'After each session, AI turns raw tutor notes into a clean parent summary — what happened, what\'s next, where to focus.' },
            ].map(({ icon: Icon, title, copy }) => (
              <article key={title} className="rounded-[1.8rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                <Icon className="h-5 w-5 text-[#9a5b00]" />
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── 4. How it works ── */}
        <section id="how-it-works" className="py-12 lg:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">How it works</p>
          <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight lg:text-4xl">
            Three steps from first session to parent report.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {howItWorks.map(({ step, title, copy }) => (
              <div key={step} className="rounded-[1.8rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-[#f2c06d] dark:bg-white/10">
                  {step}
                </div>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. Tutor credibility ── */}
        <section id="tutors" className="py-12 lg:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Our tutors</p>
          <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight lg:text-4xl">
            Tutors who actually sat the exams you&apos;re preparing for.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
            Every tutor scored 40 or above in the IB Diploma and attends or graduated from a Russell Group or equivalent university. They are vetted on IB-specific pedagogy, not just subject knowledge.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {tutors.map((tutor) => (
              <article key={tutor.name} className="rounded-[1.8rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f8f5ef] text-2xl font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-100">
                  {tutor.name[0]}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{tutor.name}</h3>
                <p className="mt-1 text-sm font-medium text-[#9a5b00]">IB score: {tutor.score}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{tutor.university}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tutor.subjects.map((s) => (
                    <span key={s} className="rounded-full border border-slate-900/10 bg-[#f8f5ef] px-3 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 rounded-[1.5rem] border border-slate-900/10 bg-white/90 p-5 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <CheckCircle2 className="mb-2 h-4 w-4 text-[#9a5b00]" />
            All tutors are background-checked, IB-vetted, and trained on the ElevateOS structured session format before taking on students.
          </div>
        </section>

        {/* ── 6. Parent visibility ── */}
        <section id="parent-visibility" className="py-12 lg:py-16">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <article className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">For parents</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight">
                No jargon. No clutter. Just the essentials.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Parents pay for tutoring but rarely know what happened in a session. ElevateOS changes that. After every lesson, families receive a concise, AI-generated summary that covers exactly what matters.
              </p>
              <div className="mt-6 space-y-3">
                {parentSummaryItems.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-900/10 bg-[#f8f5ef] px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#9a5b00]" />
                    {item}
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs leading-6 text-slate-500 dark:text-slate-400">
                Parents get a separate view from students — focused on accountability, not raw session notes.
              </p>
            </article>

            <div className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/10 dark:border-white/10">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f2c06d]">Sample session summary</p>
              <div className="mt-5 space-y-3">
                {[
                  { label: 'Session', value: 'HL Mathematics – Calculus (Paper 2)' },
                  { label: 'Covered', value: 'Integration by parts, area between curves, exam-style problem set (8 questions)' },
                  { label: 'Strengths', value: 'Strong setup of definite integrals; good algebraic manipulation' },
                  { label: 'Focus area', value: 'Applying integration limits consistently — losing marks on boundary conditions' },
                  { label: 'Homework', value: 'Complete Cambridge 2023 Paper 2 Q4 and Q7 before next session' },
                  { label: 'Next session', value: 'Review homework, begin differential equations (Maclaurin series)' },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{label}</p>
                    <p className="mt-1 text-sm leading-6 text-white/80">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. CTA / lead form ── */}
        <section id="book" className="py-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Book your trial lesson</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight lg:text-4xl">
                Start with a free session. No commitment required.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
                Tell us your subjects, IB year, and what you need most. We match you with a tutor within 24 hours and schedule your first free lesson.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  'Matched to a tutor who scored 40+ in your subjects',
                  'First lesson free — no card required',
                  'Parent summary sent after every session',
                  'Cancel or pause any time',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#9a5b00]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <article className="rounded-[2rem] border border-slate-900/10 bg-[#f8f5ef] p-8 shadow-sm dark:border-white/10 dark:bg-slate-950/60">
              <LeadCaptureForm source="home" className="mt-0" />
            </article>
          </div>
        </section>

        {/* ── 8. FAQ ── */}
        <section className="py-12 lg:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">FAQ</p>
          <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight">Common questions</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {faqs.map(({ q, a }) => (
              <div key={q} className="rounded-[1.5rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                <div className="flex items-start gap-3">
                  <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-[#9a5b00]" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{q}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="border-t border-slate-900/10 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6 dark:text-slate-400">
          <p>© 2026 ElevateOS. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/demo" className="hover:text-slate-950 dark:hover:text-white">Demo</Link>
            <Link href="/pricing" className="hover:text-slate-950 dark:hover:text-white">Pricing</Link>
            <Link href="/login" className="hover:text-slate-950 dark:hover:text-white">Login</Link>
            <Link href="/onboarding" className="hover:text-slate-950 dark:hover:text-white">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
