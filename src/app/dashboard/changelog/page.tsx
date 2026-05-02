'use client'

import { useEffect, useState } from 'react'

export default function ChangelogPage() {
  const [items, setItems] = useState<any[]>([])
  useEffect(() => { fetch('/api/changelog').then((r)=>r.json()).then(setItems) }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">Changelog</h1>
      <div className="space-y-3">
        {items.map((c)=> (
          <div key={c.id} className="bg-white border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{c.title}</h2>
              <span className="text-xs text-gray-500">{c.version}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{c.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
