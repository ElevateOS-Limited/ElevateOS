'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Crown } from 'lucide-react'

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/progress').then((r) => r.json()).then(setData)
  }, [])

  if (session?.user?.plan === 'FREE') {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white border rounded-2xl p-6 text-center">
          <Crown className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold mb-2">Advanced Analytics is Pro</h1>
          <p className="text-gray-600 mb-4">Unlock trend charts, deep weak-area diagnostics, and cohort benchmarks.</p>
          <Link href="/pricing" className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white">Upgrade Plan</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">Analytics</h1>
      {!data ? <p className="text-gray-500">Loading...</p> : (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white border rounded-xl p-4"><p className="text-sm text-gray-500">Accuracy</p><p className="text-2xl font-bold">{data.accuracy}%</p></div>
          <div className="bg-white border rounded-xl p-4"><p className="text-sm text-gray-500">Practice Sessions</p><p className="text-2xl font-bold">{data.stats.practiceSessionsCount || 0}</p></div>
          <div className="bg-white border rounded-xl p-4"><p className="text-sm text-gray-500">Cards Reviewed</p><p className="text-2xl font-bold">{data.stats.flashcardsReviewed || 0}</p></div>
        </div>
      )}
    </div>
  )
}
