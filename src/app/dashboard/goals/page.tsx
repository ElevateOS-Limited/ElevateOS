'use client'

import { useEffect, useState } from 'react'

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([])
  const [title, setTitle] = useState('')

  const load = async () => setGoals(await (await fetch('/api/goals')).json())
  useEffect(() => { load() }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">Goals</h1>
      <div className="flex gap-2">
        <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Add goal" className="flex-1 border rounded p-2" />
        <button onClick={async()=>{await fetch('/api/goals',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title})});setTitle('');load()}} className="px-4 py-2 rounded bg-indigo-600 text-white">Add</button>
      </div>
      <div className="space-y-2">
        {goals.map((g)=> <div key={g.id} className="bg-white border rounded-lg p-3 flex items-center justify-between"><span>{g.title}</span><span className="text-xs text-gray-500">{g.status}</span></div>)}
      </div>
    </div>
  )
}
