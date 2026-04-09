import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, BookOpen, MessageSquareText, Sparkles, Users } from 'lucide-react'
import { LeadCaptureForm } from '@/components/public/LeadCaptureForm'
import { getSessionOrDemo } from '@/lib/auth/session'
import { getRoleHomePath, isTutoringStaffRole } from '@/lib/auth/routes'
import { getAccessibleTutoringStudentIds } from '@/lib/tutoring/access'
import { prisma } from '@/lib/prisma'
import { fromDbTaskStatus } from '@/lib/tutoring/db'

function formatDate(value: Date | null | undefined) {
  if (!value) return 'TBD'
  return value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default async function TutorsPage() {
  const session = await getSessionOrDemo()

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f8f5ef_0%,#ffffff_100%)] px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-white">
        <div className="mx-auto max-w-6xl">
          <section className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Tutors</p>
            <h1 className="font-display mt-3 text-4xl tracking-tight">A lighter workspace for the people doing the tutoring.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              This route doubles as a public tutor-facing page and the signed-in workspace entry. It keeps the service legible for families and efficient for tutors.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
                Login <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/onboarding?role=tutor" className="rounded-full border border-slate-900/10 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:text-white">
                Tutor onboarding
              </Link>
            </div>
          </section>

          <section className="grid gap-5 py-8 lg:grid-cols-[1fr_.95fr]">
            <article className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/10 dark:border-white/10">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f2c06d]">What tutors need</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-white/78">
                <p>One place to assign work.</p>
                <p>One place to review submissions.</p>
                <p>One place to log session notes.</p>
                <p>One place to generate parent summaries.</p>
              </div>
            </article>

            <article className="rounded-[2rem] border border-slate-900/10 bg-[#f8f5ef] p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Lead capture</p>
              <h2 className="mt-3 text-3xl font-semibold">Bring families into the tutoring loop.</h2>
              <LeadCaptureForm source="tutors-public" defaultRoleInterest="tutor" className="mt-5" />
            </article>
          </section>
        </div>
      </div>
    )
  }

  if (!isTutoringStaffRole(session.user.role)) {
    redirect(getRoleHomePath(session.user.role))
  }

  const accessibleStudentIds = await getAccessibleTutoringStudentIds(session)
  const [students, tasks, reports, notes] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: accessibleStudentIds } },
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
    prisma.tutoringTask.findMany({
      where: { studentUserId: { in: accessibleStudentIds } },
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
    prisma.tutoringParentReport.findMany({
      where: { studentUserId: { in: accessibleStudentIds } },
      orderBy: { periodEnd: 'desc' },
      take: 5,
    }),
    prisma.tutoringSessionNote.findMany({
      where: { studentUserId: { in: accessibleStudentIds } },
      orderBy: { sessionDate: 'desc' },
      take: 5,
    }),
  ])

  const totalTasks = tasks.length
  const submittedTasks = tasks.filter((task) => ['SUBMITTED', 'REVIEWED', 'COMPLETED'].includes(task.status)).length
  const openStudents = students.length
  const activeReports = reports.length

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-slate-950 dark:text-white sm:px-6">
      <section className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Tutor workspace</p>
            <h1 className="font-display mt-3 text-4xl tracking-tight">The shortest path from assignment to parent summary.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Tutors manage student work here. Pick a student, create a task, review a submission, log session notes, and trigger the parent summary.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[32rem]">
            {[
              ['Students', openStudents],
              ['Tasks', totalTasks],
              ['Reports', activeReports],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-2 text-3xl font-semibold">{value as number}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 py-6 lg:grid-cols-[1fr_.95fr]">
        <article className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#f2c06d]" />
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f2c06d]">Students</p>
          </div>
          <div className="mt-5 space-y-3">
            {students.map((student) => {
              const nextTask = tasks.find((task) => task.studentUserId === student.id) || null
              const latestNote = notes.find((note) => note.studentUserId === student.id) || null

              return (
                <Link key={student.id} href={`/tutors/students/${student.id}`} className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{student.name || 'Student'}</p>
                      <p className="text-xs text-white/55">
                        {student.studentProfile?.gradeLevel || 'Grade TBD'} · {student.studentProfile?.curriculum || 'Curriculum TBD'}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#f2c06d]" />
                  </div>
                  <p className="mt-2 text-sm text-white/72">
                    Next task: {nextTask ? nextTask.title : 'None yet'} {nextTask ? `· ${fromDbTaskStatus(nextTask.status)} · Due ${formatDate(nextTask.dueAt)}` : ''}
                  </p>
                  {latestNote ? <p className="mt-1 text-sm text-white/60">Last note: {latestNote.summary}</p> : null}
                </Link>
              )
            })}
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Recent reports</p>
              <h2 className="mt-2 text-2xl font-semibold">Parent-facing summaries are already generated.</h2>
            </div>
            <Sparkles className="h-5 w-5 text-[#9a5b00]" />
          </div>

          <div className="mt-5 space-y-3">
            {reports.slice(0, 3).map((report) => (
              <div key={report.id} className="rounded-2xl border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">{report.generatedText}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  {formatDate(report.periodStart)} - {formatDate(report.periodEnd)} · {report.channel}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 py-2 lg:grid-cols-2">
        <article className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#9a5b00]" />
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Open work</p>
          </div>
          <div className="mt-4 space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="rounded-2xl border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold">{task.title}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {task.subject} · {task.topic} · {fromDbTaskStatus(task.status)} · Due {formatDate(task.dueAt)}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-[#f2c06d]" />
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f2c06d]">Session notes</p>
          </div>
          <div className="mt-4 space-y-3">
            {notes.slice(0, 3).map((note) => (
              <div key={note.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold">{note.summary}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/50">
                  {note.subject || 'General'} · {formatDate(note.sessionDate)}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
