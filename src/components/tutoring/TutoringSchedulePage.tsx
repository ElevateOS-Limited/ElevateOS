'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarClock, CheckCircle2, Clock3 } from 'lucide-react'
import { useTutoringUi } from './TutoringDashboardShell'
import { initialStudents, isParentPov, nextSessionKey } from './tutoring-data'
import { useTutoringWorkspace } from './useTutoringWorkspace'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const toIsoDate = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const monthGrid = (month: Date) => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const startDay = first.getDay()
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: Array<Date | null> = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export default function TutoringSchedulePage() {
  const { activePov } = useTutoringUi()
  const { data } = useTutoringWorkspace()
  const parentView = isParentPov(activePov)
  const [viewMonth, setViewMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [availability, setAvailability] = useState<Record<string, 'busy' | 'open'>>(
    Object.fromEntries(DAYS.map((day) => [day, day === 'Monday' || day === 'Thursday' ? 'open' : 'busy'])) as Record<string, 'busy' | 'open'>,
  )
  const [blockedDates, setBlockedDates] = useState<string[]>([])

  const students = data?.students ?? initialStudents
  const upcoming = useMemo(() => [...students].sort((left, right) => nextSessionKey(left.nextSession) - nextSessionKey(right.nextSession)).slice(0, 5), [students])
  const openDays = Object.values(availability).filter((value) => value === 'open').length
  const todayIso = toIsoDate(new Date())

  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
      <section className="space-y-4">
        <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-[#f8f5ef] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">
            <CalendarClock className="h-3.5 w-3.5" />
            Schedule
          </div>
          <h1 className="font-display mt-4 text-3xl tracking-tight text-slate-950">
            {parentView ? 'Family calendar and next sessions' : 'Weekly availability and session timing'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            {parentView
              ? 'View confirmed appointments, upcoming time blocks, and who to contact if a session needs to move.'
              : 'Manage open days, blocked dates, and upcoming tutoring slots without leaving the dashboard. Active view: Tutor view.'}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ['Open days', parentView ? upcoming.length : openDays],
              ['Upcoming', upcoming.length],
              [parentView ? 'Reminder items' : 'Blocked dates', parentView ? blockedDates.length + (upcoming.length > 0 ? 1 : 0) : blockedDates.length],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{value as number}</p>
              </div>
            ))}
          </div>
        </div>

        {!parentView ? (
          <div className="rounded-[1.25rem] border border-slate-900/10 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Weekly availability</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">Busy vs open</h2>
              </div>
              <div className="text-sm text-slate-500">{openDays} days open</div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {DAYS.map((day) => {
                const open = availability[day] === 'open'
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setAvailability((current) => ({ ...current, [day]: current[day] === 'open' ? 'busy' : 'open' }))}
                    className={`rounded-2xl border p-4 text-left transition-colors ${open ? 'border-emerald-200 bg-emerald-50' : 'border-slate-900/10 bg-slate-50 hover:bg-[#f8f5ef]'}`}
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{day}</p>
                    <p className={`mt-2 text-sm font-semibold ${open ? 'text-emerald-700' : 'text-slate-700'}`}>{open ? 'Open' : 'Busy'}</p>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-[1.25rem] border border-slate-900/10 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Next appointments</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">Confirmed sessions only</h2>
              </div>
              <Link href="/dashboard/communication" className="text-sm font-medium text-slate-600 hover:text-slate-950">
                Request a change
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {upcoming.map((student) => (
                <div key={student.id} className="rounded-[1rem] border border-slate-900/10 bg-[#f8f5ef] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{student.name}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{student.subject}</p>
                    </div>
                    <span className="text-sm font-semibold text-[#d97706]">{student.nextSession}</span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-600">Bring a question for the recap and expect a short family update after class.</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!parentView ? (
          <div className="rounded-[1.25rem] border border-slate-900/10 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Monthly calendar</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))} className="rounded-lg border border-slate-900/10 px-2 py-1 text-sm hover:bg-[#f8f5ef]">←</button>
                <span className="min-w-[140px] text-center text-sm font-medium text-slate-700">{viewMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
                <button type="button" onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))} className="rounded-lg border border-slate-900/10 px-2 py-1 text-sm hover:bg-[#f8f5ef]">→</button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={`${day}-${index}`} className="text-center">{day}</div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {monthGrid(viewMonth).map((date, index) => {
                if (!date) return <div key={index} className="h-9" />
                const iso = toIsoDate(date)
                const isPast = iso < todayIso
                const isBlocked = blockedDates.includes(iso)

                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => setBlockedDates((current) => (current.includes(iso) ? current.filter((value) => value !== iso) : [...current, iso]))}
                    className={`flex h-9 items-center justify-center rounded-lg border text-sm transition-colors ${
                      isPast
                        ? 'border-slate-200 bg-white text-slate-400'
                        : isBlocked
                          ? 'border-amber-300 bg-amber-50 text-amber-800'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-[#f8f5ef]'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>
            <p className="mt-3 text-xs text-slate-500">Click a future date to mark or clear it as blocked.</p>
          </div>
        ) : (
          <div className="rounded-[1.25rem] border border-slate-900/10 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Calendar notes</div>
            <div className="mt-4 rounded-[1rem] bg-[#f8f5ef] p-4 text-sm leading-7 text-slate-600">
              Family view is read-only. Use Communication if a date needs to move.
            </div>
          </div>
        )}
      </section>

      <aside className="space-y-4">
        <div className="rounded-[1.25rem] border border-slate-900/10 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            <Clock3 className="h-4 w-4" />
            {parentView ? 'Upcoming sessions' : 'Upcoming sessions'}
          </div>
          <div className="mt-4 space-y-3">
            {upcoming.map((student) => (
              <div key={student.id} className="rounded-[1rem] border border-slate-900/10 bg-[#f8f5ef] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{student.name}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{student.subject}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#d97706]">{student.nextSession}</span>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {parentView ? 'Family-facing reminder: keep this time open and review the recap after class.' : `${student.progress}% progress · ${student.note}`}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-slate-900/10 bg-slate-950 p-5 text-white shadow-lg shadow-slate-950/10">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#f2c06d]">
            <CheckCircle2 className="h-4 w-4" />
            {parentView ? 'Request help' : 'Open slots'}
          </div>
          <p className="mt-3 text-sm leading-7 text-white/75">
            {parentView
              ? 'If a session needs to move, send a note to the tutor and ask for the next available slot.'
              : `Keep ${openDays} day(s) open for new sessions and move blocked dates into the calendar above when plans change.`}
          </p>
          <Link href="/dashboard/communication" className="mt-4 inline-flex items-center gap-2 rounded-[0.9rem] bg-[#3B82F6] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#60A5FA]">
            {parentView ? 'Message tutor' : 'Send scheduling update'}
          </Link>
        </div>
      </aside>
    </div>
  )
}
