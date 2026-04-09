'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'

type TaskSubmissionFormProps = {
  taskId: string
}

export function TaskSubmissionForm({ taskId }: TaskSubmissionFormProps) {
  const router = useRouter()
  const [textResponse, setTextResponse] = useState('')
  const [externalLink, setExternalLink] = useState('')
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const formData = new FormData()
      formData.set('textResponse', textResponse)
      formData.set('externalLink', externalLink)
      formData.set('notes', notes)
      if (file) {
        formData.set('file', file)
      }

      const response = await fetch(`/api/tutoring/tasks/${taskId}/submissions`, {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to save submission')
      }

      setMessage('Submission saved. The tutor can review it now.')
      setTextResponse('')
      setExternalLink('')
      setNotes('')
      setFile(null)
      event.currentTarget.reset()
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save submission')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-[1.5rem] border border-slate-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9a5b00]">Submit work</p>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Share your answer, link, or file. Keep it simple and complete.
        </p>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Text response</span>
        <textarea
          value={textResponse}
          onChange={(event) => setTextResponse(event.target.value)}
          rows={4}
          className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">External link</span>
          <input
            type="url"
            value={externalLink}
            onChange={(event) => setExternalLink(event.target.value)}
            placeholder="https://..."
            className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">File upload</span>
          <input
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="rounded-2xl border border-dashed border-slate-900/15 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:file:bg-white dark:file:text-slate-950"
          />
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Notes</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
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
          Save submission
        </button>
        {message ? <p className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p> : null}
        {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
      </div>
    </form>
  )
}
