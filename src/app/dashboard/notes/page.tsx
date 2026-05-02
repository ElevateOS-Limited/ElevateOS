'use client'

import { useEffect, useState } from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'

type Note = { id: string; title: string; content: string; tags: string[] }

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selected, setSelected] = useState<Note | null>(null)
  const [q, setQ] = useState('')

  const load = async (query = '') => {
    const res = await fetch(`/api/notes${query ? `?q=${encodeURIComponent(query)}` : ''}`)
    const data = await res.json()
    setNotes(data)
    if (!selected && data[0]) setSelected(data[0])
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="max-w-7xl mx-auto grid md:grid-cols-[320px_1fr] gap-4">
      <div className="bg-white dark:bg-gray-900 border rounded-xl p-3 space-y-3">
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes..." className="flex-1 border rounded-lg px-3 py-2 bg-transparent" />
          <button onClick={() => load(q)} className="px-3 py-2 border rounded-lg">Go</button>
        </div>
        <button
          onClick={async () => {
            const res = await fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'New Note', content: '', tags: [] }) })
            const note = await res.json()
            await load(q)
            setSelected(note)
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white"
        ><Plus className="w-4 h-4" /> New Note</button>

        <div className="space-y-1 max-h-[68vh] overflow-auto">
          {notes.map((n) => (
            <button key={n.id} onClick={() => setSelected(n)} className={`w-full text-left p-2 rounded-lg border ${selected?.id === n.id ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <p className="font-medium truncate">{n.title}</p>
              <p className="text-xs text-gray-500 truncate">{n.tags?.join(', ')}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border rounded-xl p-4 space-y-3">
        {!selected ? <p className="text-gray-500">Select or create a note.</p> : (
          <>
            <input value={selected.title} onChange={(e) => setSelected({ ...selected, title: e.target.value })} className="w-full text-xl font-semibold bg-transparent border-b pb-2 outline-none" />
            <input value={selected.tags.join(', ')} onChange={(e) => setSelected({ ...selected, tags: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} placeholder="tags: ib, chemistry" className="w-full border rounded-lg px-3 py-2 bg-transparent" />
            <textarea value={selected.content} onChange={(e) => setSelected({ ...selected, content: e.target.value })} rows={18} className="w-full border rounded-lg p-3 bg-transparent" />
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  await fetch('/api/notes', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(selected) })
                  await load(q)
                }}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white inline-flex items-center gap-2"
              ><Save className="w-4 h-4" /> Save</button>
              <button
                onClick={async () => {
                  await fetch(`/api/notes?id=${selected.id}`, { method: 'DELETE' })
                  setSelected(null)
                  await load(q)
                }}
                className="px-4 py-2 rounded-lg border inline-flex items-center gap-2"
              ><Trash2 className="w-4 h-4" /> Delete</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
