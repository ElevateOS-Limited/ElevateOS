'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Settings, User, Save, Loader, Plus, X } from 'lucide-react'
import { CURRICULA, GRADE_LEVELS } from '@/lib/utils'

type GoalItem = { title: string; target: string }
type ActivityItem = { name: string; impact: string }

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

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
    Object.fromEntries(DAYS.map((d) => [d, 'busy'])) as Record<string, 'busy' | 'open'>
  )
  const [viewMonth, setViewMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/user/profile')
        const data = await res.json()
        if (!data) return
        setForm((prev) => ({
          ...prev,
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
        }))
        if (Array.isArray(data.goals) && data.goals.length) setGoals(data.goals)
        if (Array.isArray(data.activitiesDone) && data.activitiesDone.length) setActivitiesDone(data.activitiesDone)
        if (data.weeklyAvailability && typeof data.weeklyAvailability === 'object') {
          const raw = data.weeklyAvailability as any
          const weekly = raw.weekly && typeof raw.weekly === 'object' ? raw.weekly : raw
          const blocked = Array.isArray(raw.blockedDates) ? raw.blockedDates : []
          setAvailability({ ...Object.fromEntries(DAYS.map((d) => [d, 'busy'])), ...weekly })
          setBlockedDates(blocked)
        }
      } finally {
        setLoadingProfile(false)
      }
    }
    load()
  }, [session?.user?.name])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          coursesTaking: form.coursesTakingText.split(',').map((x) => x.trim()).filter(Boolean),
          targetUniversities: form.targetUniversitiesText.split(',').map((x) => x.trim()).filter(Boolean),
          careerInterests: form.careerInterestsText.split(',').map((x) => x.trim()).filter(Boolean),
          goals: goals.filter((g) => g.title || g.target),
          activitiesDone: activitiesDone.filter((a) => a.name || a.impact),
          weeklyAvailability: {
            weekly: availability,
            blockedDates,
          },
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loadingProfile) {
    return <div className="p-8 text-gray-500">Loading profile...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3"><Settings className="w-8 h-8 text-gray-600" /> Student Profile & Planner</h1>
        <p className="text-gray-500 dark:text-gray-400">Build a personalized profile so AI can recommend top-university activities and schedule them around your open days.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
        <h2 className="font-semibold flex items-center gap-2"><User className="w-4 h-4" /> Core Profile</h2>

        <div>
          <label className="block text-sm font-medium mb-1.5">Full Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl bg-transparent" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Grade Level</label>
            <select value={form.gradeLevel} onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl bg-transparent">
              <option value="">Select...</option>
              {GRADE_LEVELS.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Curriculum</label>
            <select value={form.curriculum} onChange={(e) => setForm({ ...form, curriculum: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl bg-transparent">
              <option value="">Select...</option>
              {CURRICULA.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium mb-1.5">GPA</label><input type="number" step="0.01" value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl bg-transparent" /></div>
          <div><label className="block text-sm font-medium mb-1.5">SAT</label><input type="number" value={form.satScore} onChange={(e) => setForm({ ...form, satScore: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl bg-transparent" /></div>
          <div><label className="block text-sm font-medium mb-1.5">ACT</label><input type="number" value={form.actScore} onChange={(e) => setForm({ ...form, actScore: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl bg-transparent" /></div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Courses Taking (comma separated)</label>
          <input value={form.coursesTakingText} onChange={(e) => setForm({ ...form, coursesTakingText: e.target.value })} placeholder="IB Physics HL, AP Calculus BC, AP CS" className="w-full px-4 py-2.5 border rounded-xl bg-transparent" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Who are you? (max 100 words)</label>
          <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={600} rows={3} className="w-full px-4 py-2.5 border rounded-xl bg-transparent" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Activities done so far</label>
          {activitiesDone.map((a, i) => (
            <div key={i} className="grid md:grid-cols-[1fr_1fr_auto] gap-2 mb-2">
              <input value={a.name} onChange={(e) => setActivitiesDone(activitiesDone.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} placeholder="Activity" className="px-3 py-2 border rounded-lg bg-transparent" />
              <input value={a.impact} onChange={(e) => setActivitiesDone(activitiesDone.map((x, idx) => idx === i ? { ...x, impact: e.target.value } : x))} placeholder="Impact / result" className="px-3 py-2 border rounded-lg bg-transparent" />
              <button type="button" onClick={() => setActivitiesDone(activitiesDone.filter((_, idx) => idx !== i))} className="p-2 border rounded-lg"><X className="w-4 h-4" /></button>
            </div>
          ))}
          <button type="button" onClick={() => setActivitiesDone([...activitiesDone, { name: '', impact: '' }])} className="text-sm text-violet-600 flex items-center gap-1"><Plus className="w-4 h-4" /> Add activity</button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Goal Tracker</label>
          {goals.map((g, i) => (
            <div key={i} className="grid md:grid-cols-[1fr_1fr_auto] gap-2 mb-2">
              <input value={g.title} onChange={(e) => setGoals(goals.map((x, idx) => idx === i ? { ...x, title: e.target.value } : x))} placeholder="Goal (e.g., Top 20 STEM)" className="px-3 py-2 border rounded-lg bg-transparent" />
              <input value={g.target} onChange={(e) => setGoals(goals.map((x, idx) => idx === i ? { ...x, target: e.target.value } : x))} placeholder="Target timeline" className="px-3 py-2 border rounded-lg bg-transparent" />
              <button type="button" onClick={() => setGoals(goals.filter((_, idx) => idx !== i))} className="p-2 border rounded-lg"><X className="w-4 h-4" /></button>
            </div>
          ))}
          <button type="button" onClick={() => setGoals([...goals, { title: '', target: '' }])} className="text-sm text-violet-600 flex items-center gap-1"><Plus className="w-4 h-4" /> Add goal</button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Career interests (comma separated)</label>
          <input value={form.careerInterestsText} onChange={(e) => setForm({ ...form, careerInterestsText: e.target.value })} placeholder="AI, public policy, medicine" className="w-full px-4 py-2.5 border rounded-xl bg-transparent" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Target universities (comma separated)</label>
          <input value={form.targetUniversitiesText} onChange={(e) => setForm({ ...form, targetUniversitiesText: e.target.value })} placeholder="Stanford, MIT, UCL" className="w-full px-4 py-2.5 border rounded-xl bg-transparent" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Additional preferences for AI (not in profile)</label>
          <textarea value={form.customPreferences} onChange={(e) => setForm({ ...form, customPreferences: e.target.value })} rows={3} placeholder="I want to help my community and prefer non-academic opportunities twice a month..." className="w-full px-4 py-2.5 border rounded-xl bg-transparent" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Weekly availability (busy vs open)</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {DAYS.map((day) => (
              <button key={day} type="button" onClick={() => setAvailability({ ...availability, [day]: availability[day] === 'open' ? 'busy' : 'open' })}
                className={`px-3 py-2 rounded-lg border text-sm ${availability[day] === 'open' ? 'bg-green-100 border-green-300 text-green-700' : 'bg-gray-100 border-gray-300 text-gray-700'}`}>
                {day}: {availability[day]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Monthly calendar (mark blocked dates)</label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))} className="px-2 py-1 border rounded">←</button>
              <span className="text-sm font-medium min-w-[140px] text-center">{viewMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
              <button type="button" onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))} className="px-2 py-1 border rounded">→</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-xs text-gray-500 mb-2">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => <div key={d} className="text-center">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {monthGrid(viewMonth).map((date, idx) => {
              if (!date) return <div key={idx} className="h-10" />
              const iso = toIsoDate(date)
              const blocked = blockedDates.includes(iso)
              return (
                <button
                  type="button"
                  key={iso}
                  onClick={() => setBlockedDates(blocked ? blockedDates.filter((d) => d !== iso) : [...blockedDates, iso])}
                  className={`h-10 rounded-lg border text-sm ${blocked ? 'bg-red-100 border-red-300 text-red-700' : 'bg-white border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200'}`}
                  title={blocked ? 'Blocked day' : 'Available day'}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">Tap dates to mark blocked days. Later we will auto-overlay activity durations on open dates.</p>
        </div>

        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50">
          {saving ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save Student Profile'}</>}
        </button>
      </form>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="font-semibold mb-4">Account Information</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Email</span><span>{session?.user?.email}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Plan</span><span className="capitalize font-medium text-violet-600">{session?.user?.plan?.toLowerCase() || 'free'}</span></div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Link href="/pricing" className="text-sm text-violet-600 hover:underline">Upgrade plan for more activity support →</Link>
        </div>
      </div>
    </div>
  )
}
