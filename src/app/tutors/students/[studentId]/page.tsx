import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, FileText, Users } from 'lucide-react'
import { getSessionOrDemo } from '@/lib/auth/session'
import { getRoleHomePath, isTutoringStaffRole } from '@/lib/auth/routes'
import { getAccessibleTutoringStudentIds } from '@/lib/tutoring/access'
import { prisma } from '@/lib/prisma'
import { fromDbTaskStatus } from '@/lib/tutoring/db'
import { TaskAssignmentForm } from '@/components/tutoring/TaskAssignmentForm'
import { SessionNoteForm } from '@/components/tutoring/SessionNoteForm'
import { ParentReportForm } from '@/components/tutoring/ParentReportForm'
import { FeedbackForm } from '@/components/tutoring/FeedbackForm'

type PageProps = {
  params: Promise<{ studentId: string }>
}

function formatDate(value: Date | null | undefined) {
  if (!value) return 'TBD'
  return value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function formatDateInput(value: Date | null | undefined) {
  if (!value) return ''
  return value.toISOString().slice(0, 10)
}

function joinList(values: string[] | null | undefined) {
  return (values || []).join(', ')
}

function summarizeText(value: string | null | undefined, limit = 220) {
  const text = (value || '').trim()
  if (!text) return 'No summary yet.'
  if (text.length <= limit) return text
  return `${text.slice(0, limit).trim()}...`
}

export default async function TutorStudentPage({ params }: PageProps) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) redirect('/login')
  if (!isTutoringStaffRole(session.user.role)) redirect(getRoleHomePath(session.user.role))

  const { studentId } = await params
  const accessibleStudentIds = await getAccessibleTutoringStudentIds(session)
  if (!accessibleStudentIds.includes(studentId)) redirect('/tutors')

  const [student, tasks, notes, reports] = await Promise.all([
    prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        email: true,
        studentProfile: {
          select: {
            gradeLevel: true,
            curriculum: true,
            schoolName: true,
            weeklyGoal: true,
            notes: true,
          },
        },
        tutoringParentLinksAsStudent: {
          orderBy: { createdAt: 'asc' },
          include: {
            parent: {
              select: {
                id: true,
                name: true,
                email: true,
                parentProfile: {
                  select: {
                    householdLabel: true,
                    preferredChannel: true,
                  },
                },
              },
            },
          },
        },
        tutoringTutorLinks: {
          orderBy: { createdAt: 'asc' },
          include: {
            tutor: {
              select: {
                id: true,
                name: true,
                email: true,
                tutorProfile: {
                  select: {
                    specialties: true,
                    weeklyCapacity: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.tutoringTask.findMany({
      where: { studentUserId: studentId },
      orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
      include: {
        resources: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            title: true,
            kind: true,
            accessTier: true,
            externalLink: true,
          },
        },
        submissions: {
          orderBy: { submittedAt: 'desc' },
          include: {
            submittedBy: {
              select: { id: true, name: true },
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
    }),
    prisma.tutoringSessionNote.findMany({
      where: { studentUserId: studentId },
      orderBy: { sessionDate: 'desc' },
      take: 5,
    }),
    prisma.tutoringParentReport.findMany({
      where: { studentUserId: studentId },
      orderBy: { periodEnd: 'desc' },
      take: 5,
    }),
  ])

  if (!student) notFound()

  const latestTask = tasks[0] || null
  const latestNote = notes[0] || null
  const latestReport = reports[0] || null
  const openTasks = tasks.filter((task) => task.status !== 'COMPLETED' && task.status !== 'REVIEWED').length
  const recentFeedbackCount = tasks.reduce((total, task) => total + task.feedback.length, 0)

  const noteDefaultTopics = latestNote?.topicsCovered?.length ? latestNote.topicsCovered : latestTask ? [latestTask.topic] : []
  const noteDefaultHomework = latestNote?.homeworkAssigned?.length ? latestNote.homeworkAssigned : latestTask ? [latestTask.title] : []
  const noteDefaultWeakTopics = latestNote?.weakTopics?.length ? latestNote.weakTopics : latestTask?.weakTopics || []
  const noteDefaultNextSteps = latestNote?.nextSteps?.length ? latestNote.nextSteps : []

  const reportPeriodEnd = latestNote?.sessionDate || latestReport?.periodEnd || new Date()
  const reportPeriodStart = latestReport?.periodStart || new Date(reportPeriodEnd.getTime() - 7 * 24 * 60 * 60 * 1000)
  const reportDefaultTopics = latestReport?.topicsCovered?.length ? latestReport.topicsCovered : noteDefaultTopics
  const reportDefaultStrengths = latestReport?.strengths || []
  const reportDefaultWeaknesses = latestReport?.weaknesses?.length ? latestReport.weaknesses : noteDefaultWeakTopics
  const reportDefaultHomework = latestReport?.homeworkAssigned?.length ? latestReport.homeworkAssigned : noteDefaultHomework
  const reportDefaultProgress = latestReport?.progressNote || latestNote?.summary || ''
  const reportDefaultGeneratedText = latestReport?.generatedText || ''
  const reportDefaultChannel = (latestReport?.channel as 'in_app' | 'email' | 'line' | 'wechat' | undefined) || 'in_app'
  const reportDefaultDeliveryStatus = (latestReport?.deliveryStatus as 'draft' | 'queued' | 'sent' | 'archived' | undefined) || 'draft'

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-slate-950 dark:text-white sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/tutors"
          className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tutors
        </Link>
      </div>

      <section className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Student workspace</p>
            <h1 className="font-display mt-3 text-4xl tracking-tight">{student.name || 'Student'}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              One place for task assignment, submission review, session notes, and parent reporting.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[34rem]">
            {[
              ['Open tasks', openTasks],
              ['Notes', notes.length],
              ['Feedback', recentFeedbackCount],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-2 text-3xl font-semibold">{value as number}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Grade</p>
            <p className="mt-2 text-lg font-semibold">{student.studentProfile?.gradeLevel || 'TBD'}</p>
          </div>
          <div className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Curriculum</p>
            <p className="mt-2 text-lg font-semibold">{student.studentProfile?.curriculum || 'TBD'}</p>
          </div>
          <div className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">School</p>
            <p className="mt-2 text-lg font-semibold">{student.studentProfile?.schoolName || 'TBD'}</p>
          </div>
          <div className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Weekly goal</p>
            <p className="mt-2 text-sm leading-6 font-medium text-slate-700 dark:text-slate-200">
              {student.studentProfile?.weeklyGoal || 'No weekly goal recorded yet.'}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 py-6 lg:grid-cols-[1fr_.95fr]">
        <TaskAssignmentForm studentId={studentId} />

        <article className="grid gap-4">
          <div className="rounded-[1.5rem] border border-slate-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#9a5b00]" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9a5b00]">Linked adults</p>
            </div>

            <div className="mt-4 grid gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Parents</p>
                <div className="mt-2 space-y-2">
                  {student.tutoringParentLinksAsStudent.length ? (
                    student.tutoringParentLinksAsStudent.map((link) => (
                      <div key={link.id} className="rounded-2xl border border-slate-900/10 bg-[#f8f5ef] p-3 text-sm dark:border-white/10 dark:bg-white/5">
                        <p className="font-semibold">{link.parent.name || link.parent.email || 'Parent'}</p>
                        <p className="text-slate-600 dark:text-slate-300">
                          {link.parent.parentProfile?.householdLabel || 'Family contact'} · {link.parent.parentProfile?.preferredChannel || 'email'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-300">No parent linked yet.</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Tutors</p>
                <div className="mt-2 space-y-2">
                  {student.tutoringTutorLinks.length ? (
                    student.tutoringTutorLinks.map((link) => (
                      <div key={link.id} className="rounded-2xl border border-slate-900/10 bg-[#f8f5ef] p-3 text-sm dark:border-white/10 dark:bg-white/5">
                        <p className="font-semibold">{link.tutor.name || link.tutor.email || 'Tutor'}</p>
                        <p className="text-slate-600 dark:text-slate-300">
                          {joinList(link.tutor.tutorProfile?.specialties || []) || 'General tutoring'} · Capacity {link.tutor.tutorProfile?.weeklyCapacity || 'n/a'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-300">No tutor linked yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <SessionNoteForm
            studentId={studentId}
            defaultSubject={latestNote?.subject || latestTask?.subject || ''}
            defaultTopicsCovered={noteDefaultTopics}
            defaultHomeworkAssigned={noteDefaultHomework}
            defaultWeakTopics={noteDefaultWeakTopics}
            defaultNextSteps={noteDefaultNextSteps}
            defaultSummary={latestNote?.summary || ''}
            defaultRawNotes={latestNote?.rawNotes || ''}
          />

          <ParentReportForm
            studentId={studentId}
            defaultSessionNoteId={latestNote?.id || null}
            defaultPeriodStart={formatDateInput(reportPeriodStart)}
            defaultPeriodEnd={formatDateInput(reportPeriodEnd)}
            defaultTopicsCovered={reportDefaultTopics}
            defaultStrengths={reportDefaultStrengths}
            defaultWeaknesses={reportDefaultWeaknesses}
            defaultHomeworkAssigned={reportDefaultHomework}
            defaultProgressNote={reportDefaultProgress}
            defaultGeneratedText={reportDefaultGeneratedText}
            defaultChannel={reportDefaultChannel}
            defaultDeliveryStatus={reportDefaultDeliveryStatus}
          />
        </article>
      </section>

      <section className="grid gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[#9a5b00]" />
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9a5b00]">Tasks and reviews</p>
        </div>

        <div className="grid gap-4">
          {tasks.length ? (
            tasks.map((task) => (
              <article key={task.id} className="rounded-[1.5rem] border border-slate-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{task.title}</h2>
                      <span className="rounded-full border border-slate-900/10 bg-[#f8f5ef] px-3 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                        {fromDbTaskStatus(task.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {task.subject} · {task.topic} · Due {formatDate(task.dueAt)}
                    </p>
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {task.instructions}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-900/10 bg-[#f8f5ef] px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Weak topics</p>
                    <p className="mt-1 font-medium text-slate-700 dark:text-slate-200">
                      {task.weakTopics.length ? joinList(task.weakTopics) : 'None recorded'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Resources</p>
                    <div className="mt-2 space-y-2">
                      {task.resources.length ? (
                        task.resources.map((resource) => (
                          <div key={resource.id} className="rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950/50">
                            <p className="font-medium">{resource.title}</p>
                            <p className="text-slate-500 dark:text-slate-400">
                              {resource.kind} · {resource.accessTier}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-600 dark:text-slate-300">No resources attached.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Task feedback</p>
                    <div className="mt-2 space-y-2">
                      {task.feedback.length ? (
                        task.feedback.map((feedback) => (
                          <div key={feedback.id} className="rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950/50">
                            <p className="font-medium">{summarizeText(feedback.comments, 180)}</p>
                            <p className="text-slate-500 dark:text-slate-400">
                              {feedback.reviewer?.name || 'Tutor'} · {formatDate(feedback.reviewedAt)} · {feedback.score ?? 'N/A'}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-600 dark:text-slate-300">No feedback yet.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#9a5b00]" />
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9a5b00]">Submissions</p>
                  </div>

                  {task.submissions.length ? (
                    task.submissions.map((submission) => (
                      <div key={submission.id} className="grid gap-4 rounded-2xl border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-950 dark:text-white">
                              Submitted by {submission.submittedBy?.name || 'Student'}
                            </p>
                            <span className="rounded-full border border-slate-900/10 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300">
                              {formatDate(submission.submittedAt)}
                            </span>
                            {submission.feedback.length ? (
                              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                                {submission.feedback.length} feedback item(s)
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                            {summarizeText(submission.textResponse, 260)}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                            {submission.fileName ? <span>File: {submission.fileName}</span> : null}
                            {submission.externalLink ? <span>Link: {submission.externalLink}</span> : null}
                          </div>
                        </div>

                        <FeedbackForm
                          submissionId={submission.id}
                          defaultSummary={submission.feedback[0]?.comments || ''}
                          defaultStrengths={submission.feedback[0]?.strengths || []}
                          defaultWeaknesses={submission.feedback[0]?.weaknesses || []}
                          defaultNextSteps={submission.feedback[0]?.nextAction || ''}
                          defaultScore={submission.feedback[0]?.score ?? null}
                          defaultWeakTopicTags={submission.feedback[0]?.weakTopics || []}
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-300">No submissions yet.</p>
                  )}
                </div>
              </article>
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
