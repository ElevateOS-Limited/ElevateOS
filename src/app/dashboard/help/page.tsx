'use client'

import { useEffect, useState } from 'react'

type FeedbackItem = {
  id: string
  category: string
  message: string
}

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'bug', label: 'Bug report' },
  { value: 'feature', label: 'Feature request' },
  { value: 'support', label: 'Support (auto-maps to General)' },
]

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  bug: 'Bug report',
  feature: 'Feature request',
  support: 'Support',
}

function toCategoryLabel(category: string) {
  return CATEGORY_LABELS[category] || category
}

export default function HelpPage() {
  const [message, setMessage] = useState('')
  const [category, setCategory] = useState('general')
  const [items, setItems] = useState<FeedbackItem[]>([])

  const load = async () => setItems(await (await fetch('/api/feedback')).json())
  useEffect(() => {
    load()
  }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">Help & Feedback</h1>
      <div className="bg-white border rounded-xl p-4 space-y-2">
        <label className="block text-sm font-medium">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded p-2">
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full border rounded p-2"
          placeholder="Tell us what to improve"
        />
        <button
          onClick={async () => {
            await fetch('/api/feedback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ category, message }),
            })
            setMessage('')
            load()
          }}
          className="px-4 py-2 rounded bg-indigo-600 text-white"
        >
          Send feedback
        </button>
      </div>
      <div className="bg-white border rounded-xl p-4">
        <h2 className="font-semibold mb-2">Recent feedback</h2>
        <div className="space-y-2">
          {items.slice(0, 10).map((f) => (
            <div key={f.id} className="p-2 border rounded text-sm">
              <b>{toCategoryLabel(f.category)}</b>: {f.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
