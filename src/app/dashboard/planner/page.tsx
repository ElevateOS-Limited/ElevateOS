'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarClock, Loader, Sparkles, Plus, CheckCircle2, Clock3, Target, KanbanSquare, Filter } from 'lucide-react'

type Recommendation = {
  id: string
  title: string
  supportBy: string
  supportOffer: string
  subscription: string
  days: string[]
  outcome: string
  score: number
}

type ActivityDetail = {
  id: string
  providerName?: string | null
  category?: string | null
  region?: string | null
  mode?: 'online' | 'hybrid' | 'in_person' | null
  deadlineAt?: string | null
  status?: string | null
}

type Deadline = {
  id: string
  title: string
  dueAt: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
}

type CalendarEvent = {
  id: string
  title: string
  startsAt: string
  endsAt: string
}

const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const starterTemplates = [
  'Draft activity portfolio outline',
  'Submit 1 summer program application',
  'Schedule counselor checkpoint',
  'Create project progress post',
]

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export default function PlannerPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState<'timeline' | 'board'>('timeline')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  const [openDays, setOpenDays] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [availableSupport, setAvailableSupport] = useState<any[]>([])
  const [recommendationMeta, setRecommendationMeta] = useState<{ matchedCount: number; returnedCount: number; appliedFilterCount: number; hasActiveFilters: boolean; isEmptyResult?: boolean; emptyStateHint?: string | null } | null>(null)
  const [recommendationMinScore, setRecommendationMinScore] = useState(0)
  const [recommendationLimit, setRecommendationLimit] = useState(6)
  const [recommendationSupportFilter, setRecommendationSupportFilter] = useState('')
  const [recommendationCategoryFilter, setRecommendationCategoryFilter] = useState('')
  const [recommendationSortBy, setRecommendationSortBy] = useState<'score' | 'title'>('score')
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<string | null>(null)
  const [selectedRecommendationDetail, setSelectedRecommendationDetail] = useState<ActivityDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])

  const [newTask, setNewTask] = useState({ title: '', dueAt: '', priority: 'medium' as 'low' | 'medium' | 'high' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [r1, r2, r3] = await Promise.all([
        fetch(`/api/activities/recommend?limit=${recommendationLimit}&minScore=${recommendationMinScore}&supportBy=${encodeURIComponent(recommendationSupportFilter)}&category=${encodeURIComponent(recommendationCategoryFilter)}&sortBy=${recommendationSortBy}`).then((r) => r.json()),
        fetch('/api/deadlines').then((r) => r.json()),
        fetch('/api/calendar-events').then((r) => r.json()),
      ])
      setOpenDays(r1.openDays || [])
      setRecommendations(r1.recommendations || [])
      setAvailableSupport(r1.availableSupport || [])
      setRecommendationMeta(r1.meta || null)
      setDeadlines(r2 || [])
      setEvents(r3 || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load planner data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      load()
    }, 200)

    return () => clearTimeout(timer)
  }, [recommendationMinScore, recommendationLimit, recommendationSupportFilter, recommendationCategoryFilter, recommendationSortBy])

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)

  const stats = useMemo(() => {
    const completed = deadlines.filter((d) => d.completed).length
    const pending = deadlines.filter((d) => !d.completed).length
    const overdue = deadlines.filter((d) => !d.completed && d.dueAt.slice(0, 10) < todayStr).length
    const completionRate = deadlines.length ? Math.round((completed / deadlines.length) * 100) : 0
    return { completed, pending, overdue, completionRate }
  }, [deadlines, todayStr])

  const filteredDeadlines = useMemo(() => {
    if (priorityFilter === 'all') return deadlines
    return deadlines.filter((d) => d.priority === priorityFilter)
  }, [deadlines, priorityFilter])

  const upcoming = useMemo(() => {
    return filteredDeadlines
      .filter((d) => !d.completed)
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
      .slice(0, 8)
  }, [filteredDeadlines])

  const boardData = useMemo(() => {
    const endOfWeek = addDays(today, 7).toISOString().slice(0, 10)
    return {
      thisWeek: filteredDeadlines.filter((d) => !d.completed && d.dueAt.slice(0, 10) >= todayStr && d.dueAt.slice(0, 10) <= endOfWeek),
      later: filteredDeadlines.filter((d) => !d.completed && d.dueAt.slice(0, 10) > endOfWeek),
      overdue: filteredDeadlines.filter((d) => !d.completed && d.dueAt.slice(0, 10) < todayStr),
      done: filteredDeadlines.filter((d) => d.completed),
    }
  }, [filteredDeadlines, today, todayStr])

  const next14Days = useMemo(() => {
    const arr: string[] = []
    for (let i = 0; i < 14; i++) arr.push(addDays(today, i).toISOString().slice(0, 10))
    return arr
  }, [today])

  const dayLoad = (day: string) => {
    const deadlineCount = deadlines.filter((d) => d.dueAt.slice(0, 10) === day && !d.completed).length
    const eventCount = events.filter((e) => e.startsAt.slice(0, 10) === day).length
    return deadlineCount + eventCount
  }

  const formatMode = (mode?: ActivityDetail['mode']) => {
    if (!mode) return 'n/a'
    return mode.replace('_', ' ')
  }

  const loadRecommendationDetail = async (id: string) => {
    setSelectedRecommendationId(id)
    setDetailLoading(true)
    try {
      const response = await fetch(`/api/activities/${id}`)
      if (!response.ok) {
        setSelectedRecommendationDetail(null)
        return
      }
      const detail = await response.json()
      setSelectedRecommendationDetail(detail)
    } finally {
      setDetailLoading(false)
    }
  }

  const clearRecommendationFilters = () => {
    setRecommendationMinScore(0)
    setRecommendationLimit(6)
    setRecommendationSupportFilter('')
    setRecommendationCategoryFilter('')
    setRecommendationSortBy('score')
  }

  const addTask = async (override?: Partial<typeof newTask>) => {
    const payload = { ...newTask, ...override }
    if (!payload.title || !payload.dueAt) return
    setSaving(true)
    try {
      await fetch('/api/deadlines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setNewTask({ title: '', dueAt: '', priority: 'medium' })
      await load()
    } finally {
      setSaving(false)
    }
  }

  const markDone = async (id: string, completed: boolean) => {
    await fetch('/api/deadlines', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, completed }),
    })
    await load()
  }

  const addRecommendationToQueue = async (r: Recommendation) => {
    const due = addDays(new Date(), 5).toISOString().slice(0, 10)
    await addTask({ title: `Start: ${r.title}`, dueAt: due, priority: 'high' })
  }

  const generateStarterSprint = async () => {
    const tasks = starterTemplates.map((t, idx) => ({
      title: t,
      dueAt: addDays(new Date(), idx + 1).toISOString().slice(0, 10),
      priority: idx === 0 ? 'high' : 'medium',
    }))
    setSaving(true)
    try {
      await Promise.all(tasks.map((t) => fetch('/api/deadlines', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t),
      })))
      await load()
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-gray-500 flex items-center gap-2"><Loader className="w-4 h-4 animate-spin" /> Building your planner...</div>

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><CalendarClock className="w-8 h-8 text-indigo-600" /> Activity Tracker & Admissions Planner</h1>
          <p className="text-gray-500 mt-2">Visual planning for weekly execution, activity depth, and portfolio growth.</p>
        </div>
        <button onClick={generateStarterSprint} disabled={saving} className="rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm inline-flex items-center gap-2 disabled:opacity-60">
          <Sparkles className="w-4 h-4" /> Auto-build 4-day sprint
        </button>
      </div>

      {error && <div className="p-4 rounded-xl border border-red-300 bg-red-50 text-red-700">{error}</div>}

      <section className="grid md:grid-cols-4 gap-4">
        <div className="rounded-2xl border p-4 bg-white dark:bg-gray-900">
          <p className="text-xs text-gray-500">Completion</p>
          <p className="text-2xl font-bold">{stats.completionRate}%</p>
          <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
            <div className="h-2 bg-indigo-600 rounded-full transition-all" style={{ width: `${stats.completionRate}%` }} />
          </div>
        </div>
        <div className="rounded-2xl border p-4 bg-white dark:bg-gray-900"><p className="text-xs text-gray-500">Completed</p><p className="text-2xl font-bold text-green-600">{stats.completed}</p></div>
        <div className="rounded-2xl border p-4 bg-white dark:bg-gray-900"><p className="text-xs text-gray-500">Pending</p><p className="text-2xl font-bold text-amber-600">{stats.pending}</p></div>
        <div className="rounded-2xl border p-4 bg-white dark:bg-gray-900"><p className="text-xs text-gray-500">Overdue</p><p className="text-2xl font-bold text-red-600">{stats.overdue}</p></div>
      </section>

      <section className="flex flex-wrap items-center gap-2">
        <button onClick={() => setView('timeline')} className={`px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-1 ${view === 'timeline' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}><Clock3 className="w-4 h-4" /> Timeline</button>
        <button onClick={() => setView('board')} className={`px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-1 ${view === 'board' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}><KanbanSquare className="w-4 h-4" /> Kanban</button>
        <div className="ml-2 text-xs text-gray-500 inline-flex items-center gap-1"><Filter className="w-3 h-3" /> Priority:</div>
        {(['all', 'high', 'medium', 'low'] as const).map((p) => (
          <button key={p} onClick={() => setPriorityFilter(p)} className={`px-2 py-1 text-xs rounded-md ${priorityFilter === p ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}>{p}</button>
        ))}
      </section>

      {view === 'timeline' ? (
        <section className="bg-white dark:bg-gray-900 rounded-2xl border p-6">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><Clock3 className="w-4 h-4 text-indigo-600" /> Next 14 Days Workload View</h2>
          <div className="grid grid-cols-7 md:grid-cols-14 gap-2">
            {next14Days.map((day) => {
              const load = dayLoad(day)
              const d = new Date(day)
              return (
                <div key={day} className={`rounded-lg border p-2 text-center ${load >= 3 ? 'bg-red-50 border-red-200' : load === 2 ? 'bg-amber-50 border-amber-200' : load === 1 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <p className="text-[10px] text-gray-500">{weekDays[d.getDay()].slice(0, 3)}</p>
                  <p className="text-sm font-semibold">{d.getDate()}</p>
                  <p className="text-[10px] mt-1">{load} items</p>
                </div>
              )
            })}
          </div>
        </section>
      ) : (
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {([
            { key: 'overdue', title: 'Overdue', items: boardData.overdue, tone: 'border-red-200 bg-red-50' },
            { key: 'thisWeek', title: 'This Week', items: boardData.thisWeek, tone: 'border-amber-200 bg-amber-50' },
            { key: 'later', title: 'Later', items: boardData.later, tone: 'border-blue-200 bg-blue-50' },
            { key: 'done', title: 'Done', items: boardData.done, tone: 'border-green-200 bg-green-50' },
          ] as const).map((col) => (
            <div key={col.key} className={`rounded-2xl border p-3 ${col.tone}`}>
              <h3 className="font-semibold text-sm mb-2">{col.title} ({col.items.length})</h3>
              <div className="space-y-2 max-h-72 overflow-auto">
                {col.items.map((d) => (
                  <div key={d.id} className="rounded-lg border bg-white p-2">
                    <p className="text-sm font-medium">{d.title}</p>
                    <p className="text-[11px] text-gray-500">{new Date(d.dueAt).toLocaleDateString()} • {d.priority}</p>
                    <button onClick={() => markDone(d.id, !d.completed)} className="text-xs mt-1 text-indigo-600">{d.completed ? 'Reopen' : 'Mark done'}</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><Target className="w-4 h-4 text-indigo-600" /> Action Queue</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input value={newTask.title} onChange={(e) => setNewTask((s) => ({ ...s, title: e.target.value }))} placeholder="Add activity task..." className="md:col-span-2 rounded-lg border px-3 py-2 bg-transparent" />
            <input type="date" value={newTask.dueAt} onChange={(e) => setNewTask((s) => ({ ...s, dueAt: e.target.value }))} className="rounded-lg border px-3 py-2 bg-transparent" />
          </div>
          <div className="flex items-center gap-2">
            <select value={newTask.priority} onChange={(e) => setNewTask((s) => ({ ...s, priority: e.target.value as any }))} className="rounded-lg border px-3 py-2 bg-transparent text-sm">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
            <button onClick={() => addTask()} disabled={saving} className="rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm inline-flex items-center gap-1 disabled:opacity-60"><Plus className="w-4 h-4" /> Add Task</button>
          </div>

          <div className="flex flex-wrap gap-2">
            {starterTemplates.map((t) => (
              <button key={t} onClick={() => addTask({ title: t, dueAt: addDays(new Date(), 3).toISOString().slice(0, 10), priority: 'medium' })} className="text-xs px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200">
                + {t}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-80 overflow-auto pr-1">
            {upcoming.length === 0 && <p className="text-sm text-gray-500">No upcoming tasks yet.</p>}
            {upcoming.map((d) => (
              <div key={d.id} className="border rounded-xl p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">{d.title}</p>
                  <p className="text-xs text-gray-500">Due {new Date(d.dueAt).toLocaleDateString()} • {d.priority}</p>
                </div>
                <button onClick={() => markDone(d.id, true)} className="text-green-600 text-sm inline-flex items-center gap-1"><CheckCircle2 className="w-4 h-4" />Done</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-600" /> Recommended Activities</h2>
          <p className="text-sm text-gray-500 mb-3">Open days: {openDays.join(', ') || 'None set'}</p>
          <div className="mb-3 rounded-lg border p-2 bg-gray-50 space-y-2">
            <label className="text-xs text-gray-600 block">Minimum fit score: {recommendationMinScore}</label>
            <input
              type="range"
              min={0}
              max={12}
              step={1}
              value={recommendationMinScore}
              onChange={(e) => setRecommendationMinScore(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">Result count</label>
              <select
                value={recommendationLimit}
                onChange={(e) => setRecommendationLimit(Number(e.target.value))}
                className="rounded-md border px-2 py-1 text-xs bg-white"
              >
                {[3, 6, 9, 12].map((count) => (
                  <option key={count} value={count}>{count}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">Support filter</label>
              <select
                value={recommendationSupportFilter}
                onChange={(e) => setRecommendationSupportFilter(e.target.value)}
                className="rounded-md border px-2 py-1 text-xs bg-white"
              >
                <option value="">All</option>
                <option value="school">School</option>
                <option value="mentor">Mentor</option>
                <option value="parent">Parent</option>
                <option value="coach">Coach</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">Category</label>
              <select
                value={recommendationCategoryFilter}
                onChange={(e) => setRecommendationCategoryFilter(e.target.value)}
                className="rounded-md border px-2 py-1 text-xs bg-white"
              >
                <option value="">All</option>
                <option value="research">Research</option>
                <option value="community">Community</option>
                <option value="competition">Competition</option>
                <option value="leadership">Leadership</option>
                <option value="creative">Creative</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">Sort</label>
              <select
                value={recommendationSortBy}
                onChange={(e) => setRecommendationSortBy(e.target.value as 'score' | 'title')}
                className="rounded-md border px-2 py-1 text-xs bg-white"
              >
                <option value="score">Best fit</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
            <button
              onClick={clearRecommendationFilters}
              className="text-xs px-2 py-1 rounded-md border border-gray-300 bg-white text-gray-700"
            >
              Clear filters
            </button>
          </div>
          {recommendationMeta && (
            <p className="text-xs text-gray-500 mb-2">
              Showing {recommendationMeta.returnedCount} of {recommendationMeta.matchedCount} matched opportunities
              {recommendationMeta.hasActiveFilters ? ` • ${recommendationMeta.appliedFilterCount} active filter(s)` : ' • no active filters'}
            </p>
          )}
          {recommendationMeta?.isEmptyResult && (
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {recommendationMeta.emptyStateHint || 'No matching recommendations yet. Try relaxing filters.'}
            </div>
          )}
          <div className="space-y-3 max-h-96 overflow-auto pr-1">
            {recommendations.length === 0 && (
              <div className="border rounded-xl p-4 text-xs text-gray-600 bg-gray-50">
                No activities to show with the current filters.
              </div>
            )}
            {recommendations.map((r) => (
              <div key={r.id} className={`border rounded-xl p-4 hover:border-indigo-300 transition-colors ${selectedRecommendationId === r.id ? 'border-indigo-400 bg-indigo-50/50' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm">{r.title}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">Fit {r.score}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{r.outcome}</p>
                <p className="text-xs mt-2">Support: {r.supportBy}</p>
                <p className="text-xs">Plan: {r.subscription}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => addRecommendationToQueue(r)} className="text-xs px-2 py-1 rounded-md bg-indigo-600 text-white">Add to action queue</button>
                  <button onClick={() => loadRecommendationDetail(r.id)} className="text-xs px-2 py-1 rounded-md border border-indigo-200 text-indigo-700">View details</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border p-3 bg-gray-50">
            <p className="text-xs font-semibold text-gray-700 mb-2">Opportunity detail preview</p>
            {detailLoading && <p className="text-xs text-gray-500">Loading details...</p>}
            {!detailLoading && !selectedRecommendationDetail && (
              <p className="text-xs text-gray-500">Select a recommendation and click “View details” to load scoped API details.</p>
            )}
            {!detailLoading && selectedRecommendationDetail && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <p><span className="text-gray-500">Provider:</span> {selectedRecommendationDetail.providerName || 'n/a'}</p>
                <p><span className="text-gray-500">Category:</span> {selectedRecommendationDetail.category || 'n/a'}</p>
                <p><span className="text-gray-500">Region:</span> {selectedRecommendationDetail.region || 'n/a'}</p>
                <p><span className="text-gray-500">Mode:</span> {formatMode(selectedRecommendationDetail.mode)}</p>
                <p><span className="text-gray-500">Status:</span> {selectedRecommendationDetail.status || 'n/a'}</p>
                <p><span className="text-gray-500">Deadline:</span> {selectedRecommendationDetail.deadlineAt ? new Date(selectedRecommendationDetail.deadlineAt).toLocaleDateString() : 'n/a'}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-900 rounded-2xl border p-6">
        <h2 className="font-semibold mb-4">Support Coverage Map</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {availableSupport.map((s, i) => (
            <div key={i} className="border rounded-xl p-3">
              <p className="font-medium text-sm">{s.title}</p>
              <p className="text-xs text-gray-500">{s.supportBy}</p>
              <p className="text-xs mt-1">{s.supportOffer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
