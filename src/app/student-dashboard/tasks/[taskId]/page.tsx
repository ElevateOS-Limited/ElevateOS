import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, FileText, Link2, Paperclip, Star } from 'lucide-react'
import { getSessionOrDemo } from '@/lib/auth/session'
import { getRoleHomePath, isStudentRole } from '@/lib/auth/routes'
import { prisma } from '@/lib/prisma'
import { TaskSubmissionForm } from '@/components/tutoring/TaskSubmissionForm'
import { fromDbTaskStatus } from '@/lib/tutoring/db'

type PageProps = {
  params: Promise<{ taskId: string }>
}

function formatDate(value: Date | null | undefined) {
  if (!value) return 'TBD'
  return value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default async function StudentTaskPage({ params }: PageProps) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) redirect('/login')
  if (!isStudentRole(session.user.role)) redirect(getRoleHomePath(session.user.role))

  const { taskId } = await params
  const task = await prisma.tutoringTask.findUnique({
    where: { id: taskId },
    include: {
      student: {
        select: {
          id: true,
          name: true,
        },
      },
      assignedBy: {
        select: { id: true, name: true },
      },
      resources: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          title: true,
          summary: true,
          fileName: true,
          externalLink: true,
        },
      },
      submissions: {
        orderBy: { submittedAt: 'desc' },
        include: {
          feedback: {
            orderBy: { reviewedAt: 'desc' },
            include: {
              reviewer: {
                select: { id: true, name: true },
              },
            },
          },
          submittedBy: {
            select: { id: true, name: true },
          },
        },
      },
      feedback: {
        orderBy: { reviewedAt: 'desc' },
        include: {
          reviewer: {
            select: { id: true, name: true },
          },
        },
      },
    },
  })

  if (!task || task.studentUserId !== session.user.id) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-slate-950 dark:text-white sm:px-6">
      <div className="mb-6">
        <Link href="/student-dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>

      <section className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Task detail</p>
            <h1 className="font-display mt-3 text-4xl tracking-tight">{task.title}</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {task.subject} · {task.topic} · Assigned by {task.assignedBy?.name || 'Tutor'}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[30rem]">
            {[
              ['Status', fromDbTaskStatus(task.status)],
              ['Due', formatDate(task.dueAt)],
              ['Resources', task.resources.length],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-2 text-lg font-semibold">{value as string | number}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 py-6 lg:grid-cols-[1fr_.95fr]">
        <article className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Instructions</p>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{task.instructions}</p>

          <div className="mt-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Attached resources</p>
            <div className="mt-4 space-y-3">
              {task.resources.length ? (
                task.resources.map((resource) => (
                  <div key={resource.id} className="rounded-2xl border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <Paperclip className="h-4 w-4 text-[#9a5b00]" />
                      <p className="text-sm font-semibold">{resource.title}</p>
                    </div>
                    {resource.summary ? <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{resource.summary}</p> : null}
                    <div className="mt-2 flex flex-wrap gap-3 text-sm">
                      {resource.fileName ? <span className="text-slate-500 dark:text-slate-400">File: {resource.fileName}</span> : null}
                      {resource.externalLink ? (
                        <a href={resource.externalLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#9a5b00]">
                          Open link <Link2 className="h-4 w-4" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-300">No attached resources yet.</p>
              )}
            </div>
          </div>
        </article>

        <div className="grid gap-5">
          <TaskSubmissionForm taskId={task.id} />

          <article className="rounded-[1.5rem] border border-slate-900/10 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/10 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-[#f2c06d]" />
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f2c06d]">Feedback history</p>
            </div>

            <div className="mt-4 space-y-3">
              {task.feedback.length ? (
                task.feedback.map((feedback) => (
                  <div key={feedback.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{feedback.comments}</p>
                      <span className="text-xs text-white/60">{feedback.score ?? 'N/A'}</span>
                    </div>
                    {feedback.weaknesses.length ? (
                      <p className="mt-2 text-sm text-white/70">Watch: {feedback.weaknesses.join(', ')}</p>
                    ) : null}
                    {feedback.strengths.length ? (
                      <p className="mt-1 text-sm text-white/70">Strengths: {feedback.strengths.join(', ')}</p>
                    ) : null}
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/45">
                      Reviewed by {feedback.reviewer?.name || 'Tutor'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/70">Feedback will appear here after review.</p>
              )}
            </div>
          </article>

          <article className="rounded-[1.5rem] border border-slate-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Previous submissions</p>
            <div className="mt-4 space-y-3">
              {task.submissions.length ? (
                task.submissions.map((submission) => (
                  <div key={submission.id} className="rounded-2xl border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-sm font-semibold">Submitted {submission.submittedAt.toLocaleString()}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">By {submission.submittedBy?.name || 'Student'}</p>
                    {submission.textResponse ? <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{submission.textResponse}</p> : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-300">No submissions yet.</p>
              )}
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
