'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { demoDashboardProfile } from '@/lib/dashboard/demo-profile'
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Loader2,
  MapPin,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'

type WeeklyAvailability = {
  weekly?: Record<string, 'open' | 'busy'>
  blockedDates?: string[]
}

type DashboardProfile = {
  id?: string | null
  email?: string | null
  image?: string | null
  name?: string | null
  role?: string | null
  gradeLevel?: string | null
  curriculum?: string | null
  subjects?: unknown
  intendedMajor?: string | null
  targetUniversities?: unknown
  careerInterests?: unknown
  gpa?: unknown
  satScore?: unknown
  actScore?: unknown
  location?: string | null
  bio?: string | null
  coursesTaking?: unknown
  activitiesDone?: unknown
  goals?: unknown
  weeklyAvailability?: unknown
}

type GoalItem = {
  title: string
  target: string
}

type ActivityItem = {
  name: string
  impact: string
}

type UniversitySnapshot = {
  name: string
  fitLabel: 'Ready' | 'Stretch' | 'Reach'
  score: number
  summary: string
  nextStep: string
}

type InternshipIdea = {
  title: string
  org: string
  fit: string
  why: string
  nextStep: string
}

type DashboardPageProps = {
  initialProfile?: DashboardProfile | null
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const KNOWN_REACH_SCHOOLS = new Set([
  'stanford',
  'mit',
  'harvard',
  'princeton',
  'yale',
  'oxford',
  'cambridge',
  'ucl',
  'imperial college london',
  'london school of economics',
])

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (typeof item === 'string') return item.trim()

      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>
        const candidate = [record.name, record.title, record.label, record.target, record.impact]
          .find((entry) => typeof entry === 'string' && entry.trim())

        return typeof candidate === 'string' ? candidate.trim() : ''
      }

      return ''
    })
    .filter(Boolean)
}

function asGoalItems(value: unknown): GoalItem[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (typeof item === 'string') {
        return { title: item.trim(), target: '' }
      }

      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>
        const title = typeof record.title === 'string' ? record.title.trim() : typeof record.name === 'string' ? record.name.trim() : ''
        const target = typeof record.target === 'string' ? record.target.trim() : typeof record.impact === 'string' ? record.impact.trim() : ''
        return { title, target }
      }

      return { title: '', target: '' }
    })
    .filter((goal) => goal.title || goal.target)
}

function asActivityItems(value: unknown): ActivityItem[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (typeof item === 'string') {
        return { name: item.trim(), impact: '' }
      }

      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>
        const name = typeof record.name === 'string' ? record.name.trim() : typeof record.title === 'string' ? record.title.trim() : ''
        const impact =
          typeof record.impact === 'string'
            ? record.impact.trim()
            : typeof record.value === 'string'
              ? record.value.trim()
              : ''
        return { name, impact }
      }

      return { name: '', impact: '' }
    })
    .filter((activity) => activity.name || activity.impact)
}

