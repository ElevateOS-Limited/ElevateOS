'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Clock3,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'

type StatusTone = 'green' | 'amber' | 'red'

type StudentRow = {
  initials: string
  name: string
  subject: string
  sessions: number
  progress: number
  status: string
  tone: StatusTone
  next: string
  hue: string
}

type RecapItem = {
  day: string
  mon: string
  topics: string
  homework: string
  next: string
  notes: string
}

type SessionItem = {
  time: string
  title: string
  detail: string
}

type ThreadItem = {
  with: string
  student: string
  preview: string
  time: string
  unread?: number
}

type MetricCard = {
  label: string
  value: string
  note: string
  icon: typeof Users
}

const metrics: MetricCard[] = [
  { label: 'Active students', value: '12', note: '4 need follow-up', icon: Users },
  { label: 'Avg recap rating', value: '4.7/5', note: 'Last 30 days', icon: TrendingUp },
  { label: 'Unread messages', value: '3', note: 'Tutor queue', icon: MessageSquare },
  { label: 'Upcoming sessions', value: '5', note: 'This week', icon: CalendarClock },
]

const students: StudentRow[] = [
  { initials: 'MC', name: 'Mia Chen', subject: 'Mathematics', sessions: 18, progress: 88, status: 'On track', tone: 'green', next: 'Quadratic review', hue: '#3B82F6' },
  { initials: 'JP', name: 'Jordan Patel', subject: 'English', sessions: 22, progress: 63, status: 'Needs focus', tone: 'amber', next: 'Essay thesis practice', hue: '#DF5B30' },
  { initials: 'SA', name: 'Sofia Alvarez', subject: 'Biology', sessions: 14, progress: 74, status: 'Steady', tone: 'amber', next: 'Lab write-up', hue: '#10B981' },
  { initials: 'DK', name: 'Daniel Kim', subject: 'Physics', sessions: 16, progress: 91, status: 'On track', tone: 'green', next: 'Mechanics problem set', hue: '#8B5CF6' },
]

const sessions: SessionItem[] = [
  { time: 'Today 4:00 PM', title: 'Mia Chen - Math review', detail: 'Quadratics and graph interpretation' },
  { time: 'Tomorrow 5:30 PM', title: 'Jordan Patel - Essay workshop', detail: 'Argument structure and transitions' },
  { time: 'Fri 6:00 PM', title: 'Daniel Kim - Physics sprint', detail: 'Mechanics practice and recap' },
]

const threads: ThreadItem[] = [
  { with: 'Parent update', student: 'Mia Chen', preview: 'Could we move Saturday to Sunday afternoon?', time: 'Mon 3:20 PM', unread: 1 },
  { with: 'Tutor check-in', student: 'Jordan Patel', preview: 'Shared the essay outline and next step.', time: 'Mon 1:10 PM' },
  { with: 'Parent note', student: 'Daniel Kim', preview: 'Thanks for the mechanics recap and feedback.', time: 'Sun 6:40 PM' },
]

const recaps: RecapItem[] = [
  {
    day: '12',
    mon: 'MAR',
    topics: 'Essay structure, thesis statements',
    homework: 'Draft intro paragraph for assigned essay',
    next: 'Body paragraph development',
    notes: 'Needs more practice with argumentative framing.',
  },
  {
    day: '8',
    mon: 'MAR',
    topics: 'Functions and graphs',
    homework: 'Graph five functions worksheet',
    next: 'Quadratic equations',
    notes: 'Strong progress on notation and intercepts.',
  },
  {
    day: '3',
    mon: 'MAR',
    topics: 'Cell biology and membranes',
    homework: 'Memorize transport terms',
    next: 'Photosynthesis quiz prep',
    notes: 'Good recall when prompted with diagrams.',
  },
  {
    day: '28',
    mon: 'FEB',
    topics: 'Newtonian mechanics',
    homework: 'Timed practice questions',
    next: 'Forces and free body diagrams',
    notes: 'Can now explain solutions aloud without prompting.',
  },
]

function toneClasses(tone: StatusTone) {
  if (tone === 'green') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
  if (tone === 'amber') return 'border-amber-500/20 bg-amber-500/10 text-amber-200'
  return 'border-rose-500/20 bg-rose-500/10 text-rose-200'
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  )
}

function StatCard({ label, value, note, icon: Icon }: MetricCard) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-white/55">{label}</p>
        <Icon className="h-4 w-4 text-[#f2c06d]" />
      </div>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-white/60">{note}</p>
    </div>
  )
}

