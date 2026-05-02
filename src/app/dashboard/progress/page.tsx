'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Flame, CheckCircle2 } from 'lucide-react'

export default function ProgressPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/progress').then((r) => r.json()).then(setData)
  }, [])

  if (!data) return <div className="p-8 text-gray-500">Loading progress...</div>

  const s = data.stats || {}

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><BarChart3 className="w-7 h-7 text-indigo-600" /> Progress & Analytics</h1>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-4"><p className="text-sm text-gray-500">Notes</p><p className="text-2xl font-bold">{data.counts.notesCount}</p></div>
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-4"><p className="text-sm text-gray-500">Flashcards Reviewed</p><p className="text-2xl font-bold">{s.flashcardsReviewed || 0}</p></div>
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-4"><p className="text-sm text-gray-500">Accuracy</p><p className="text-2xl font-bold">{data.accuracy}%</p></div>
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-4"><p className="text-sm text-gray-500">Due Reviews</p><p className="text-2xl font-bold">{data.counts.dueReviews}</p></div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-4">
          <h2 className="font-semibold flex items-center gap-2 mb-3"><Flame className="w-4 h-4 text-orange-500" /> Streak</h2>
          <p>Current: <span className="font-bold">{s.currentStreakDays || 0} days</span></p>
          <p>Longest: <span className="font-bold">{s.longestStreakDays || 0} days</span></p>
        </div>
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-4">
          <h2 className="font-semibold flex items-center gap-2 mb-3"><CheckCircle2 className="w-4 h-4 text-green-500" /> Practice</h2>
          <p>Sessions: <span className="font-bold">{s.practiceSessionsCount || 0}</span></p>
          <p>Answers: <span className="font-bold">{s.correctAnswersCount || 0}/{s.totalAnswersCount || 0}</span></p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border rounded-xl p-4">
        <h2 className="font-semibold mb-3">Recent activity</h2>
        <div className="space-y-2 max-h-72 overflow-auto">
          {(data.recentEvents || []).map((e: any) => (
            <div key={e.id} className="p-2 border rounded-lg text-sm flex items-center justify-between">
              <span>{e.eventType}</span>
              <span className="text-xs text-gray-500">{new Date(e.createdAt).toLocaleString()}</span>
            </div>
          ))}
          {!data.recentEvents?.length && <p className="text-sm text-gray-500">No activity yet.</p>}
        </div>
      </div>
    </div>
  )
}
