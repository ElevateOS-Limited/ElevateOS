'use client'

import { useEffect, useState } from 'react'

type FeedbackItem = {
  id: string
  category: string
  message: string
}

type FeedbackListMeta = {
  count: number
  category: string
  limit: number
  requestedLimit: number
  order: 'asc' | 'desc'
}

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'bug', label: 'Bug report' },
  { value: 'feature', label: 'Feature request' },
  { value: 'support', label: 'Support (auto-maps to General)' },
]

const FEEDBACK_FILTER_OPTIONS = [
  { value: 'all', label: 'All categories' },
  { value: 'general', label: 'General' },
  { value: 'bug', label: 'Bug report' },
  { value: 'feature', label: 'Feature request' },
  { value: 'billing', label: 'Billing' },
  { value: 'other', label: 'Other' },
]

const FEEDBACK_LIMIT_OPTIONS = [10, 20, 50]
const FEEDBACK_ORDER_OPTIONS = [
  { value: 'desc', label: 'Newest first' },
  { value: 'asc', label: 'Oldest first' },
] as const

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
  const [filterCategory, setFilterCategory] = useState('all')
  const [listLimit, setListLimit] = useState(20)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [meta, setMeta] = useState<FeedbackListMeta>({
    count: 0,
    category: 'all',
    limit: 20,
    requestedLimit: 20,
    order: 'desc',
  })

  const load = async (selectedFilter = filterCategory, selectedLimit = listLimit, selectedOrder = sortOrder) => {
    const params = new URLSearchParams({ includeMeta: '1', limit: String(selectedLimit), order: selectedOrder })
    if (selectedFilter !== 'all') params.set('category', selectedFilter)
    const res = await fetch(`/api/feedback?${params.toString()}`)
    const data = await res.json()
    setItems(Array.isArray(data?.items) ? data.items : [])
    setMeta(
      data?.meta && typeof data.meta === 'object'
        ? data.meta
        : {
            count: 0,
            category: selectedFilter,
            limit: selectedLimit,
            requestedLimit: selectedLimit,
            order: selectedOrder,
          }
    )
  }
  useEffect(() => {
    load(filterCategory, listLimit, sortOrder)
  }, [filterCategory, listLimit, sortOrder])

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
          aria-label="Feedback message"
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
        <div className="flex items-center justify-between gap-3 mb-2">
          <div>
            <h2 className="font-semibold">Recent feedback</h2>
            <p className="text-xs text-gray-500">
              Showing {meta.count} item{meta.count === 1 ? '' : 's'} ({meta.category}) · limit {meta.limit}
              {meta.requestedLimit !== meta.limit ? ` (requested ${meta.requestedLimit})` : ''} · {meta.order === 'desc' ? 'newest first' : 'oldest first'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm flex items-center gap-2">
              Filter
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border rounded p-1"
                aria-label="Filter feedback category"
              >
                {FEEDBACK_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm flex items-center gap-2">
              Show
              <select
                value={listLimit}
                onChange={(e) => setListLimit(Number(e.target.value))}
                className="border rounded p-1"
                aria-label="Feedback list limit"
              >
                {FEEDBACK_LIMIT_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm flex items-center gap-2">
              Order
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="border rounded p-1"
                aria-label="Feedback list sort order"
              >
                {FEEDBACK_ORDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="p-2 border rounded text-sm text-gray-500">No feedback found for this filter yet.</div>
          ) : null}
          {items.slice(0, meta.limit).map((f) => (
            <div key={f.id} className="p-2 border rounded text-sm">
              <b>{toCategoryLabel(f.category)}</b>: {f.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
