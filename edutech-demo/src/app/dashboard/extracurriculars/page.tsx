'use client'

import { useState } from 'react'
import { Trophy, Loader2, Plus } from 'lucide-react'

type Activity = { name: string; role: string; impact: string; hoursPerWeek: number }

export default function ExtracurricularsPage() {
  const [activities, setActivities] = useState<Activity[]>([
    { name: 'Robotics Club', role: 'Captain', impact: 'Regional finalist', hoursPerWeek: 5 },
    { name: 'Community Tutoring', role: 'Tutor', impact: '80 volunteer hours', hoursPerWeek: 3 },
  ])
  const [targetUniversities, setTargetUniversities] = useState('Stanford, MIT, UCL')
  const [intendedMajor, setIntendedMajor] = useState('Computer Science')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const add = () => setActivities([...activities, { name: '', role: '', impact: '', hoursPerWeek: 2 }])

  const analyze = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/extracurriculars/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activities,
          targetUniversities: targetUniversities.split(',').map((x) => x.trim()).filter(Boolean),
          intendedMajor,
        }),
      })
      setResult(await res.json())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Trophy className="w-8 h-8 text-indigo-600" /> Extracurricular Analysis & Point System</h1>
      <p className="text-gray-500">Score student profile strength for top university admissions and get prioritized recommendations.</p>

      <div className="bg-white dark:bg-gray-900 border rounded-2xl p-5 space-y-4">
        {activities.map((a, i) => (
          <div key={i} className="grid md:grid-cols-4 gap-2">
            <input value={a.name} onChange={(e) => setActivities(activities.map((x, idx) => idx===i ? { ...x, name: e.target.value } : x))} placeholder="Activity" className="border rounded-lg p-2 bg-transparent" />
            <input value={a.role} onChange={(e) => setActivities(activities.map((x, idx) => idx===i ? { ...x, role: e.target.value } : x))} placeholder="Role" className="border rounded-lg p-2 bg-transparent" />
            <input value={a.impact} onChange={(e) => setActivities(activities.map((x, idx) => idx===i ? { ...x, impact: e.target.value } : x))} placeholder="Impact" className="border rounded-lg p-2 bg-transparent" />
            <input type="number" value={a.hoursPerWeek} onChange={(e) => setActivities(activities.map((x, idx) => idx===i ? { ...x, hoursPerWeek: Number(e.target.value||0) } : x))} placeholder="hrs/week" className="border rounded-lg p-2 bg-transparent" />
          </div>
        ))}
        <button onClick={add} className="inline-flex items-center gap-1 text-indigo-600"><Plus className="w-4 h-4" /> Add activity</button>

        <div className="grid md:grid-cols-2 gap-3">
          <input value={targetUniversities} onChange={(e) => setTargetUniversities(e.target.value)} className="border rounded-lg p-2 bg-transparent" placeholder="Target universities (comma separated)" />
          <input value={intendedMajor} onChange={(e) => setIntendedMajor(e.target.value)} className="border rounded-lg p-2 bg-transparent" placeholder="Intended major" />
        </div>

        <button onClick={analyze} disabled={loading} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white disabled:opacity-50 inline-flex items-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Scoring...</> : 'Analyze Profile'}
        </button>
      </div>

      {result && (
        <div className="bg-white dark:bg-gray-900 border rounded-2xl p-5">
          <h2 className="text-xl font-semibold mb-3">Scoring Result</h2>
          <pre className="text-xs overflow-auto whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