function normalizeAvailability(value: unknown): { weekly: Record<string, 'open' | 'busy'>; blockedDates: string[] } {
  const weekly = Object.fromEntries(DAYS.map((day) => [day, 'busy'])) as Record<string, 'open' | 'busy'>
  const blockedDates: string[] = []

  if (!value || typeof value !== 'object') {
    return { weekly, blockedDates }
  }

  const record = value as WeeklyAvailability & Record<string, unknown>
  const sourceWeekly =
    record.weekly && typeof record.weekly === 'object' ? (record.weekly as Record<string, unknown>) : (value as Record<string, unknown>)

  for (const day of DAYS) {
    const candidate = sourceWeekly[day]
    if (candidate === 'open' || candidate === 'busy') {
      weekly[day] = candidate
    }
  }

  if (Array.isArray(record.blockedDates)) {
    for (const entry of record.blockedDates) {
      if (typeof entry === 'string' && entry.trim()) {
        blockedDates.push(entry.trim())
      }
    }
  }

  return { weekly, blockedDates }
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function monthGrid(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const startDay = first.getDay()
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: Array<Date | null> = []

  for (let index = 0; index < startDay; index += 1) cells.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(month.getFullYear(), month.getMonth(), day))
  while (cells.length % 7 !== 0) cells.push(null)

  return cells
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getUniversitySnapshot(
  university: string,
  profile: DashboardProfile,
  index: number,
  profileSignals: number,
): UniversitySnapshot {
  const normalized = university.toLowerCase()
  const elitePenalty = KNOWN_REACH_SCHOOLS.has(normalized) ? -10 : normalized.includes('university') ? 0 : 4
  const gpaValue = typeof profile.gpa === 'number' ? profile.gpa : Number(profile.gpa || 0)
  const satValue = typeof profile.satScore === 'number' ? profile.satScore : Number(profile.satScore || 0)
  const academicScore = gpaValue > 0 ? gpaValue * 18 : 58
  const testScore = satValue > 0 ? (satValue - 1000) / 35 : 6
  const baseScore = academicScore + testScore + profileSignals * 2.5 + elitePenalty - index * 3
  const score = clamp(Math.round(baseScore), 42, 96)

  const fitLabel: UniversitySnapshot['fitLabel'] = score >= 82 ? 'Ready' : score >= 68 ? 'Stretch' : 'Reach'
  const major = profile.intendedMajor || 'your major'

  const summary =
    fitLabel === 'Ready'
      ? `Good early fit for ${major}; keep the narrative consistent and add one quantified leadership example.`
      : fitLabel === 'Stretch'
        ? `Solid target, but it still needs a stronger flagship activity and one cleaner academic signal.`
        : `Treat this as a reach and build one more spike around ${major} plus a sharper essay angle.`

  const nextStep =
    fitLabel === 'Ready'
      ? 'Keep the application moving and protect the story arc.'
      : fitLabel === 'Stretch'
        ? 'Add one more proof point in the activity list.'
        : 'Shortlist one academic extension or selective summer program.'

  return { name: university, fitLabel, score, summary, nextStep }
}

function buildInternshipIdeas(profile: DashboardProfile): InternshipIdea[] {
  const major = profile.intendedMajor || 'your major'
  const location = profile.location || 'Remote / local'
  const interests = asStringList(profile.careerInterests)
  const interestText = interests.slice(0, 2).join(', ') || major

  return [
    {
      title: 'University research placement',
      org: `Faculty-led summer research near ${location}`,
      fit: 'Best academic signal',
      why: `Builds direct evidence for ${major} and gives you one serious project to talk about in essays.`,
      nextStep: 'Look for pre-college research, lab shadowing, or mentor-led summer programs.',
    },
    {
      title: 'Startup product internship',
      org: 'Early-stage startup or founder project',
      fit: 'Fast execution signal',
      why: `Turns ${interestText} into shipped work, measurable outcomes, and a concrete contribution.`,
      nextStep: 'Search for small teams that accept high school applicants or short project contracts.',
    },
    {
      title: 'Community impact fellowship',
      org: 'NGO, civic lab, or social enterprise',
      fit: 'Narrative depth',
      why: 'Adds leadership, service, and a public result you can quantify in the activity list.',
      nextStep: 'Target programs with a mentor, a deadline, and a visible deliverable.',
    },
    {
      title: 'Portfolio sprint',
      org: 'Hackathon, competition, or research challenge',
      fit: 'Quick evidence',
      why: 'Creates one artifact you can point to before the next application cycle opens.',
      nextStep: 'Pick one competition and ship an entry within the next 30 days.',
    },
  ]
}

function loadingCard() {
  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-[#f8f5ef] px-6 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
      <div className="flex items-center gap-3 rounded-[1.5rem] border border-slate-900/10 bg-white/90 px-5 py-4 shadow-sm dark:border-white/10 dark:bg-white/5">
        <Loader2 className="h-4 w-4 animate-spin text-[#9a5b00]" />
        <p className="text-sm font-medium">Loading dashboard...</p>
      </div>
    </div>
  )
}

export default function DashboardPage({ initialProfile }: DashboardPageProps) {
  const profileQuery = useQuery<DashboardProfile | null>({
    queryKey: ['main-dashboard-profile'],
    initialData: initialProfile ?? undefined,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const response = await fetch('/api/profile', { cache: 'no-store' })
      if (response.status === 401 || response.status === 403) {
        return demoDashboardProfile as DashboardProfile
      }
      if (!response.ok) throw new Error('Unable to load profile')
      const data = await response.json()
      return (data ?? demoDashboardProfile) as DashboardProfile
    },
    retry: false,
    refetchOnWindowFocus: false,
  })

  if (profileQuery.isLoading) {
    return loadingCard()
  }

  if (profileQuery.isError) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center bg-[#f8f5ef] px-6 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        <div className="max-w-lg rounded-[1.5rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">Dashboard unavailable</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">Unable to load profile-backed dashboard.</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Sign in again or reload the page. In demo mode, the profile endpoint should populate this view automatically.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/login" className="inline-flex items-center gap-2 text-slate-950 transition-colors hover:text-[#9a5b00] dark:text-white">
              Go to login
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/home" className="inline-flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
              Open home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const profile = profileQuery.data ?? demoDashboardProfile
  const subjects = asStringList(profile?.subjects)
  const targets = asStringList(profile?.targetUniversities)
  const interests = asStringList(profile?.careerInterests)
  const coursesTaking = asStringList(profile?.coursesTaking)
  const activities = asActivityItems(profile?.activitiesDone)
  const goals = asGoalItems(profile?.goals)
  const { weekly, blockedDates } = normalizeAvailability(profile?.weeklyAvailability)
  const openDays = DAYS.filter((day) => weekly[day] === 'open')
  const todayIso = toIsoDate(new Date())
  const activeBlockedDates = blockedDates.filter((day) => day >= todayIso)
  const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const openSlots = openDays.length
  const isGuestPreview = profile?.id === demoDashboardProfile.id || profile?.email === demoDashboardProfile.email
  const profileSignals = [
    profile?.curriculum,
    profile?.gradeLevel,
    profile?.intendedMajor,
    subjects.length,
    targets.length,
    interests.length,
    goals.length,
    activities.length,
    openSlots,
  ].filter(Boolean).length

  const profileCompleteness = clamp(Math.round((profileSignals / 9) * 100), 0, 100)
  const universitySnapshots = targets.length
    ? targets.slice(0, 4).map((target, index) => getUniversitySnapshot(target, profile, index, profileSignals))
    : [
        {
          name: 'Add target universities',
          fitLabel: 'Stretch',
          score: 0,
          summary: 'Add a target list in settings so the dashboard can rank fit and next steps.',
          nextStep: 'Open profile settings and add three target schools.',
        },
      ]

  const internshipIdeas = buildInternshipIdeas(profile)
  const earliestOpenDay = openDays[0] || 'one open day'
  const nextGoal = goals[0]?.title || 'Set one concrete goal'
  const nextActivity = activities[0]?.name || 'Capture one flagship activity'
  const plannerHighlights = [
    `Use ${earliestOpenDay} for applications, essays, or a university search block.`,
    targets[0]
      ? `Protect one planning session for ${targets[0]} and the evidence needed to support it.`
      : 'Shortlist three target universities before the week ends.',
    nextGoal,
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 text-slate-950 dark:text-white sm:px-6 lg:px-8">
      {isGuestPreview ? (
        <section className="rounded-[2rem] border border-[#f2c06d]/35 bg-[#f8f0d6]/70 p-5 shadow-sm dark:border-[#f2c06d]/20 dark:bg-[#f2c06d]/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Guest preview</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">This workspace is in demo mode.</h2>
              <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-200">
                You can scan the full product now. Create an account to save your own planner, target schools, and application history.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              <Link href="/demo" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">
                Open demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 px-4 py-2.5 text-slate-700 transition hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:text-white">
                Pricing
              </Link>
              <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 px-4 py-2.5 text-slate-700 transition hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:text-white">
                Create account
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">ElevateOS dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Student planning hub for admissions, activities, and internships.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Welcome back, {profile?.name || 'there'}. Keep target schools, activity evidence, and internship ideas in one place so the application story stays moving.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
              <Link href="/settings" className="inline-flex items-center gap-2 text-slate-950 transition-colors hover:text-[#9a5b00] dark:text-white dark:hover:text-[#f2c06d]">
                Edit profile
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#planner" className="inline-flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
                Open planner
                <CalendarClock className="h-4 w-4" />
              </Link>
              <Link href="#universities" className="inline-flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
                Review target schools
                <GraduationCap className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[32rem]">
            {[
              { label: 'Profile completeness', value: `${profileCompleteness}%`, note: 'Curriculum, targets, interests, and planner data' },
              { label: 'Target universities', value: `${targets.length}`, note: 'Schools currently in the list' },
              { label: 'Open days', value: `${openSlots}`, note: 'Weekly time available for planning' },
              { label: 'Activities tracked', value: `${activities.length}`, note: 'Logged activities and impact notes' },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{item.value}</p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
        <article id="planner" className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10 dark:border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2c06d]">Activity planner</p>
              <h2 className="mt-2 text-2xl font-semibold">Protect the open time first</h2>
            </div>
            <CalendarClock className="h-5 w-5 text-[#f2c06d]" />
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {DAYS.map((day) => {
              const isOpen = weekly[day] === 'open'
              return (
                <div
                  key={day}
                  className={[
                    'rounded-2xl border p-3',
                    isOpen ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-white/10 bg-white/5',
                  ].join(' ')}
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">{day}</p>
                  <p className={['mt-2 text-sm font-semibold', isOpen ? 'text-emerald-200' : 'text-white'].join(' ')}>
                    {isOpen ? 'Open' : 'Busy'}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Monthly calendar</p>
              <p className="text-xs text-white/55">
                {activeBlockedDates.length} blocked date{activeBlockedDates.length === 1 ? '' : 's'}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1 text-[10px] uppercase tracking-[0.2em] text-white/35">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={`${day}-${index}`} className="text-center">
                  {day}
                </div>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {monthGrid(currentMonth).map((date, index) => {
                if (!date) return <div key={index} className="h-8" />

                const iso = toIsoDate(date)
                const blocked = activeBlockedDates.includes(iso)
                const isToday = iso === todayIso

                return (
                  <div
                    key={iso}
                    className={[
                      'flex h-8 items-center justify-center rounded-md border text-xs',
                      blocked
                        ? 'border-amber-300 bg-amber-50 text-amber-800'
                        : isToday
                          ? 'border-[#f2c06d] bg-[#1f2937] text-[#f2c06d]'
                          : 'border-white/10 bg-white/5 text-white/75',
                    ].join(' ')}
                  >
                    {date.getDate()}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {plannerHighlights.map((item, index) => (
              <div key={item} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">Planner note {index + 1}</p>
                  <Sparkles className="h-4 w-4 text-[#f2c06d]" />
                </div>
                <p className="mt-3 text-sm leading-6 text-white/75">{item}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">Profile snapshot</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">What the dashboard is using</h2>
            </div>
            <Users className="h-5 w-5 text-[#9a5b00]" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ['Curriculum', profile?.curriculum || 'Not set'],
              ['Grade level', profile?.gradeLevel || 'Not set'],
              ['Intended major', profile?.intendedMajor || 'Not set'],
              ['GPA', typeof profile?.gpa === 'number' ? String(profile.gpa) : profile?.gpa ? String(profile.gpa) : 'Not set'],
              ['SAT', typeof profile?.satScore === 'number' ? String(profile.satScore) : profile?.satScore ? String(profile.satScore) : 'Not set'],
              ['Location', profile?.location || 'Not set'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{value as string}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Focus order</p>
            <div className="mt-3 space-y-3">
              {[
                nextGoal,
                nextActivity,
                interests[0] ? `Use ${interests[0]} as a filter for internships and extracurricular ideas.` : 'Add career interests in profile settings.',
              ].map((item, index) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-900/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-[#f2c06d] dark:bg-white dark:text-slate-950">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-700 dark:text-slate-200">
            {(subjects.length ? subjects : ['Add subjects']).map((item) => (
              <span key={item} className="rounded-full border border-slate-900/10 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                {item}
              </span>
            ))}
            {(coursesTaking.length ? coursesTaking : ['Add courses']).map((item) => (
              <span key={item} className="rounded-full border border-slate-900/10 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                {item}
              </span>
            ))}
            {(interests.length ? interests : ['Add interests']).map((item) => (
              <span key={item} className="rounded-full border border-slate-900/10 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                {item}
              </span>
            ))}
          </div>
        </article>
      </section>

      <section id="universities" className="grid gap-4 lg:grid-cols-[1.08fr_.92fr]">
        <article className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">Target universities</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Fit, sequencing, and next steps</h2>
            </div>
            <GraduationCap className="h-5 w-5 text-[#9a5b00]" />
          </div>

          <div className="mt-5 space-y-3">
            {universitySnapshots.map((university) => (
              <div key={university.name} className="rounded-[1.5rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-950 dark:text-white">{university.name}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{university.summary}</p>
                  </div>
                  <div className="rounded-full border border-[#f2c06d]/40 bg-[#f8f0d6] px-3 py-1 text-xs font-semibold text-[#8a5a00]">
                    {university.fitLabel} · {university.score}/100
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Target className="h-4 w-4 text-[#9a5b00]" />
                  <span>{university.nextStep}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10 dark:border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2c06d]">Admissions snapshot</p>
              <h2 className="mt-2 text-2xl font-semibold">The profile signal behind the list</h2>
            </div>
            <BarChart3 className="h-5 w-5 text-[#f2c06d]" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ['Profile signals', `${profileSignals}/9`],
              ['Activities logged', `${activities.length}`],
              ['Goal items', `${goals.length}`],
              ['Open days', `${openSlots}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">{label}</p>
                <p className="mt-2 text-3xl font-semibold">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Next moves</p>
              <CheckCircle2 className="h-4 w-4 text-[#f2c06d]" />
            </div>
            <div className="mt-3 space-y-2 text-sm leading-6 text-white/75">
              <p>1. Convert one activity into a quantified result line.</p>
              <p>2. Keep one admissions block tied to the highest-priority target.</p>
              <p>3. Use the internship shortlist to build one portfolio-ready artifact.</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/75">
            {(targets.length ? targets.slice(0, 4) : ['Add target universities']).map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {item}
              </span>
            ))}
          </div>
        </article>
      </section>

      <section id="internships" className="grid gap-4 lg:grid-cols-[1.08fr_.92fr]">
        <article className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10 dark:border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2c06d]">Internship finder</p>
              <h2 className="mt-2 text-2xl font-semibold">Ideas that fit the major story</h2>
            </div>
            <Briefcase className="h-5 w-5 text-[#f2c06d]" />
          </div>

          <div className="mt-5 space-y-3">
            {internshipIdeas.map((idea) => (
              <div key={idea.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-white">{idea.title}</p>
                    <p className="mt-1 text-sm text-white/65">{idea.org}</p>
                  </div>
                  <span className="rounded-full border border-[#f2c06d]/30 bg-[#f8f0d6]/10 px-3 py-1 text-xs font-semibold text-[#f5d59f]">
                    {idea.fit}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/75">{idea.why}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-white/55">
                  <Clock3 className="h-3.5 w-3.5 text-[#f2c06d]" />
                  <span>{idea.nextStep}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">Portfolio snapshot</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Courses, activities, and interests</h2>
            </div>
            <MapPin className="h-5 w-5 text-[#9a5b00]" />
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-[1.5rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Current courses</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-700 dark:text-slate-200">
                {(coursesTaking.length ? coursesTaking : ['Add courses']).map((item) => (
                  <span key={item} className="rounded-full border border-slate-900/10 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-slate-950/40">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Activities logged</p>
              <div className="mt-3 space-y-2">
                {activities.length ? (
                  activities.slice(0, 4).map((activity) => (
                    <div key={activity.name} className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950/40">
                      <p className="text-sm font-semibold text-slate-950 dark:text-white">{activity.name}</p>
                      {activity.impact ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{activity.impact}</p> : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-300">Add activity entries in settings so the dashboard can surface the strongest spikes.</p>
                )}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Career interests</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-700 dark:text-slate-200">
                {(interests.length ? interests : ['Add career interests']).map((item) => (
                  <span key={item} className="rounded-full border border-slate-900/10 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-slate-950/40">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>
      </section>

      <section id="actions">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">Shortcuts</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Jump directly to the next task</h2>
          </div>
          <p className="hidden text-sm text-slate-500 dark:text-slate-400 md:block">Built from the same profile data the planner uses.</p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { href: '/settings', label: 'Edit profile', desc: 'Update courses, targets, and weekly availability.', icon: Users },
            { href: '#planner', label: 'Open planner', desc: 'Review open days, blocked dates, and focus blocks.', icon: CalendarClock },
            { href: '#universities', label: 'Target schools', desc: 'Check fit, readiness, and next steps.', icon: GraduationCap },
            { href: '/demo', label: 'Open demo', desc: 'See the pitch-friendly walkthrough view.', icon: Sparkles },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group rounded-[1.5rem] border border-slate-900/10 bg-white p-5 transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/5 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-center justify-between gap-3">
                <action.icon className="h-6 w-6 text-[#9a5b00]" />
                <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#9a5b00]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{action.label}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{action.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
