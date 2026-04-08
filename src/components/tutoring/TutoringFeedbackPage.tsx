'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Sparkles, Star } from 'lucide-react'
import { useTutoringUi } from './TutoringDashboardShell'
import { useTutoringWorkspace } from './useTutoringWorkspace'
import {
  demoTutoringWorkspace,
  formatDateTimeLabel,
  isParentPov,
  taskStatusClasses,
  taskStatusLabel,
  tutoringSectionMeta,
} from './tutoring-data'

export default function TutoringFeedbackPage() {
  const { activePov } = useTutoringUi()
  const { data, isLoading, error } = useTutoringWorkspace()
  const tasks = data?.tasks ?? demoTutoringWorkspace.tasks
  const submissions = data?.submissions ?? demoTutoringWorkspace.submissions
  const feedback = data?.feedback ?? demoTutoringWorkspace.feedback
  const parentView = isParentPov(activePov)
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string>('')

  useEffect(() => {
    if (!selectedFeedbackId && feedback[0]?.id) {
      setSelectedFeedbackId(feedback[0].id)
    }
  }, [feedback, selectedFeedbackId])

  const selectedFeedback = useMemo(() => feedback.find((item) => item.id === selectedFeedbackId) ?? feedback[0] ?? null, [feedback, selectedFeedbackId])
  const selectedSubmission = selectedFeedback ? submissions.find((submission) => submission.id === selectedFeedback.submissionId || submission.taskId === selectedFeedback.taskId) ?? null : null
  const selectedTask = selectedFeedback ? tasks.find((task) => task.id === selectedFeedback.taskId) ?? null : null

  const metrics = useMemo(() => {
    const scores = feedback.map((item) => item.score).filter((score): score is number => typeof score === 'number')
    const averageScore = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0
    const reviewCount = feedback.length
    const weakTopics = new Map<string, number>()

    for (const item of feedback) {
      for (const topic of item.weakTopics) {
        weakTopics.set(topic, (weakTopics.get(topic) || 0) + 1)
      }
    }

    return {
      averageScore,
      reviewCount,
      weakTopics: Array.from(weakTopics.entries()).sort((left, right) => right[1] - left[1]).slice(0, 5),
    }
  }, [feedback])

  if (isLoading && !data) {
    return <div className="rounded-[1.25rem] border border-slate-900/10 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading feedback…</div>
  }

  if (error) {
    return <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">Unable to load tutoring feedback.</div>
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
      <section className="space-y-4">
        <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-[#f8f5ef] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">
            <Sparkles className="h-3.5 w-3.5" />
            {tutoringSectionMeta.feedback.title}
          </div>
          <h1 className="font-display mt-4 text-3xl tracking-tight text-slate-950">
            {parentView ? 'Parent-friendly review snapshots' : 'Reviewed work, weak areas, and next steps'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            {parentView
              ? 'Parents see the short version: what was strong, what still needs work, and what the next action is.'
              : 'Tutors see the full review context here so feedback stays specific, actionable, and easy to reuse in the next session.'}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ['Reviews', metrics.reviewCount],
              ['Average score', metrics.averageScore ? `${metrics.averageScore}` : '—'],
              ['Top weak topics', metrics.weakTopics.length],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{value as string | number}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {feedback.map((item) => {
            const selected = item.id === selectedFeedback?.id
            const task = tasks.find((candidate) => candidate.id === item.taskId)

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedFeedbackId(item.id)}
                className={[
                  'w-full rounded-[1.25rem] border p-4 text-left transition-all',
                  selected ? 'border-[#3B82F6] bg-[#EFF6FF] shadow-sm' : 'border-slate-900/10 bg-white hover:-translate-y-0.5 hover:shadow-md',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{item.studentName}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      {item.taskTitle} · {task?.subject || 'General'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-slate-950">{item.score}</div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Score</div>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{parentView ? item.nextAction : item.comments}</p>
              </button>
            )
          })}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-[1.5rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2c06d]">Review detail</p>
          {selectedFeedback ? (
            <div className="mt-4 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold">{selectedFeedback.studentName}</p>
                  <p className="mt-1 text-sm text-white/65">{selectedFeedback.taskTitle}</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                  {selectedFeedback.score}/100
                </div>
              </div>

              {selectedTask ? (
                <div className={`rounded-2xl border px-4 py-3 text-sm ${taskStatusClasses(selectedTask.status)}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{selectedTask.title}</span>
                    <span>{taskStatusLabel(selectedTask.status)}</span>
                  </div>
                </div>
              ) : null}

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/75">
                {selectedFeedback.comments}
              </div>

              {selectedSubmission ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/75">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/45">Submission</div>
                  <p className="mt-2">{selectedSubmission.textResponse || 'No text response provided.'}</p>
                  <p className="mt-2 text-xs text-white/55">Submitted {formatDateTimeLabel(selectedSubmission.submittedAt)}</p>
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Reviewer</p>
                  <p className="mt-2 text-sm font-semibold">{selectedFeedback.reviewerName}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Reviewed</p>
                  <p className="mt-2 text-sm font-semibold">{formatDateTimeLabel(selectedFeedback.reviewedAt)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">Pick a review to inspect the comments, weak topics, and next action.</div>
          )}
        </div>

        <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            <CheckCircle2 className="h-4 w-4" />
            Feedback summary
          </div>
          <div className="mt-4 space-y-3">
            {metrics.weakTopics.length ? (
              metrics.weakTopics.map(([label, count]) => (
                <div key={label} className="flex items-center justify-between rounded-[1rem] border border-slate-900/10 bg-[#f8f5ef] px-4 py-3 text-sm">
                  <span>{label}</span>
                  <span className="font-semibold text-slate-950">{count}</span>
                </div>
              ))
            ) : (
              <div className="rounded-[1rem] border border-slate-900/10 bg-[#f8f5ef] px-4 py-3 text-sm text-slate-600">No weak-topic tags yet.</div>
            )}
          </div>

          <div className="mt-5 rounded-[1rem] border border-slate-900/10 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <Star className="h-4 w-4 text-[#d97706]" />
              Next action
            </div>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {selectedFeedback?.nextAction || 'No next action is recorded for the selected review.'}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <span>Summary available</span>
            <span className="font-semibold">{selectedFeedback?.aiSummary ? 'Yes' : 'No'}</span>
          </div>
          {selectedFeedback?.aiSummary ? (
            <div className="mt-3 rounded-[1rem] border border-slate-900/10 bg-[#f8f5ef] p-4 text-sm leading-7 text-slate-600">
              {selectedFeedback.aiSummary}
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  )
}
