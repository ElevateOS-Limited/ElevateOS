'use client'

import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { leadInterestValues } from '@/lib/tutoring/contracts'

type LeadCaptureFormProps = {
  source: string
  campaign?: string
  defaultRoleInterest?: (typeof leadInterestValues)[number]
  compact?: boolean
  className?: string
}

export function LeadCaptureForm({
  source,
  campaign,
  defaultRoleInterest = 'parent',
  compact = false,
  className,
}: LeadCaptureFormProps) {
  const [email, setEmail] = useState('')
  const [roleInterest, setRoleInterest] = useState<(typeof leadInterestValues)[number]>(defaultRoleInterest)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [feedback, setFeedback] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setStatus('idle')
    setFeedback('')

    try {
      const response = await fetch('/public/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          roleInterest,
          source,
          campaign,
          message: message || undefined,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to save lead')
      }

      setStatus('success')
      setFeedback('Thanks. We received your interest and will follow up shortly.')
      setEmail('')
      setMessage('')
      setRoleInterest(defaultRoleInterest)
    } catch (error) {
      setStatus('error')
      setFeedback(error instanceof Error ? error.message : 'Unable to save lead')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className={compact ? 'grid gap-3 md:grid-cols-[1.1fr_.9fr]' : 'grid gap-4'}>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@family.com"
            className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">I am a</span>
          <select
            value={roleInterest}
            onChange={(event) => setRoleInterest(event.target.value as (typeof leadInterestValues)[number])}
            className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
          >
            {leadInterestValues.map((value) => (
              <option key={value} value={value}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 grid gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Message</span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={compact ? 3 : 4}
          placeholder="Tell us the subject, year level, and what support you need."
          className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
        />
      </label>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Send inquiry
        </button>

        {feedback ? (
          <p className={status === 'error' ? 'text-sm text-rose-600 dark:text-rose-300' : 'text-sm text-emerald-700 dark:text-emerald-300'}>
            {feedback}
          </p>
        ) : null}
      </div>
    </form>
  )
}
