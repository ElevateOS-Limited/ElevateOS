'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'

type SessionNoteFormProps = {
  studentId: string
  defaultSubject?: string
  defaultTopicsCovered?: string[]
  defaultHomeworkAssigned?: string[]
  defaultWeakTopics?: string[]
  defaultNextSteps?: string[]
  defaultSummary?: string
  defaultRawNotes?: string
}

function splitList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function SessionNoteForm({
  studentId,
  defaultSubject = '',
  defaultTopicsCovered = [],
  defaultHomeworkAssigned = [],
  defaultWeakTopics = [],
  defaultNextSteps = [],
  defaultSummary = '',
  defaultRawNotes = '',
}: SessionNoteFormProps) {
  const router = useRouter()
  const [subject, setSubject] = useState(defaultSubject)
  const [topicsCovered, setTopicsCovered] = useState(defaultTopicsCovered.join(', '))
  const [homeworkAssigned, setHomeworkAssigned] = useState(defaultHomeworkAssigned.join(', '))
  const [weakTopics, setWeakTopics] = useState(defaultWeakTopics.join(', '))
  const [nextSteps, setNextSteps] = useState(defaultNextSteps.join(', '))
  const [summary, setSummary] = useState(defaultSummary)
  const [rawNotes, setRawNotes] = useState(defaultRawNotes)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch(`/api/tutoring/students/${studentId}/session-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject || undefined,
          topicsCovered: splitList(topicsCovered),
          homeworkAssigned: splitList(homeworkAssigned),
          weakTopics: splitList(weakTopics),
          nextSteps: splitList(nextSteps),
          summary,
          rawNotes: rawNotes || undefined,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to save session note')
      }

      setMessage(data?.note?.aiSummary ? `Saved. AI summary: ${data.note.aiSummary}` : 'Session note saved.')
      router.refresh()
    } catch (sessionNoteError) {
      setError(sessionNoteError instanceof Error ? sessionNoteError.message : 'Unable to save session note')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-[1.5rem] border border-slate-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9a5b00]">Session notes</p>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Capture what happened in the lesson so summaries stay structured later.
        </p>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Summary</span>
        <textarea
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          rows={4}
          className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Subject</span>
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Weak topics</span>
          <input
            value={weakTopics}
            onChange={(event) => setWeakTopics(event.target.value)}
            placeholder="Comma separated"
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
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Next steps</span>
        <textarea
          value={nextSteps}
          onChange={(event) => setNextSteps(event.target.value)}
          rows={3}
          placeholder="Comma separated"
          className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Raw notes</span>
        <textarea
          value={rawNotes}
          onChange={(event) => setRawNotes(event.target.value)}
          rows={4}
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
          Save note
        </button>
        {message ? <p className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p> : null}
        {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
      </div>
    </form>
  )
}
