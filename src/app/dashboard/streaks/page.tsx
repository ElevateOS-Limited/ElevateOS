'use client'

import { useEffect, useState } from 'react'

export default function StreaksPage() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { fetch('/api/progress').then((r)=>r.json()).then(setData) }, [])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold">Streaks</h1>
      {!data ? <p className="text-gray-500 dark:text-gray-400">Loading...</p> : (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Current streak</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data.stats.currentStreakDays || 0} days</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Longest streak</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data.stats.longestStreakDays || 0} days</p>
          </div>
        </div>
      )}
    </div>
  )
}
