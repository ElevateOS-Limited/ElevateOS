'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'

type FeedbackFormProps = {
  submissionId: string
  defaultSummary?: string
  defaultStrengths?: string[]
  defaultWeaknesses?: string[]
  defaultNextSteps?: string
  defaultScore?: number | null
  defaultWeakTopicTags?: string[]
}

function splitList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function FeedbackForm({
  submissionId,
  defaultSummary = '',
  defaultStrengths = [],
  defaultWeaknesses = [],
  defaultNextSteps = '',
  defaultScore = null,
  defaultWeakTopicTags = [],
}: FeedbackFormProps) {
  const router = useRouter()
  const [summary, setSummary] = useState(defaultSummary)
  const [strengths, setStrengths] = useState(defaultStrengths.join(', '))
  const [weaknesses, setWeaknesses] = useState(defaultWeaknesses.join(', '))
  const [nextSteps, setNextSteps] = useState(defaultNextSteps)
  const [score, setScore] = useState(defaultScore === null ? '' : String(defaultScore))
  const [weakTopicTags, setWeakTopicTags] = useState(defaultWeakTopicTags.join(', '))
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch(`/api/tutoring/submissions/${submissionId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          strengths: splitList(strengths),
          weaknesses: splitList(weaknesses),
          nextSteps,
          score: score ? Number(score) : undefined,
          weakTopicTags: splitList(weakTopicTags),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to save feedback')
      }

      setMessage('Feedback saved and task marked reviewed.')
      router.refresh()
    } catch (feedbackError) {
      setError(feedbackError instanceof Error ? feedbackError.message : 'Unable to save feedback')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-[1.5rem] border border-slate-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9a5b00]">Review submission</p>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Keep the review structured so the student and parent can read it quickly later.
        </p>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Summary</span>
        <textarea
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          rows={3}
          className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Strengths</span>
          <textarea
            value={strengths}
            onChange={(event) => setStrengths(event.target.value)}
            rows={3}
            placeholder="Comma separated"
            className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Weaknesses</span>
          <textarea
            value={weaknesses}
            onChange={(event) => setWeaknesses(event.target.value)}
            rows={3}
            placeholder="Comma separated"
            className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Next steps</span>
          <textarea
            value={nextSteps}
            onChange={(event) => setNextSteps(event.target.value)}
            rows={3}
            className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Weak topic tags</span>
          <textarea
            value={weakTopicTags}
            onChange={(event) => setWeakTopicTags(event.target.value)}
            rows={3}
            placeholder="Comma separated"
            className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
          />
        </label>
      </div>

      <label className="grid gap-2 md:max-w-[12rem]">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Score</span>
        <input
          type="number"
          min="0"
          max="100"
          value={score}
          onChange={(event) => setScore(event.target.value)}
          className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save feedback
        </button>
        {message ? <p className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p> : null}
        {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
      </div>
    </form>
  )
}
