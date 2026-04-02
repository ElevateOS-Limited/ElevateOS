'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { flattenNav } from '@/lib/navigation'

export default function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const items = useMemo(() => {
    const q = query.toLowerCase().trim()
    const all = flattenNav()
    if (!q) return all
    return all.filter((i) => i.label.toLowerCase().includes(q) || i.href.toLowerCase().includes(q))
  }, [query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl rounded-2xl border border-slate-900/10 bg-white shadow-xl dark:border-white/10 dark:bg-slate-950" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-slate-900/10 p-3 dark:border-white/10">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages and actions..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <div className="max-h-[60vh] overflow-auto p-2">
          {items.map((item) => (
            <button
              key={item.href}
              onClick={() => {
                router.push(item.href)
                setOpen(false)
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <span>{item.label}</span>
              <span className="text-xs text-slate-400">{item.href}</span>
            </button>
          ))}
          {!items.length && <p className="p-3 text-sm text-slate-500">No results.</p>}
        </div>
      </div>
    </div>
  )
}
