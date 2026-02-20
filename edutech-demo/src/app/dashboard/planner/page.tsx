'use client'

import { useEffect, useState } from 'react'
import { CalendarClock, Loader, Sparkles } from 'lucide-react'

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

export default function PlannerPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDays, setOpenDays] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [availableSupport, setAvailableSupport] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/activities/recommend')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load recommendations')
        setOpenDays(data.openDays || [])
        setRecommendations(data.recommendations || [])
        setAvailableSupport(data.availableSupport || [])
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="p-8 text-gray-500 flex items-center gap-2"><Loader className="w-4 h-4 animate-spin" /> Generating personalized activity plan...</div>

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3"><CalendarClock className="w-8 h-8 text-indigo-600" /> Activity Scheduler & University Planner</h1>
        <p className="text-gray-500 mt-2">AI matches your profile + goals + availability to opportunities that improve top-university outcomes.</p>
      </div>

      {error && <div className="p-4 rounded-xl border border-red-300 bg-red-50 text-red-700">{error}</div>}

      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="font-semibold mb-3">Open days detected</h2>
        {openDays.length ? (
          <div className="flex flex-wrap gap-2">{openDays.map((d) => <span key={d} className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">{d}</span>)}</div>
        ) : (
          <p className="text-sm text-gray-500">No open days found. Update schedule in Settings to get better recommendations.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-indigo-600" /> Recommended activities for you</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {recommendations.map((r) => (
            <div key={r.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{r.title}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">{r.subscription}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">{r.outcome}</p>
              <p className="text-sm mt-3"><span className="font-medium">Support by:</span> {r.supportBy}</p>
              <p className="text-sm"><span className="font-medium">Support offered:</span> {r.supportOffer}</p>
              <p className="text-sm mt-2"><span className="font-medium">Available days:</span> {r.days.join(', ')}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="font-semibold mb-4">All available support options</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {availableSupport.map((s, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <p className="font-medium">{s.title}</p>
              <p className="text-sm text-gray-500">{s.supportBy}</p>
              <p className="text-sm text-gray-600 mt-1">{s.supportOffer}</p>
              <p className="text-xs mt-2 text-indigo-600">Plan: {s.subscription}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
