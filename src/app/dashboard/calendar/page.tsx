'use client'

import { useEffect, useState } from 'react'

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([])
  const [form, setForm] = useState({ title: '', startsAt: '', endsAt: '' })

  const load = async () => setEvents(await (await fetch('/api/calendar-events')).json())
  useEffect(() => { load() }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">Calendar</h1>
      <div className="grid md:grid-cols-[1fr_220px_220px_auto] gap-2">
        <input value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} placeholder="Event title" className="border rounded p-2" />
        <input type="datetime-local" value={form.startsAt} onChange={(e)=>setForm({...form,startsAt:e.target.value})} className="border rounded p-2" />
        <input type="datetime-local" value={form.endsAt} onChange={(e)=>setForm({...form,endsAt:e.target.value})} className="border rounded p-2" />
        <button onClick={async()=>{await fetch('/api/calendar-events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});setForm({title:'',startsAt:'',endsAt:''});load()}} className="px-4 py-2 rounded bg-indigo-600 text-white">Add</button>
      </div>
      <div className="bg-white border rounded-xl p-4">
        <h2 className="font-semibold mb-3">Upcoming</h2>
        <div className="space-y-2">
          {events.map((e)=> <div key={e.id} className="p-3 border rounded-lg flex items-center justify-between"><span>{e.title}</span><span className="text-xs text-gray-500">{new Date(e.startsAt).toLocaleString()} → {new Date(e.endsAt).toLocaleString()}</span></div>)}
        </div>
      </div>
    </div>
  )
}
