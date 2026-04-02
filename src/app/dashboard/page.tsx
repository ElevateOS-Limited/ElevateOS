'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  ScanLine,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'

const toIsoDate = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const monthGrid = (month: Date) => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const startDay = first.getDay()
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: Array<Date | null> = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export default function DashboardPage() {
  const { data: session, status } = useSession()

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => fetch('/api/profile').then((r) => r.json()),
  })

  const { data: materials } = useQuery({
    queryKey: ['study-materials'],
    queryFn: () => fetch('/api/study').then((r) => r.json()),
  })

  const { data: worksheets } = useQuery({
    queryKey: ['worksheets'],
    queryFn: () => fetch('/api/worksheets').then((r) => r.json()),
  })

  const quickActions = [
    { href: '/dashboard/study', label: 'Study Assistant', icon: BookOpen, desc: 'Upload content and generate structured notes.' },
    { href: '/dashboard/worksheets', label: 'Worksheets', icon: FileText, desc: 'Create practice questions for the current topic.' },
    { href: '/dashboard/pastpapers', label: 'Past Papers', icon: Clock3, desc: 'Run timed exam simulation for revision.' },
    { href: '/dashboard/admissions', label: 'Admissions', icon: GraduationCap, desc: 'Check target-school fit and strategy.' },
    { href: '/dashboard/internships', label: 'Internships', icon: Briefcase, desc: 'Review opportunities that support your profile.' },
    { href: '/dashboard/planner', label: 'Activity Planner', icon: CalendarClock, desc: 'Map open time to meaningful activity slots.' },
    { href: '/dashboard/paper-scan', label: 'Paper Scanner', icon: ScanLine, desc: 'Mark right or wrong from photographed papers.' },
    { href: '/dashboard/extracurriculars', label: 'EC Scoring', icon: Trophy, desc: 'Score extracurricular strength against targets.' },
    { href: '/dashboard/partner', label: 'Tutoring Dashboard', icon: Users, desc: 'Tutor and parent operations view for sessions, recaps, and follow-ups.' },
  ]

  const now = new Date()
  const viewMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const todayIso = toIsoDate(now)
  const firstName = session?.user?.name?.split(' ')?.[0] || 'Student'
  const rawAvailability = ((profile as any)?.weeklyAvailability || {}) as any
  const weekly = (rawAvailability?.weekly && typeof rawAvailability.weekly === 'object' ? rawAvailability.weekly : rawAvailability) as Record<string, 'busy' | 'open'>
  const blockedDates = Array.isArray(rawAvailability?.blockedDates) ? rawAvailability.blockedDates : []
  const futureBlockedDates = blockedDates.filter((d: string) => d >= todayIso)
  const openDays = Object.values(weekly || {}).filter((value) => value === 'open').length
  const subjects = Array.isArray((profile as any)?.subjects) ? (profile as any).subjects : []
  const targets = Array.isArray((profile as any)?.targetUniversities) ? (profile as any).targetUniversities : []
  const goals = Array.isArray((profile as any)?.goals) ? (profile as any).goals : []
  const careerInterests = Array.isArray((profile as any)?.careerInterests) ? (profile as any).careerInterests : []
  const profileSignals = [profile?.curriculum, subjects.length, targets.length, goals.length, careerInterests.length, openDays].filter(Boolean).length

  const materialsList = Array.isArray(materials) ? materials : []
  const worksheetsList = Array.isArray(worksheets) ? worksheets : []

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f5ef] text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        <p className="text-sm font-medium">Loading workspace…</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <section className="rounded-[2rem] border border-slate-900/10 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-[#f8f5ef] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#9a5b00] dark:border-white/10 dark:bg-white/5 dark:text-[#f5d59f]">
              <Sparkles className="h-3.5 w-3.5" />
              Execution overview
            </div>
            <h1 className="font-display mt-4 text-4xl tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Welcome back, {firstName}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              {profile?.curriculum ? `${profile.curriculum} student` : 'Set up your profile to unlock cleaner recommendations.'}
              {targets.length > 0 ? ` Target schools: ${targets.slice(0, 3).join(', ')}.` : ' Add target universities, subjects, and availability for better planning.'}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[28rem]">
            {[
              ['Study materials', materialsList.length],
              ['Worksheets', worksheetsList.length],
              ['Open days', openDays],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 text-center dark:border-white/10 dark:bg-slate-950/40">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{value as number}</p>
              </div>
            ))}
          </div>
        </div>

        {!profile?.curriculum && (
          <div className="mt-6 flex flex-col gap-3 rounded-[1.25rem] border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">Complete your profile for stronger recommendations</p>
              <p className="text-sm opacity-85">Add curriculum, subjects, target universities, and weekly availability.</p>
            </div>
            <Link href="/dashboard/settings" className="inline-flex items-center gap-2 rounded-full bg-amber-950 px-4 py-2 text-sm font-semibold text-amber-50 dark:bg-amber-100 dark:text-amber-950">
              Finish profile <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
        <article className="rounded-[2rem] border border-slate-900/10 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d97706]">This week</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Weekly availability</h2>
            </div>
            <Link href="/dashboard/settings" className="text-sm font-medium text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
              Edit schedule
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
              const value = weekly?.[day] || 'busy'
              const open = value === 'open'
              return (
                <div key={day} className={`rounded-2xl border p-4 ${open ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20' : 'border-slate-900/10 bg-slate-50 dark:border-white/10 dark:bg-white/5'}`}>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{day}</p>
                  <p className={`mt-2 text-sm font-semibold ${open ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-200'}`}>{open ? 'Open' : 'Busy'}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-5 rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-slate-950/40">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Monthly calendar</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Blocked dates are highlighted</p>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <div key={`${day}-${i}`} className="text-center">{day}</div>)}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {monthGrid(viewMonth).map((date, idx) => {
                if (!date) return <div key={idx} className="h-8" />
                const iso = toIsoDate(date)
                const isPast = iso < todayIso
                const isBlocked = futureBlockedDates.includes(iso)
                return (
                  <div
                    key={iso}
                    className={`flex h-8 items-center justify-center rounded-md border text-xs ${
                      isPast
                        ? 'border-slate-200 bg-white text-slate-400 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-500'
                        : isBlocked
                          ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-200'
                          : 'border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200'
                    }`}
                  >
                    {date.getDate()}
                  </div>
                )
              })}
            </div>
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10 dark:border-white/10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2c06d]">Profile snapshot</p>
          <h2 className="mt-2 text-2xl font-semibold">What the workspace already knows</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ['Curriculum', profile?.curriculum || 'Not set'],
              ['Subjects', subjects.length ? subjects.slice(0, 3).join(', ') : 'Add subjects'],
              ['Major', (profile as any)?.intendedMajor || 'Not set'],
              ['Targets', targets.length ? targets.slice(0, 3).join(', ') : 'Add universities'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">{label}</p>
                <p className="mt-2 text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold">Profile signals</p>
            <p className="mt-2 text-3xl font-semibold">{profileSignals}/6</p>
            <p className="mt-2 text-sm text-white/70">Add more profile context to improve recommendations and reduce generic outputs.</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/75">
            {(careerInterests.slice(0, 4).length ? careerInterests.slice(0, 4) : ['Add career interests', 'Add goals']).map((item: string) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{item}</span>
            ))}
          </div>
        </article>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d97706]">Quick actions</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Jump directly to the next task</h2>
          </div>
          <p className="hidden text-sm text-slate-500 dark:text-slate-400 md:block">Keep the flow short and direct.</p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="group rounded-[1.5rem] border border-slate-900/10 bg-white p-5 transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/5 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-3">
                <action.icon className="h-6 w-6 text-[#d97706]" />
                <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#d97706]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{action.label}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{action.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <article className="rounded-[2rem] border border-slate-900/10 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Recent study materials</h2>
            <Link href="/dashboard/study" className="text-sm font-medium text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">Open study →</Link>
          </div>
          <div className="mt-5 divide-y divide-slate-900/10 overflow-hidden rounded-[1.25rem] border border-slate-900/10 dark:divide-white/10 dark:border-white/10">
            {materialsList.length ? materialsList.slice(0, 5).map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 bg-white px-4 py-4 dark:bg-slate-950/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f8f5ef] text-[#9a5b00] dark:bg-white/5 dark:text-[#f5d59f]">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-950 dark:text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.subject}{item.level ? ` · ${item.level}` : ''}{item.curriculum ? ` · ${item.curriculum}` : ''}</p>
                </div>
                <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
            )) : (
              <div className="bg-white px-4 py-8 text-sm text-slate-500 dark:bg-slate-950/40 dark:text-slate-400">
                No study materials yet. Start with a session and the dashboard will fill in automatically.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10 dark:border-white/10">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">Execution signals</h2>
            <BarChart3 className="h-5 w-5 text-[#f2c06d]" />
          </div>

          <div className="mt-5 grid gap-3">
            {[
              ['Worksheets created', worksheetsList.length],
              ['Open days this week', openDays],
              ['Blocked dates', futureBlockedDates.length],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">{label}</p>
                <p className="mt-2 text-3xl font-semibold">{value as number}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#f2c06d]" />
              <p className="text-sm font-semibold">Suggested next move</p>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/75">
              {goals.length ? goals[0] : 'Complete your profile, then generate one worksheet and one admissions analysis to establish baseline progress.'}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/75">
            {(targets.slice(0, 3).length ? targets.slice(0, 3) : ['Add target universities']).map((item: string) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{item}</span>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
