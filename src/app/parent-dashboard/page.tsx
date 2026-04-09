import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, BookOpen, MessageSquareText, Star } from 'lucide-react'
import { getSessionOrDemo } from '@/lib/auth/session'
import { getRoleHomePath, isParentRole } from '@/lib/auth/routes'
import { getAccessibleTutoringStudentIds } from '@/lib/tutoring/access'
import { prisma } from '@/lib/prisma'
import { fromDbTaskStatus } from '@/lib/tutoring/db'

function formatDate(value: Date | null | undefined) {
  if (!value) return 'TBD'
  return value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default async function ParentDashboardPage() {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) redirect('/login')
  if (!isParentRole(session.user.role)) redirect(getRoleHomePath(session.user.role))

  const studentIds = await getAccessibleTutoringStudentIds(session)
  if (!studentIds.length) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-slate-950 dark:text-white sm:px-6">
        <div className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Parent dashboard</p>
          <h1 className="font-display mt-3 text-4xl tracking-tight">No linked student yet.</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Ask the tutor or admin to link your account to a student profile so summaries can appear here.
          </p>
        </div>
      </div>
    )
  }

  const [students, reports, tasks] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: studentIds } },
      select: {
        id: true,
        name: true,
        studentProfile: {
          select: {
            gradeLevel: true,
            curriculum: true,
            weeklyGoal: true,
          },
        },
      },
    }),
    prisma.tutoringParentReport.findMany({
      where: { studentUserId: { in: studentIds } },
      orderBy: { periodEnd: 'desc' },
      include: {
        sessionNote: {
          select: {
            id: true,
            summary: true,
          },
        },
      },
    }),
    prisma.tutoringTask.findMany({
      where: { studentUserId: { in: studentIds } },
      orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        studentUserId: true,
        title: true,
        subject: true,
        topic: true,
        status: true,
        dueAt: true,
      },
    }),
  ])

  const rows = students.map((student) => {
    const studentReports = reports.filter((report) => report.studentUserId === student.id)
    const studentTasks = tasks.filter((task) => task.studentUserId === student.id)
    const latestReport = studentReports[0] || null
    const nextTask = studentTasks[0] || null

    return {
      student,
      latestReport,
      nextTask,
    }
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-slate-950 dark:text-white sm:px-6">
      <section className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Parent dashboard</p>
        <h1 className="font-display mt-3 text-4xl tracking-tight">One concise view of progress at home.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
          This is the read-mostly family surface. It shows what was covered, what is still open, and what the next homework step is.
        </p>
      </section>

      <section className="grid gap-5 py-6 lg:grid-cols-2">
        {rows.map(({ student, latestReport, nextTask }) => (
          <article key={student.id} className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Child overview</p>
                <h2 className="mt-2 text-2xl font-semibold">{student.name || 'Student'}</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {student.studentProfile?.gradeLevel || 'Grade TBD'} · {student.studentProfile?.curriculum || 'Curriculum TBD'}
                </p>
              </div>
              <Star className="h-5 w-5 text-[#9a5b00]" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Latest summary</p>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {latestReport ? latestReport.generatedText : 'No report has been generated yet.'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Next homework</p>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {nextTask ? `${nextTask.title} (${nextTask.subject} · ${fromDbTaskStatus(nextTask.status)} · Due ${formatDate(nextTask.dueAt)})` : 'No active homework yet.'}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ['Topics', latestReport?.topicsCovered.length || 0],
                ['Homework', latestReport?.homeworkAssigned.length || 0],
                ['Report date', latestReport ? formatDate(latestReport.periodEnd) : 'TBD'],
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="mt-2 text-lg font-semibold">{value as string | number}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/contact-us" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
                Ask a question <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/home" className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:text-white">
                View home
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-5 py-2 lg:grid-cols-[1fr_.95fr]">
        <article className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-[#f2c06d]" />
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f2c06d]">Recent reports</p>
          </div>
          <div className="mt-4 space-y-3">
            {reports.slice(0, 3).map((report) => (
              <div key={report.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold">{report.generatedText}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/50">
                  {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">What this parent view is for</p>
          <h2 className="mt-3 text-3xl font-semibold">A fast read before or after a tutoring session.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
            The goal is reassurance and alignment, not more schoolwork. If a parent can read one paragraph and know the next step, the workflow is doing its job.
          </p>
        </article>
      </section>
    </div>
  )
}
