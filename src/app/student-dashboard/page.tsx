import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, BookOpen, CheckCircle2, Clock3, FileText, Star } from 'lucide-react'
import { getSessionOrDemo } from '@/lib/auth/session'
import { getRoleHomePath, isStudentRole } from '@/lib/auth/routes'
import { prisma, DATABASE_URL_CONFIGURED } from '@/lib/prisma'
import { fromDbTaskStatus } from '@/lib/tutoring/db'
import { demoTutoringWorkspace } from '@/lib/tutoring/mock-data'

function formatDate(value: Date | null | undefined) {
  if (!value) return 'TBD'
  return value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default async function StudentDashboardPage() {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) redirect('/login')
  if (!isStudentRole(session.user.role)) redirect(getRoleHomePath(session.user.role))

  type TaskRow = {
    id: string
    title: string
    subject: string
    topic: string
    status: string
    dueAt: Date | null
    resources: { id: string; title: string; externalLink: string | null; fileName: string | null }[]
    submissions: { id: string; submittedAt: Date }[]
    feedback: { id: string; reviewedAt: Date | null; score: number | null; comments: string | null }[]
  }
  type ReportRow = { periodEnd: Date | null }
  type NoteRow = { id: string; summary: string; subject: string | null; sessionDate: Date | null }
  type SubmissionRow = { id: string; submittedAt: Date; task: { id: string; title: string } }

  let tasks: TaskRow[]
  let reports: ReportRow[]
  let notes: NoteRow[]
  let submissions: SubmissionRow[]

  if (!DATABASE_URL_CONFIGURED) {
    tasks = demoTutoringWorkspace.tasks.slice(0, 6).map((t) => ({
      id: t.id,
      title: t.title,
      subject: t.subject,
      topic: t.topic,
      status: t.status.toUpperCase(),
      dueAt: t.dueAt ? new Date(t.dueAt) : null,
      resources: t.resourceTitles.map((title, i) => ({
        id: `res-${t.id}-${i}`,
        title,
        externalLink: null,
        fileName: null,
      })),
      submissions: t.submittedAt ? [{ id: `sub-${t.id}`, submittedAt: new Date(t.submittedAt) }] : [],
      feedback: demoTutoringWorkspace.feedback
        .filter((f) => f.taskId === t.id)
        .slice(0, 1)
        .map((f) => ({
          id: f.id,
          reviewedAt: new Date(f.reviewedAt),
          score: f.score,
          comments: f.comments,
        })),
    }))
    reports = []
    notes = []
    submissions = demoTutoringWorkspace.submissions.slice(0, 3).map((s) => ({
      id: s.id,
      submittedAt: new Date(s.submittedAt),
      task: { id: s.taskId, title: s.taskTitle },
    }))
  } else {
    ;[tasks, reports, notes, submissions] = await Promise.all([
      prisma.tutoringTask.findMany({
        where: { studentUserId: session.user.id },
        orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
        include: {
          resources: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              title: true,
              externalLink: true,
              fileName: true,
            },
          },
          submissions: {
            orderBy: { submittedAt: 'desc' },
            take: 1,
            select: {
              id: true,
              submittedAt: true,
            },
          },
          feedback: {
            orderBy: { reviewedAt: 'desc' },
            take: 1,
            select: {
              id: true,
              reviewedAt: true,
              score: true,
              comments: true,
            },
          },
        },
      }),
      prisma.tutoringParentReport.findMany({
        where: { studentUserId: session.user.id },
        orderBy: { periodEnd: 'desc' },
        take: 3,
      }),
      prisma.tutoringSessionNote.findMany({
        where: { studentUserId: session.user.id },
        orderBy: { sessionDate: 'desc' },
        take: 3,
      }),
      prisma.tutoringSubmission.findMany({
        where: { studentUserId: session.user.id },
        orderBy: { submittedAt: 'desc' },
        take: 3,
        include: {
          task: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
    ])
  }

  const totalTasks = tasks.length
  const reviewedTasks = tasks.filter((task) => task.feedback.length > 0).length
  const dueSoon = tasks.filter((task) => task.dueAt && task.dueAt <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length
  const latestFeedback = tasks.find((task) => task.feedback[0])?.feedback[0] || null
  const latestReport = reports[0] || null

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-slate-950 dark:text-white sm:px-6">
      <section className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Student dashboard</p>
            <h1 className="font-display mt-3 text-4xl tracking-tight">What needs doing next.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Keep the workflow short. Open each task, submit work, and read the latest feedback without hunting through chat history.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[32rem]">
            {[
              ['Tasks', totalTasks],
              ['Reviewed', reviewedTasks],
              ['Due soon', dueSoon],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-2 text-3xl font-semibold">{value as number}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 py-6 lg:grid-cols-[1.08fr_.92fr]">
        <article className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/10 dark:border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f2c06d]">Latest feedback</p>
              <h2 className="mt-2 text-2xl font-semibold">What the tutor just said</h2>
            </div>
            <Star className="h-5 w-5 text-[#f2c06d]" />
          </div>
          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            {latestFeedback ? (
              <>
                <p className="text-sm font-semibold">{latestFeedback.comments}</p>
                <p className="mt-2 text-sm text-white/70">Score: {latestFeedback.score ?? 'N/A'}</p>
              </>
            ) : (
              <p className="text-sm text-white/70">No feedback yet. Finish the next task and the review will show up here.</p>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ['Last report', latestReport ? formatDate(latestReport.periodEnd) : 'None'],
              ['Last note', notes[0] ? formatDate(notes[0].sessionDate) : 'None'],
              ['Submissions', submissions.length],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">{label}</p>
                <p className="mt-2 text-lg font-semibold">{value as string | number}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Recent note</p>
          <h2 className="mt-2 text-2xl font-semibold">Where the tutor wants the next effort to go</h2>
          <div className="mt-5 space-y-3">
            {notes.length ? (
              notes.map((note) => (
                <div key={note.id} className="rounded-2xl border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-sm font-semibold">{note.summary}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    {note.subject || 'General'} · {formatDate(note.sessionDate)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">Session notes will appear here after the tutor logs them.</p>
            )}
          </div>
        </article>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Tasks</p>
            <h2 className="mt-2 text-2xl font-semibold">Open assignments</h2>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {tasks.length ? (
            tasks.map((task) => (
              <Link
                key={task.id}
                href={`/student-dashboard/tasks/${task.id}`}
                className="group rounded-[1.5rem] border border-slate-900/10 bg-white/90 p-5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-950/5 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-950 dark:text-white">{task.title}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {task.subject} · {task.topic}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1" />
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-slate-900/10 bg-[#f8f5ef] px-3 py-1.5 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                    {fromDbTaskStatus(task.status)}
                  </span>
                  <span className="rounded-full border border-slate-900/10 bg-[#f8f5ef] px-3 py-1.5 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                    Due {formatDate(task.dueAt)}
                  </span>
                  {task.feedback[0] ? (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                      Feedback ready
                    </span>
                  ) : null}
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-slate-900/10 bg-white/90 p-6 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              No tasks have been assigned yet.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
