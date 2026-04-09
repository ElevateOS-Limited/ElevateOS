'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { tutoringDeliveryChannelValues, tutoringDeliveryStatusValues } from '@/lib/tutoring/contracts'

type ParentReportFormProps = {
  studentId: string
  defaultSessionNoteId?: string | null
  defaultPeriodStart?: string
  defaultPeriodEnd?: string
  defaultTopicsCovered?: string[]
  defaultStrengths?: string[]
  defaultWeaknesses?: string[]
  defaultHomeworkAssigned?: string[]
  defaultProgressNote?: string
  defaultGeneratedText?: string
  defaultChannel?: (typeof tutoringDeliveryChannelValues)[number]
  defaultDeliveryStatus?: (typeof tutoringDeliveryStatusValues)[number]
}

function splitList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function ParentReportForm({
  studentId,
  defaultSessionNoteId = null,
  defaultPeriodStart = '',
  defaultPeriodEnd = '',
  defaultTopicsCovered = [],
  defaultStrengths = [],
  defaultWeaknesses = [],
  defaultHomeworkAssigned = [],
  defaultProgressNote = '',
  defaultGeneratedText = '',
  defaultChannel = 'in_app',
  defaultDeliveryStatus = 'draft',
}: ParentReportFormProps) {
  const router = useRouter()
  const [sessionNoteId] = useState(defaultSessionNoteId || '')
  const [periodStart, setPeriodStart] = useState(defaultPeriodStart)
  const [periodEnd, setPeriodEnd] = useState(defaultPeriodEnd)
  const [topicsCovered, setTopicsCovered] = useState(defaultTopicsCovered.join(', '))
  const [strengths, setStrengths] = useState(defaultStrengths.join(', '))
  const [weaknesses, setWeaknesses] = useState(defaultWeaknesses.join(', '))
  const [homeworkAssigned, setHomeworkAssigned] = useState(defaultHomeworkAssigned.join(', '))
  const [progressNote, setProgressNote] = useState(defaultProgressNote)
  const [generatedText, setGeneratedText] = useState(defaultGeneratedText)
  const [channel, setChannel] = useState(defaultChannel)
  const [deliveryStatus, setDeliveryStatus] = useState(defaultDeliveryStatus)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch(`/api/tutoring/students/${studentId}/parent-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionNoteId: sessionNoteId || undefined,
          periodStart: periodStart ? new Date(periodStart).toISOString() : undefined,
          periodEnd: periodEnd ? new Date(periodEnd).toISOString() : undefined,
          topicsCovered: splitList(topicsCovered),
          strengths: splitList(strengths),
          weaknesses: splitList(weaknesses),
          homeworkAssigned: splitList(homeworkAssigned),
          progressNote,
          generatedText: generatedText || undefined,
          channel,
          deliveryStatus,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to save parent report')
      }

      setMessage(data?.snapshot?.headline ? `Saved. Snapshot: ${data.snapshot.headline}` : 'Parent report saved.')
      router.refresh()
    } catch (reportError) {
      setError(reportError instanceof Error ? reportError.message : 'Unable to save parent report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-[1.5rem] border border-slate-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9a5b00]">Parent report</p>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Draft a concise family update. The backend can also turn this into a cleaner AI summary.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Period start</span>
          <input
            type="date"
            value={periodStart}
            onChange={(event) => setPeriodStart(event.target.value)}
            className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Period end</span>
          <input
            type="date"
            value={periodEnd}
            onChange={(event) => setPeriodEnd(event.target.value)}
            className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Topics covered</span>
          <textarea
            value={topicsCovered}
            onChange={(event) => setTopicsCovered(event.target.value)}
            rows={3}
            placeholder="Comma separated"
            className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
          />
        </label>

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
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Homework assigned</span>
          <textarea
            value={homeworkAssigned}
            onChange={(event) => setHomeworkAssigned(event.target.value)}
            rows={3}
            placeholder="Comma separated"
            className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
          />
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Progress note</span>
        <textarea
          value={progressNote}
          onChange={(event) => setProgressNote(event.target.value)}
          rows={4}
          className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Generated text override</span>
        <textarea
          value={generatedText}
          onChange={(event) => setGeneratedText(event.target.value)}
          rows={4}
          className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Channel</span>
          <select
            value={channel}
            onChange={(event) => setChannel(event.target.value as typeof defaultChannel)}
            className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
          >
            {tutoringDeliveryChannelValues.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Delivery status</span>
          <select
            value={deliveryStatus}
            onChange={(event) => setDeliveryStatus(event.target.value as typeof defaultDeliveryStatus)}
            className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
          >
            {tutoringDeliveryStatusValues.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save report
        </button>
        {message ? <p className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p> : null}
        {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
      </div>
    </form>
  )
}
