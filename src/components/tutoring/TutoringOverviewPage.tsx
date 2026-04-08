'use client'

import Link from 'next/link'
import { ArrowRight, FileText, TrendingUp, Users } from 'lucide-react'
import { useTutoringUi } from './TutoringDashboardShell'
import { initialStudents, isParentPov, nextSessionKey, progressLabel, tutoringSectionMeta } from './tutoring-data'
import { useTutoringWorkspace } from './useTutoringWorkspace'

export default function TutoringOverviewPage() {
  const { activePov } = useTutoringUi()
  const { data } = useTutoringWorkspace()
  const parentView = isParentPov(activePov)
  const students = data?.students ?? initialStudents

  const totalStudents = students.length
  const accelerating = students.filter((student) => student.status === 'Improving').length
  const steady = students.filter((student) => student.status === 'Stable').length
  const intervention = students.filter((student) => student.status === 'Declining').length
  const averageProgress = (students.reduce((sum, student) => sum + student.progress, 0) / Math.max(1, totalStudents)).toFixed(1)
  const upcoming = [...students].sort((left, right) => nextSessionKey(left.nextSession) - nextSessionKey(right.nextSession)).slice(0, 4)
  const priorityStudents = students.filter((student) => student.status === 'Declining').slice(0, 3)
  const visibleLinks = parentView
    ? [
        { href: '/dashboard/tasks', label: 'Tasks', desc: 'See what has been assigned and what is due next.' },
        { href: '/dashboard/feedback', label: 'Feedback', desc: 'Read the latest review snapshots and next actions.' },
        { href: '/dashboard/reports', label: 'Reports', desc: 'Open the weekly family summary with AI-compressed notes.' },
        { href: '/dashboard/recaps', label: 'Recaps', desc: 'Read parent-ready session notes and follow-ups.' },
        { href: '/dashboard/progress', label: 'Progress', desc: 'See growth trends and the next milestones.' },
        { href: '/dashboard/resources', label: 'Resources', desc: 'Review lesson files and support material.' },
        { href: '/dashboard/communication', label: 'Communication', desc: 'Open parent messages and tutor replies.' },
        { href: '/dashboard/schedule', label: 'Schedule', desc: 'Check upcoming sessions and timing.' },
      ]
    : [
        { href: '/dashboard/students', label: 'Students', desc: 'Roster, filters, and student notes.' },
        { href: '/dashboard/tasks', label: 'Tasks', desc: 'Weekly assignments, deadlines, and submission flow.' },
        { href: '/dashboard/feedback', label: 'Feedback', desc: 'Reviewed work, weak areas, and next steps.' },
        { href: '/dashboard/reports', label: 'Reports', desc: 'Build the weekly parent summary from the current loop.' },
        { href: '/dashboard/recaps', label: 'Recaps', desc: 'Recent session summaries and parent-ready notes.' },
        { href: '/dashboard/progress', label: 'Progress', desc: 'Track movers, intervention flags, and growth.' },
        { href: '/dashboard/resources', label: 'Resources', desc: 'Lesson files, question banks, and tutor notes.' },
        { href: '/dashboard/schedule', label: 'Schedule', desc: 'See the week, open slots, and upcoming sessions.' },
        { href: '/dashboard/communication', label: 'Communication', desc: 'Threads, reminders, and follow-ups.' },
        { href: '/dashboard/settings', label: 'Settings', desc: 'Tutor preferences and default workflow options.' },
      ]
  const stats = [
    parentView
      ? { label: 'Sessions', value: upcoming.length, icon: <Users className="h-5 w-5 text-[#d97706]" /> }
      : { label: 'Students', value: totalStudents, icon: <Users className="h-5 w-5 text-[#d97706]" /> },
    parentView
      ? { label: 'Avg progress', value: `${averageProgress}%`, icon: <TrendingUp className="h-5 w-5 text-[#d97706]" /> }
      : { label: 'Avg progress', value: `${averageProgress}%`, icon: <TrendingUp className="h-5 w-5 text-[#d97706]" /> },
    parentView
      ? { label: 'Needs attention', value: intervention, icon: <FileText className="h-5 w-5 text-[#d97706]" /> }
      : { label: 'Intervention', value: intervention, icon: <FileText className="h-5 w-5 text-[#d97706]" /> },
  ]

  return (
    <div className="space-y-6">
      <section className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-[#f8f5ef] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">
              <Users className="h-3.5 w-3.5" />
              {parentView ? 'Parent dashboard' : 'Tutor dashboard'}
            </div>
            <h1 className="font-display mt-4 text-4xl tracking-tight text-slate-950 sm:text-5xl">
              {parentView ? 'Family progress snapshot' : tutoringSectionMeta.dashboard.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              {parentView
                ? 'A family-friendly snapshot of what changed this week, what comes next, and where to message the tutor.'
                : 'Use the tabs to move between students, recaps, progress, schedule, communication, and settings.'}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[32rem]">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
                  {stat.icon}
                </div>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.08fr_.92fr]">
        <article className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d97706]">Priorities</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                {parentView ? 'What your child should focus on this week' : 'What needs attention today'}
              </h2>
            </div>
            <Link href={parentView ? '/dashboard/recaps' : '/dashboard/students'} className="text-sm font-medium text-slate-600 hover:text-slate-950">
              {parentView ? 'Open recaps' : 'Open roster'}
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {(priorityStudents.length ? priorityStudents : upcoming.slice(0, 3)).map((student, index) => (
              <div key={student.id} className="rounded-2xl border border-slate-900/10 bg-[#f8f5ef] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{index + 1}. {student.name}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{student.subject} · {student.grade}</p>
                  </div>
                  <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                    {parentView ? 'Parent update' : progressLabel(student.status)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {parentView
                    ? `Focus on ${student.subject.toLowerCase()} and the next session at ${student.nextSession}. ${student.recap}`
                    : student.note}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2c06d]">{parentView ? 'Upcoming family view' : 'Upcoming'}</p>
          <h2 className="mt-2 text-2xl font-semibold">{parentView ? 'Next sessions and what to expect' : 'Next sessions and timing'}</h2>

          <div className="mt-5 space-y-3">
            {upcoming.map((student) => (
              <div key={student.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{student.name}</p>
                    <p className="text-xs text-white/60">{student.subject} · {student.grade}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{student.nextSession}</p>
                    <p className="text-xs text-white/55">{student.progress}% progress</p>
                  </div>
                </div>
                {parentView ? <p className="mt-2 text-sm leading-6 text-white/70">Bring one question to the next session and review the recap after class.</p> : null}
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ['Accelerating', accelerating],
              ['Steady', steady],
              ['Intervention', intervention],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">{label}</p>
                <p className="mt-2 text-3xl font-semibold text-white">{value as number}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d97706]">Navigation</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{parentView ? 'Open the family-friendly pages' : 'Jump into the right page'}</h2>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-[1.5rem] border border-slate-900/10 bg-white p-5 transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-lg font-semibold text-slate-950">{link.label}</p>
                <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#d97706]" />
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-600">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
