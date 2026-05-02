'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, FileText, Search } from 'lucide-react'
import { useTutoringUi } from './TutoringDashboardShell'
import {
  getTutoringStudentsForPov,
  initialStudents,
  isParentPov,
  isStudentPov,
  progressLabel,
  statusClasses,
  tutoringStudentFilterOptions,
  type FilterKey,
} from './tutoring-data'
import { useTutoringWorkspace } from './useTutoringWorkspace'

export default function TutoringRecapsPage() {
  const { activePov } = useTutoringUi()
  const { data } = useTutoringWorkspace()
  const parentView = isParentPov(activePov)
  const studentView = isStudentPov(activePov)
  const students = data?.students ?? initialStudents
  const visibleStudents = getTutoringStudentsForPov(students, activePov)
  const [query, setQuery] = useState('')
  const [filterKey, setFilterKey] = useState<FilterKey>('all')
  const [selectedId, setSelectedId] = useState(visibleStudents[0]?.id ?? students[0].id)

  const filteredStudents = useMemo(() => {
    const needle = query.trim().toLowerCase()

    return visibleStudents.filter((student) => {
      const matchesQuery = !needle || [student.name, student.subject, student.grade, student.recap, student.note].join(' ').toLowerCase().includes(needle)
      const matchesFilter = filterKey === 'all' || (filterKey === 'improving' && student.status === 'Improving') || (filterKey === 'stable' && student.status === 'Stable') || (filterKey === 'declining' && student.status === 'Declining')
      return matchesQuery && matchesFilter
    })
  }, [visibleStudents, query, filterKey])

  const selectedStudent = filteredStudents.find((student) => student.id === selectedId) ?? filteredStudents[0] ?? null
  const recapCount = filteredStudents.length
  const attentionCount = filteredStudents.filter((student) => student.status === 'Declining').length
  const averageProgress = (filteredStudents.reduce((sum, student) => sum + student.progress, 0) / (filteredStudents.length || 1)).toFixed(0)

  return (
    <div className="grid gap-4 xl:grid-cols-[1.3fr_.9fr]">
      <section className="space-y-4">
        <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-[#f8f5ef] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">
                <FileText className="h-3.5 w-3.5" />
                Recaps
              </div>
              <h1 className="font-display mt-4 text-3xl tracking-tight text-slate-950">
                {parentView ? 'Recent parent updates' : studentView ? 'Your recent session summaries' : 'Recent session summaries'}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                {parentView
                  ? 'Read the short version of each recap before the next check-in. The text stays simple and parent-facing.'
                  : studentView
                    ? 'Read the short version of each recap and review the next note before class.'
                    : 'Keep tutor notes ready for a parent update, a follow-up message, or the next session plan.'}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 text-center">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{parentView ? 'Shown' : 'Visible'}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{recapCount}</p>
            </div>
              <div className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{parentView ? 'Follow up' : 'Declining'}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{attentionCount}</p>
              </div>
              <div className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Average</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{averageProgress}%</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex items-center gap-[7px] rounded-[8px] border border-[#E9ECEF] bg-white px-[11px] py-[6px] text-[#6B6B6B]">
              <Search className="h-[13px] w-[13px] shrink-0 text-[#9B9B9B]" />
              <input
                className="w-full bg-transparent text-[13px] text-[#1A1A1A] outline-none placeholder:text-[#9B9B9B]"
                placeholder="Search recaps and student notes…"
                aria-label="Search recaps"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>

            {parentView ? (
              <div className="rounded-[1rem] border border-slate-900/10 bg-[#f8f5ef] px-4 py-3 text-sm leading-7 text-slate-600">
                These summaries are trimmed for parents. Use Messages for the full thread.
              </div>
            ) : studentView ? (
              <div className="rounded-[1rem] border border-slate-900/10 bg-[#f8f5ef] px-4 py-3 text-sm leading-7 text-slate-600">
                These recaps are written for student use. Use Messages to message your tutor.
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#4A4A4A]">
                {tutoringStudentFilterOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setFilterKey(option.key)}
                    className={[
                      'rounded-full border px-3 py-1 transition-colors',
                      filterKey === option.key ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#3B82F6]' : 'border-[#E9ECEF] bg-white hover:bg-[#F8F9FA]',
                    ].join(' ')}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {filteredStudents.map((student) => (
            <button
              key={student.id}
              type="button"
              onClick={() => setSelectedId(student.id)}
              className={[
                'w-full rounded-[1.25rem] border p-4 text-left transition-all',
                selectedStudent?.id === student.id ? 'border-[#3B82F6] bg-[#EFF6FF] shadow-sm' : 'border-slate-900/10 bg-white hover:-translate-y-0.5 hover:shadow-md',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{student.name}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{student.subject} · {student.grade} · {student.nextSession}</p>
              </div>
                <span className={['rounded-full border px-3 py-1 text-xs font-semibold', statusClasses(student.status)].join(' ')}>
                  {parentView ? 'Parent note' : progressLabel(student.status)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {parentView ? `Simple update: ${student.recap}` : student.recap}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
                <span>{student.sessions} sessions</span>
                <span>{student.progress}% progress</span>
                <span>{parentView ? 'Review with family' : studentView ? 'Review before class' : student.note}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-[1.25rem] border border-slate-900/10 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{parentView ? 'Parent-ready recap' : 'Selected recap'}</div>
          {selectedStudent ? (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-lg font-semibold text-slate-950">{selectedStudent.name}</p>
                <p className="text-sm text-slate-500">{selectedStudent.subject} · {selectedStudent.grade}</p>
              </div>
              <div className="rounded-[1rem] bg-[#f8f5ef] p-4 text-sm leading-7 text-slate-700">
                {parentView ? `What parents should know: ${selectedStudent.recap}` : studentView ? `What you should review: ${selectedStudent.recap}` : selectedStudent.recap}
              </div>
              <div className="rounded-[1rem] border border-slate-900/10 p-4 text-sm leading-7 text-slate-700">
                <span className="font-semibold text-slate-950">{parentView ? 'Next family note:' : studentView ? 'Next study note:' : 'Next note:'}</span> {selectedStudent.note}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-[1rem] border border-slate-900/10 p-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Next session</div>
                  <div className="mt-1 font-semibold text-slate-950">{selectedStudent.nextSession}</div>
                </div>
                <div className="rounded-[1rem] border border-slate-900/10 p-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Progress</div>
                  <div className="mt-1 font-semibold text-slate-950">{selectedStudent.progress}%</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/dashboard/communication" className="inline-flex flex-1 items-center justify-center gap-2 rounded-[0.9rem] bg-[#3B82F6] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#60A5FA]">
                  <ArrowRight className="h-4 w-4" />
                  {parentView ? 'Message tutor' : studentView ? 'Message tutor' : 'Send update'}
                </Link>
                <Link href="/dashboard/schedule" className="inline-flex flex-1 items-center justify-center rounded-[0.9rem] border border-slate-900/10 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-[#f8f5ef]">
                  {parentView ? 'Check next session' : 'Review schedule'}
                </Link>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-7 text-slate-600">No recap matches the current filter.</p>
          )}
        </div>
      </aside>
    </div>
  )
}
