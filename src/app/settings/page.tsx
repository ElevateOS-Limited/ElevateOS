'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ArrowRight, Loader2, Plus, Save, Settings, User, X } from 'lucide-react'
import { CURRICULA, GRADE_LEVELS } from '@/lib/utils'

type GoalItem = { title: string; target: string }
type ActivityItem = { name: string; impact: string }

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

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

export default function SettingsPage() {
  const { data: session } = useSession()
  const [form, setForm] = useState({
    name: '',
    gradeLevel: '',
    curriculum: '',
    intendedMajor: '',
    gpa: '',
    satScore: '',
    actScore: '',
    bio: '',
    coursesTakingText: '',
    targetUniversitiesText: '',
    careerInterestsText: '',
    customPreferences: '',
  })
  const [goals, setGoals] = useState<GoalItem[]>([{ title: '', target: '' }])
  const [activitiesDone, setActivitiesDone] = useState<ActivityItem[]>([{ name: '', impact: '' }])
  const [availability, setAvailability] = useState<Record<string, 'busy' | 'open'>>(
    Object.fromEntries(DAYS.map((day) => [day, 'busy'])) as Record<string, 'busy' | 'open'>,
  )
  const [viewMonth, setViewMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/profile')
        if (!response.ok) return

        const data = await response.json()
        setForm({
          name: data.name || session?.user?.name || '',
          gradeLevel: data.gradeLevel || '',
          curriculum: data.curriculum || '',
          intendedMajor: data.intendedMajor || '',
          gpa: data.gpa?.toString?.() || '',
          satScore: data.satScore?.toString?.() || '',
          actScore: data.actScore?.toString?.() || '',
          bio: data.bio || '',
          coursesTakingText: (data.coursesTaking || []).join(', '),
          targetUniversitiesText: (data.targetUniversities || []).join(', '),
          careerInterestsText: (data.careerInterests || []).join(', '),
          customPreferences: data.customPreferences || '',
        })

        if (Array.isArray(data.goals) && data.goals.length) setGoals(data.goals)
        if (Array.isArray(data.activitiesDone) && data.activitiesDone.length) setActivitiesDone(data.activitiesDone)

        if (data.weeklyAvailability && typeof data.weeklyAvailability === 'object') {
          const raw = data.weeklyAvailability as { weekly?: Record<string, 'busy' | 'open'>; blockedDates?: string[] }
          const weekly = raw.weekly && typeof raw.weekly === 'object' ? raw.weekly : (raw as Record<string, 'busy' | 'open'>)
          const blocked = Array.isArray(raw.blockedDates) ? raw.blockedDates : []
          const baseAvailability = Object.fromEntries(DAYS.map((day) => [day, 'busy'])) as Record<string, 'busy' | 'open'>
          setAvailability({ ...baseAvailability, ...weekly })
          setBlockedDates(blocked)
        }
      } finally {
        setLoadingProfile(false)
      }
    }

    load()
  }, [session?.user?.name])

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)

    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          coursesTaking: form.coursesTakingText.split(',').map((value) => value.trim()).filter(Boolean),
          targetUniversities: form.targetUniversitiesText.split(',').map((value) => value.trim()).filter(Boolean),
          careerInterests: form.careerInterestsText.split(',').map((value) => value.trim()).filter(Boolean),
          goals: goals.filter((goal) => goal.title || goal.target),
          activitiesDone: activitiesDone.filter((activity) => activity.name || activity.impact),
          weeklyAvailability: {
            weekly: availability,
            blockedDates,
          },
        }),
      })

      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  if (loadingProfile) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center bg-[#f8f5ef] text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        <div className="flex items-center gap-3 rounded-[1.5rem] border border-slate-900/10 bg-white/90 px-5 py-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <Loader2 className="h-4 w-4 animate-spin text-[#9a5b00]" />
          <p className="text-sm font-medium">Loading profile…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 text-slate-950 dark:text-white sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Settings className="h-7 w-7 text-[#9a5b00]" />
            <div>
              <h1 className="font-display text-4xl tracking-tight text-slate-950 dark:text-white">Profile & planner</h1>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Keep the student profile, goals, and weekly availability in one place. The dashboard uses this data to stay in sync.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-950 transition-colors hover:text-[#9a5b00] dark:text-white dark:hover:text-[#f2c06d]">
              Back to dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
              Dashboard
              <User className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <form onSubmit={handleSave} className="space-y-6">
        <section className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950 dark:text-white">
            <User className="h-4 w-4 text-[#9a5b00]" />
            Core profile
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Full name
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="rounded-[1rem] border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a5b00] dark:border-white/10 dark:bg-slate-950/40" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Grade level
              <select value={form.gradeLevel} onChange={(event) => setForm({ ...form, gradeLevel: event.target.value })} className="rounded-[1rem] border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a5b00] dark:border-white/10 dark:bg-slate-950/40">
                <option value="">Select...</option>
                {GRADE_LEVELS.map((grade) => (
                  <option key={grade}>{grade}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Curriculum
              <select value={form.curriculum} onChange={(event) => setForm({ ...form, curriculum: event.target.value })} className="rounded-[1rem] border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a5b00] dark:border-white/10 dark:bg-slate-950/40">
                <option value="">Select...</option>
                {CURRICULA.map((curriculum) => (
                  <option key={curriculum}>{curriculum}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Intended major
              <input value={form.intendedMajor} onChange={(event) => setForm({ ...form, intendedMajor: event.target.value })} className="rounded-[1rem] border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a5b00] dark:border-white/10 dark:bg-slate-950/40" />
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              GPA
              <input type="number" step="0.01" value={form.gpa} onChange={(event) => setForm({ ...form, gpa: event.target.value })} className="rounded-[1rem] border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a5b00] dark:border-white/10 dark:bg-slate-950/40" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              SAT
              <input type="number" value={form.satScore} onChange={(event) => setForm({ ...form, satScore: event.target.value })} className="rounded-[1rem] border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a5b00] dark:border-white/10 dark:bg-slate-950/40" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              ACT
              <input type="number" value={form.actScore} onChange={(event) => setForm({ ...form, actScore: event.target.value })} className="rounded-[1rem] border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a5b00] dark:border-white/10 dark:bg-slate-950/40" />
            </label>
          </div>

          <label className="mt-4 flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            Short bio
            <textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} rows={3} maxLength={600} className="rounded-[1rem] border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a5b00] dark:border-white/10 dark:bg-slate-950/40" />
          </label>
        </section>

        <section className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Activities and goals</h2>

          <div className="mt-5 space-y-4">
            <div>
              <div className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">Activities done so far</div>
              {activitiesDone.map((activity, index) => (
                <div key={index} className="mb-2 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                  <input
                    value={activity.name}
                    onChange={(event) => setActivitiesDone(activitiesDone.map((item, itemIndex) => (itemIndex === index ? { ...item, name: event.target.value } : item)))}
                    placeholder="Activity"
                    className="rounded-[1rem] border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a5b00] dark:border-white/10 dark:bg-slate-950/40"
                  />
                  <input
                    value={activity.impact}
                    onChange={(event) => setActivitiesDone(activitiesDone.map((item, itemIndex) => (itemIndex === index ? { ...item, impact: event.target.value } : item)))}
                    placeholder="Impact / result"
                    className="rounded-[1rem] border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a5b00] dark:border-white/10 dark:bg-slate-950/40"
                  />
                  <button
                    type="button"
                    onClick={() => setActivitiesDone(activitiesDone.filter((_, itemIndex) => itemIndex !== index))}
                    className="inline-flex items-center justify-center rounded-[1rem] border border-slate-900/10 bg-white px-3 py-3 text-slate-500 transition-colors hover:text-slate-950 dark:border-white/10 dark:bg-slate-950/40 dark:hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setActivitiesDone([...activitiesDone, { name: '', impact: '' }])} className="inline-flex items-center gap-2 text-sm font-semibold text-[#9a5b00] transition-colors hover:text-[#7c4700]">
                <Plus className="h-4 w-4" />
                Add activity
              </button>
            </div>

            <div>
              <div className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">Goal tracker</div>
              {goals.map((goal, index) => (
                <div key={index} className="mb-2 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                  <input
                    value={goal.title}
                    onChange={(event) => setGoals(goals.map((item, itemIndex) => (itemIndex === index ? { ...item, title: event.target.value } : item)))}
                    placeholder="Goal"
                    className="rounded-[1rem] border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a5b00] dark:border-white/10 dark:bg-slate-950/40"
                  />
                  <input
                    value={goal.target}
                    onChange={(event) => setGoals(goals.map((item, itemIndex) => (itemIndex === index ? { ...item, target: event.target.value } : item)))}
                    placeholder="Target timeline"
                    className="rounded-[1rem] border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a5b00] dark:border-white/10 dark:bg-slate-950/40"
                  />
                  <button
                    type="button"
                    onClick={() => setGoals(goals.filter((_, itemIndex) => itemIndex !== index))}
                    className="inline-flex items-center justify-center rounded-[1rem] border border-slate-900/10 bg-white px-3 py-3 text-slate-500 transition-colors hover:text-slate-950 dark:border-white/10 dark:bg-slate-950/40 dark:hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setGoals([...goals, { title: '', target: '' }])} className="inline-flex items-center gap-2 text-sm font-semibold text-[#9a5b00] transition-colors hover:text-[#7c4700]">
                <Plus className="h-4 w-4" />
                Add goal
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Planning details</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
              Courses taking
              <input value={form.coursesTakingText} onChange={(event) => setForm({ ...form, coursesTakingText: event.target.value })} placeholder="IB Physics HL, IB Math AA HL" className="rounded-[1rem] border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a5b00] dark:border-white/10 dark:bg-slate-950/40" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Target universities
              <input value={form.targetUniversitiesText} onChange={(event) => setForm({ ...form, targetUniversitiesText: event.target.value })} placeholder="Stanford, MIT, UCL" className="rounded-[1rem] border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a5b00] dark:border-white/10 dark:bg-slate-950/40" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Career interests
              <input value={form.careerInterestsText} onChange={(event) => setForm({ ...form, careerInterestsText: event.target.value })} placeholder="AI, medicine, entrepreneurship" className="rounded-[1rem] border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a5b00] dark:border-white/10 dark:bg-slate-950/40" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2">
              Additional preferences
              <textarea value={form.customPreferences} onChange={(event) => setForm({ ...form, customPreferences: event.target.value })} rows={3} placeholder="I want a stronger focus on exam timing..." className="rounded-[1rem] border border-slate-900/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a5b00] dark:border-white/10 dark:bg-slate-950/40" />
            </label>
          </div>

          <div className="mt-5">
            <div className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">Weekly availability</div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setAvailability({ ...availability, [day]: availability[day] === 'open' ? 'busy' : 'open' })}
                  className={[
                    'rounded-[1rem] border px-3 py-2 text-sm font-medium transition-colors',
                    availability[day] === 'open'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200'
                      : 'border-slate-900/10 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200',
                  ].join(' ')}
                >
                  {day}: {availability[day]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Monthly calendar</div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))} className="rounded-lg border border-slate-900/10 bg-white px-2 py-1 text-sm text-slate-600 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-300">
                  ←
                </button>
                <span className="min-w-[140px] text-center text-sm font-medium text-slate-700 dark:text-slate-200">
                  {viewMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button type="button" onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))} className="rounded-lg border border-slate-900/10 bg-white px-2 py-1 text-sm text-slate-600 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-300">
                  →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-xs text-slate-500 dark:text-slate-400">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center">
                  {day}
                </div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {monthGrid(viewMonth).map((date, index) => {
                if (!date) return <div key={index} className="h-10" />

                const iso = toIsoDate(date)
                const blocked = blockedDates.includes(iso)

                return (
                  <button
                    type="button"
                    key={iso}
                    onClick={() => setBlockedDates(blocked ? blockedDates.filter((item) => item !== iso) : [...blockedDates, iso])}
                    className={[
                      'h-10 rounded-xl border text-sm transition-colors',
                      blocked
                        ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200'
                        : 'border-slate-900/10 bg-white text-slate-700 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200',
                    ].join(' ')}
                    title={blocked ? 'Blocked day' : 'Available day'}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Tap dates to mark blocked days. The dashboard reads the same availability into the live overview.
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Account information</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-slate-500 dark:text-slate-400">Email</span>
              <span className="text-slate-900 dark:text-white">{session?.user?.email || 'Not set'}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500 dark:text-slate-400">Plan</span>
              <span className="font-medium text-[#9a5b00]">{session?.user?.plan?.toLowerCase() || 'free'}</span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-[1rem] bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saved ? 'Saved' : 'Save profile'}
            </button>
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-[1rem] border border-slate-900/10 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5">
              Return to dashboard
            </Link>
          </div>
        </section>
      </form>
    </div>
  )
}
