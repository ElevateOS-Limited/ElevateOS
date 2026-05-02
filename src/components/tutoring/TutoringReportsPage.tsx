'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Download, FileText, RefreshCw, Sparkles, TrendingUp } from 'lucide-react'
import { useTutoringUi } from './TutoringDashboardShell'
import { useTutoringWorkspace } from './useTutoringWorkspace'
import { demoTutoringWorkspace, getTutoringStudentsForPov, isParentPov, isStudentPov, tutoringSectionMeta } from './tutoring-data'
import type { WeeklyParentReport } from '@/lib/tutoring/report'

async function fetchWeeklyReport(studentId: string): Promise<WeeklyParentReport> {
  const response = await fetch(`/api/tutoring/report?studentId=${encodeURIComponent(studentId)}`, {
    credentials: 'include',
  })
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.error || 'Failed to load weekly report')
  }

  return data as WeeklyParentReport
}

function MetricCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
      {hint ? <p className="mt-2 text-xs leading-6 text-slate-500">{hint}</p> : null}
    </div>
  )
}

export default function TutoringReportsPage() {
  const { activePov } = useTutoringUi()
  const { data, isLoading, error } = useTutoringWorkspace()
  const parentView = isParentPov(activePov)
  const studentView = isStudentPov(activePov)
  const students = getTutoringStudentsForPov(data?.students ?? demoTutoringWorkspace.students, activePov)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '')
  const [report, setReport] = useState<WeeklyParentReport | null>(null)
  const [loadingReport, setLoadingReport] = useState(false)
  const [reportError, setReportError] = useState<string | null>(null)

  useEffect(() => {
    if (students.length && !students.some((student) => student.id === selectedStudentId) && students[0]?.id) {
      setSelectedStudentId(students[0].id)
    }
  }, [selectedStudentId, students])

  useEffect(() => {
    let active = true

    if (!selectedStudentId) {
      setReport(null)
      return
    }

    setLoadingReport(true)
    setReportError(null)

    fetchWeeklyReport(selectedStudentId)
      .then((nextReport) => {
        if (!active) return
        setReport(nextReport)
      })
      .catch((fetchError) => {
        if (!active) return
        setReportError(fetchError instanceof Error ? fetchError.message : 'Failed to load report')
      })
      .finally(() => {
        if (active) setLoadingReport(false)
      })

    return () => {
      active = false
    }
  }, [selectedStudentId])

  const topWeakTopic = report?.weakTopics[0]

  if (isLoading && !data) {
    return <div className="rounded-[1.25rem] border border-slate-900/10 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading reports…</div>
  }

  if (error) {
    return <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">Unable to load tutoring reports.</div>
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.02fr_.98fr]">
      <section className="space-y-4">
        <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-[#f8f5ef] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">
            <FileText className="h-3.5 w-3.5" />
            {tutoringSectionMeta.reports.title}
          </div>
          <h1 className="font-display mt-4 text-3xl tracking-tight text-slate-950">
            {parentView ? 'Family-ready weekly report' : studentView ? 'Student weekly report' : 'Weekly report with parent-facing summary'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            {parentView
              ? 'This page compresses weekly execution into a short family update: what moved, what needs attention, and what should happen next.'
              : studentView
                ? 'Students can review the weekly report, the headline, and the next steps before the next session.'
                : 'Tutors can review a deterministic weekly report and an AI-compressed parent summary before sharing updates.'}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MetricCard label="Tasks" value={report?.metrics.taskCount ?? 0} hint="Assigned in the current window" />
            <MetricCard label="On-time" value={`${report?.metrics.submittedOnTimeRate ?? 0}%`} hint="Submission timing against deadlines" />
            <MetricCard label="Score" value={`${report?.metrics.avgScore ?? 0}%`} hint="Average feedback score for the window" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {students.map((student) => (
            <button
              key={student.id}
              type="button"
              onClick={() => setSelectedStudentId(student.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedStudentId === student.id
                  ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#3B82F6]'
                  : 'border-slate-900/10 bg-white text-slate-600 hover:bg-[#f8f5ef]'
              }`}
            >
              {student.name}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <MetricCard label="Completion" value={`${report?.metrics.completionRate ?? 0}%`} hint="Completed or reviewed tasks" />
          <MetricCard label="Review speed" value={`${report?.metrics.reviewLatencyHours ?? 0}h`} hint="Average review turnaround" />
          <MetricCard label="Consistency" value={`${report?.metrics.engagementConsistency ?? 0}%`} hint="Submission and review cadence" />
          <MetricCard label="Overdue" value={report?.metrics.overdueCount ?? 0} hint="Tasks still past deadline" />
        </div>

        <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d97706]">Task digest</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">What happened this week</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!selectedStudentId) return
                setLoadingReport(true)
                setReportError(null)
                fetchWeeklyReport(selectedStudentId)
                  .then(setReport)
                  .catch((fetchError) => setReportError(fetchError instanceof Error ? fetchError.message : 'Failed to refresh report'))
                  .finally(() => setLoadingReport(false))
              }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#f8f5ef]"
              disabled={loadingReport || !selectedStudentId}
            >
              <RefreshCw className={`h-4 w-4 ${loadingReport ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {report ? (
            <div className="mt-5 space-y-3">
              {report.taskDigest.map((task) => (
                <div key={task.id} className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{task.title}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        {task.subject} · {task.topic} · {task.statusLabel}
                      </p>
                    </div>
                    <span className="rounded-full border border-slate-900/10 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      Score {task.score ?? '—'}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                    <span>Due: {task.dueAt ? new Date(task.dueAt).toLocaleDateString() : 'No deadline'}</span>
                    <span>Submitted: {task.submittedAt ? new Date(task.submittedAt).toLocaleDateString() : 'Not yet'}</span>
                    <span>Reviewed: {task.reviewedAt ? new Date(task.reviewedAt).toLocaleDateString() : 'Pending'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[1rem] border border-slate-900/10 bg-[#f8f5ef] p-4 text-sm text-slate-600">
              {reportError || 'Select a student to generate the weekly report.'}
            </div>
          )}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-[1.5rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2c06d]">{parentView ? 'Parent summary' : studentView ? 'Student summary' : 'Parent summary'}</p>
          {report ? (
            <div className="mt-4 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold">{report.student.name}</p>
                  <p className="mt-1 text-sm text-white/65">
                    {report.student.curriculum} · {report.student.gradeLevel}
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                  {report.headline}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/75">
                {studentView ? report.summary : report.aiSummary || report.summary}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Parents</p>
                  <p className="mt-2 text-sm font-semibold">{report.student.parentNames.length ? report.student.parentNames.join(', ') : 'No parent link set'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">{studentView ? 'Tutors' : 'Tutors'}</p>
                  <p className="mt-2 text-sm font-semibold">{report.student.tutorNames.length ? report.student.tutorNames.join(', ') : 'No tutor link set'}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Sparkles className="h-4 w-4 text-[#f2c06d]" />
                  Strengths
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-white/75">
                  {report.strengths.map((strength) => (
                    <li key={strength}>• {strength}</li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Concerns</p>
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-white/75">
                    {report.concerns.slice(0, 3).map((concern) => (
                      <li key={concern}>• {concern}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Next steps</p>
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-white/75">
                    {report.nextSteps.slice(0, 3).map((nextStep) => (
                      <li key={nextStep}>• {nextStep}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-2">
                <button type="button" className="inline-flex flex-1 items-center justify-center gap-2 rounded-[0.9rem] bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-95">
                  <Download className="h-4 w-4" />
                  {studentView ? 'Download' : 'Export'}
                </button>
                <div className="inline-flex flex-1 items-center justify-center gap-2 rounded-[0.9rem] border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80">
                  <CheckCircle2 className="h-4 w-4" />
                  {studentView ? 'Ready to review' : 'Ready to share'}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">Select a student to generate the report.</div>
          )}
        </div>

        <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            <TrendingUp className="h-4 w-4" />
            Report signals
          </div>
          <div className="mt-4 space-y-3">
            <div className="rounded-[1rem] border border-slate-900/10 bg-[#f8f5ef] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Top weak topic</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{topWeakTopic ? `${topWeakTopic.label} (${topWeakTopic.count})` : 'None logged yet'}</p>
            </div>
            <div className="rounded-[1rem] border border-slate-900/10 bg-[#f8f5ef] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Latest report window</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {report ? `${new Date(report.window.weekStart).toLocaleDateString()} - ${new Date(report.window.weekEnd).toLocaleDateString()}` : 'No report yet'}
              </p>
            </div>
            {report?.metrics.scoreTrend.length ? (
              <div className="rounded-[1rem] border border-slate-900/10 bg-[#f8f5ef] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Score trend</p>
                <div className="mt-3 space-y-2">
                  {report.metrics.scoreTrend.map((point) => (
                    <div key={point.label} className="space-y-1">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-slate-700">{point.label}</span>
                        <span className="font-semibold text-slate-950">{point.value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200">
                        <div className="h-2 rounded-full bg-[#d97706]" style={{ width: `${Math.max(8, point.value)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  )
}
