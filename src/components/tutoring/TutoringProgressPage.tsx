'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, AlertTriangle, TrendingUp } from 'lucide-react'
import { useTutoringUi } from './TutoringDashboardShell'
import { initialStudents, isParentPov, progressColor, progressLabel, statusClasses } from './tutoring-data'
import { useTutoringWorkspace } from './useTutoringWorkspace'

export default function TutoringProgressPage() {
  const { activePov } = useTutoringUi()
  const { data } = useTutoringWorkspace()
  const parentView = isParentPov(activePov)
  const students = data?.students ?? initialStudents
  const [selectedId, setSelectedId] = useState(students[0].id)

  const sortedStudents = useMemo(() => [...students].sort((left, right) => right.progress - left.progress || left.name.localeCompare(right.name)), [students])
  const selectedStudent = sortedStudents.find((student) => student.id === selectedId) ?? sortedStudents[0]
  const accelerating = sortedStudents.filter((student) => student.status === 'Improving').length
  const steady = sortedStudents.filter((student) => student.status === 'Stable').length
  const intervention = sortedStudents.filter((student) => student.status === 'Declining').length
  const averageProgress = (sortedStudents.reduce((sum, student) => sum + student.progress, 0) / sortedStudents.length).toFixed(1)
  const summaryCards = parentView
    ? [
        { label: 'On track', value: accelerating + steady },
        { label: 'Needs support', value: intervention },
        { label: 'Average', value: `${averageProgress}%` },
      ]
    : [
        { label: 'Average', value: `${averageProgress}%` },
        { label: 'Improving', value: accelerating },
        { label: 'Intervention', value: intervention },
      ]

  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
      <section className="space-y-4">
        <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-[#f8f5ef] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">
            <TrendingUp className="h-3.5 w-3.5" />
            Progress
          </div>
          <h1 className="font-display mt-4 text-3xl tracking-tight text-slate-950">
            {parentView ? 'Parent progress snapshot' : 'Trend lines and intervention signals'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            {parentView
              ? 'See how each student is moving, what is coming up next, and which class needs a nudge at home.'
              : 'Track growth across the roster, isolate students who need a reset, and keep the current view aligned with Tutor POV.'}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {summaryCards.map((card) => (
              <div key={card.label} className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{card.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-slate-900/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{parentView ? 'Family trend' : 'Roster trend'}</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">{parentView ? 'How the week looks at a glance' : 'Sorted by progress'}</h2>
            </div>
            <Link href="/dashboard/students" className="text-sm font-medium text-slate-600 hover:text-slate-950">
              {parentView ? 'Open family roster' : 'Open roster'}
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {sortedStudents.map((student) => (
              <button
                key={student.id}
                type="button"
                onClick={() => setSelectedId(student.id)}
                className={[
                  'w-full rounded-[1rem] border p-4 text-left transition-colors',
                  selectedStudent?.id === student.id ? 'border-[#3B82F6] bg-[#EFF6FF]' : 'border-slate-900/10 hover:bg-[#f8f5ef]',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{student.name}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{student.subject} · {student.nextSession}</p>
                  </div>
                  <span className={['rounded-full border px-3 py-1 text-xs font-semibold', statusClasses(student.status)].join(' ')}>
                    {progressLabel(student.status)}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full" style={{ width: `${student.progress}%`, backgroundColor: progressColor(student.progress) }} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{student.progress}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-[1.25rem] border border-slate-900/10 bg-slate-950 p-5 text-white shadow-lg shadow-slate-950/10">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f2c06d]">{parentView ? 'Family snapshot' : 'Selected student'}</div>
          {selectedStudent ? (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-lg font-semibold">{selectedStudent.name}</p>
                <p className="text-sm text-white/65">{selectedStudent.subject} · {selectedStudent.grade}</p>
              </div>
              <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/75">
                {parentView ? `At-home snapshot: ${selectedStudent.recap}` : selectedStudent.recap}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-[1rem] border border-white/10 bg-white/5 p-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/50">Sessions</div>
                  <div className="mt-1 font-semibold">{selectedStudent.sessions}</div>
                </div>
                <div className="rounded-[1rem] border border-white/10 bg-white/5 p-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/50">Next</div>
                  <div className="mt-1 font-semibold">{selectedStudent.nextSession}</div>
                </div>
              </div>
              <div className="rounded-[1rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/75">
                <span className="font-semibold text-white">{parentView ? 'Family note:' : 'Next note:'}</span> {selectedStudent.note}
              </div>
            </div>
          ) : null}
        </div>

        {parentView ? (
          <div className="rounded-[1.25rem] border border-slate-900/10 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              <AlertTriangle className="h-4 w-4" />
              Parent action items
            </div>
            <div className="mt-4 space-y-3">
              {sortedStudents.filter((student) => student.status === 'Declining').map((student) => (
                <div key={student.id} className="rounded-[1rem] border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-900">{student.name}</p>
                  <p className="mt-1 text-sm leading-6 text-amber-800">{student.note}</p>
                </div>
              ))}
            </div>
            <Link href="/dashboard/communication" className="mt-4 inline-flex items-center gap-2 rounded-[0.9rem] bg-[#3B82F6] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#60A5FA]">
              <ArrowRight className="h-4 w-4" />
              Message tutor
            </Link>
          </div>
        ) : (
          <div className="rounded-[1.25rem] border border-slate-900/10 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              <AlertTriangle className="h-4 w-4" />
              Intervention queue
            </div>
            <div className="mt-4 space-y-3">
              {sortedStudents.filter((student) => student.status === 'Declining').map((student) => (
                <div key={student.id} className="rounded-[1rem] border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm font-semibold text-rose-900">{student.name}</p>
                  <p className="mt-1 text-sm leading-6 text-rose-800">{student.note}</p>
                </div>
              ))}
            </div>
            <Link href="/dashboard/communication" className="mt-4 inline-flex items-center gap-2 rounded-[0.9rem] bg-[#3B82F6] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#60A5FA]">
              <ArrowRight className="h-4 w-4" />
              Notify parents
            </Link>
          </div>
        )}
      </aside>
    </div>
  )
}
