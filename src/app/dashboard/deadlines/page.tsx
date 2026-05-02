'use client'

import { useEffect, useState } from 'react'

export default function DeadlinesPage() {
  const [items, setItems] = useState<any[]>([])
  const [form, setForm] = useState({ title: '', dueAt: '' })

  const load = async () => setItems(await (await fetch('/api/deadlines')).json())
  useEffect(() => { load() }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">Deadlines</h1>
      <div className="grid md:grid-cols-[1fr_220px_auto] gap-2">
        <input value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} placeholder="Deadline title" className="border rounded p-2" />
        <input type="datetime-local" value={form.dueAt} onChange={(e)=>setForm({...form,dueAt:e.target.value})} className="border rounded p-2" />
        <button onClick={async()=>{await fetch('/api/deadlines',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});setForm({title:'',dueAt:''});load()}} className="px-4 py-2 rounded bg-indigo-600 text-white">Add</button>
      </div>
      <div className="space-y-2">
        {items.map((d)=> (
          <div key={d.id} className="bg-white border rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="font-medium">{d.title}</p>
              <p className="text-xs text-gray-500">{new Date(d.dueAt).toLocaleString()}</p>
            </div>
            <button onClick={async()=>{await fetch('/api/deadlines',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:d.id,completed:!d.completed})});load()}} className={`text-xs px-2 py-1 rounded ${d.completed?'bg-green-100 text-green-700':'bg-gray-100 text-gray-700'}`}>{d.completed?'Done':'Mark done'}</button>
          </div>
        ))}
      </div>
    </div>
  )
}