export default function PartnerDashboardPage() {
  const { data: session } = useSession()
  const firstName = session?.user?.name?.split(' ')?.[0] || 'Tutor'

  return (
    <div className="space-y-8 pb-10">
      <section className="rounded-[2rem] border border-slate-900/10 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-[#f8f5ef] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#9a5b00] dark:border-white/10 dark:bg-white/5 dark:text-[#f5d59f]">
              <Sparkles className="h-3.5 w-3.5" />
              Tutoring MVP
            </div>
            <h1 className="font-display mt-4 text-4xl tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Hi, {firstName}. Keep sessions, recaps, and follow-up in one place.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              This view is intentionally narrow: the tutor only needs today’s sessions, the latest recap, the next action, and the parent thread that is waiting for a reply.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-[#f8f5ef] shadow-lg shadow-slate-950/10 transition-transform hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">
                Open main workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard/progress" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 backdrop-blur hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white">
                Review progress
              </Link>
              <Link href="/dashboard/settings" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 backdrop-blur hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white">
                Update schedule
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
              {['Sessions', 'Students', 'Recaps', 'Parent notes'].map((item) => (
                <span key={item} className="rounded-full border border-slate-900/10 bg-white/70 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[30rem]">
            {metrics.map((metric) => (
              <StatCard key={metric.label} {...metric} />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.12fr_.88fr]">
        <article className="rounded-[2rem] border border-slate-900/10 bg-white/85 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d97706]">Students</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Who needs attention this week</h2>
            </div>
            <Link href="/dashboard/progress" className="text-sm font-medium text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
              Open progress →
            </Link>
          </div>

          <div className="mt-5 overflow-hidden rounded-[1.25rem] border border-slate-900/10 dark:border-white/10">
            <div className="grid grid-cols-[1.6fr_1fr_.8fr_.8fr_1.05fr_1.3fr] gap-3 border-b border-slate-900/10 bg-[#f8f5ef] px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-400">
              <div>Name</div>
              <div>Subject</div>
              <div>Sessions</div>
              <div>Status</div>
              <div>Progress</div>
              <div>Next</div>
            </div>

            <div className="divide-y divide-slate-900/10 bg-white dark:divide-white/10 dark:bg-slate-950/30">
              {students.map((student) => (
                <div key={student.name} className="grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-[1.6fr_1fr_.8fr_.8fr_1.05fr_1.3fr] md:items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
                      style={{ backgroundColor: `${student.hue}18`, color: student.hue }}
                    >
                      {student.initials}
                    </div>
                    <div>
                      <p className="font-medium text-slate-950 dark:text-white">{student.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Keep the next lesson narrow and concrete.</p>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">{student.subject}</div>
                  <div className="text-sm font-medium text-slate-950 dark:text-white">{student.sessions}</div>
                  <div>
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${toneClasses(student.tone)}`}>
                      {student.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{student.progress}%</span>
                      <span>toward term goal</span>
                    </div>
                    <ProgressBar value={student.progress} color={student.hue} />
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">{student.next}</div>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10 dark:border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2c06d]">Today</p>
              <h2 className="mt-2 text-2xl font-semibold">Schedule, risk, and next action</h2>
            </div>
            <BarChart3 className="h-5 w-5 text-[#f2c06d]" />
          </div>

          <div className="mt-5 grid gap-3">
            <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-[#f2c06d]" />
                <p className="text-sm font-semibold">Risk summary</p>
              </div>
              <p className="mt-3 text-3xl font-semibold">2 students declining</p>
              <p className="mt-2 text-sm leading-7 text-white/70">Essay structure and graphing cadence need a tighter rhythm this week.</p>
            </div>

            <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Upcoming sessions</p>
                <Clock3 className="h-4 w-4 text-white/60" />
              </div>
              <div className="mt-4 space-y-3">
                {sessions.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">{item.time}</p>
                    <p className="mt-2 font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-white/65">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold">Recommended next step</p>
              <p className="mt-2 text-sm leading-7 text-white/70">Confirm the Saturday slots, then push one extra recap before Friday.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/dashboard/settings" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                  Update schedule
                </Link>
                <Link href="/dashboard/help" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950">
                  Send feedback
                </Link>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <article className="rounded-[2rem] border border-slate-900/10 bg-white/85 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d97706]">Recaps</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Recent notes and homework</h2>
            </div>
            <Link href="/dashboard/study" className="text-sm font-medium text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
              Open study →
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {recaps.map((recap) => (
              <div key={`${recap.day}-${recap.mon}-${recap.topics}`} className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-slate-950/40">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">
                      {recap.day} {recap.mon}
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{recap.topics}</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-900/10 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Homework</p>
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{recap.homework}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-900/10 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Next plan</p>
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{recap.next}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-[#60a5fa]/20 bg-[#eff6ff] p-3 text-sm text-slate-700 dark:border-[#60a5fa]/20 dark:bg-[#0f172a] dark:text-slate-200">
                  <span className="font-semibold text-slate-950 dark:text-white">Notes: </span>
                  <span className="italic">{recap.notes}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10 dark:border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2c06d]">Communication</p>
              <h2 className="mt-2 text-2xl font-semibold">Parent and tutor threads</h2>
            </div>
            <MessageSquare className="h-5 w-5 text-[#f2c06d]" />
          </div>

          <div className="mt-5 space-y-3">
            {threads.map((thread) => (
              <div key={`${thread.student}-${thread.with}`} className="flex gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                  {thread.student
                    .split(' ')
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-semibold text-white">{thread.with}</p>
                    <p className="text-xs text-white/50">{thread.time}</p>
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">{thread.student}</p>
                  <p className="mt-2 text-sm text-white/70">{thread.preview}</p>
                </div>
                {thread.unread ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d97706] text-[10px] font-semibold text-white">
                    {thread.unread}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#f2c06d]" />
              <p className="text-sm font-semibold">Quick actions</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/dashboard/study" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950">
                Open study workspace
              </Link>
              <Link href="/dashboard/settings" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                Adjust availability
              </Link>
              <Link href="/dashboard/help" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                Send feedback
              </Link>
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}
