'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarClock,
  Clock3,
  FileText,
  Loader2,
  MessageSquare,
  Settings as SettingsIcon,
  Sparkles,
  Users,
} from 'lucide-react'
import {
  progressColor,
  progressLabel,
  taskStatusClasses,
  taskStatusLabel,
  type TutoringTaskStatus,
} from '@/components/tutoring/tutoring-data'

type ProfileAvailability = {
  weekly?: Record<string, 'open' | 'busy'>
  blockedDates?: string[]
}

type DashboardProfile = {
  name: string | null
  role: string | null
  gradeLevel: string | null
  curriculum: string | null
  subjects: string[] | null
  intendedMajor: string | null
  targetUniversities: string[] | null
  careerInterests: string[] | null
  gpa: number | null
  satScore: number | null
  weeklyAvailability: ProfileAvailability | null
}

type DashboardTask = {
  id: string
  title: string
  subject: string
  topic: string
  studentName: string
  status: TutoringTaskStatus
  dueAt: string
  completionNote: string
  priority: 'low' | 'medium' | 'high'
  resourceTitles: string[]
}

type DashboardFeedback = {
  id: string
  taskId: string
  taskTitle: string
  studentName: string
  reviewerName: string
  score: number | null
  comments: string
  nextAction: string
  weakTopics: string[]
  reviewedAt: string
}

type DashboardStudent = {
  id: string
  initials: string
  name: string
  grade: string
  subject: string
  status: 'Improving' | 'Stable' | 'Declining'
  progress: number
  nextSession: string
  recap: string
  note: string
}

type DashboardMessage = {
  id: string
  studentName: string
  channel: 'Parent' | 'Tutor' | 'Student'
  subject: string
  lastMessage: string
  detail: string
  updatedAt: string
  unread: boolean
}

type DashboardWorkspace = {
  user?: {
    name: string
    role: string
    plan: string
  }
  students?: DashboardStudent[]
  tasks?: DashboardTask[]
  feedback?: DashboardFeedback[]
  messages?: DashboardMessage[]
  metrics?: {
    completionRate: number
    submittedOnTimeRate: number
    avgScore: number
    reviewLatencyHours: number
    openTasks: number
    dueThisWeek: number
    weakTopicFrequency: Array<{ label: string; count: number }>
    recentActivity: Array<{ label: string; detail: string; tone: 'green' | 'amber' | 'red' }>
  }
  availability?: {
    weekly: Record<string, 'open' | 'busy'>
    blockedDates: string[]
  }
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function isStaffRole(role?: string | null) {
  const normalized = (role || '').trim().toUpperCase()
  return normalized === 'TUTOR' || normalized === 'ADMIN' || normalized === 'OWNER'
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function monthGrid(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const startDay = first.getDay()
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: Array<Date | null> = []

  for (let index = 0; index < startDay; index += 1) cells.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(month.getFullYear(), month.getMonth(), day))
  while (cells.length % 7 !== 0) cells.push(null)

  return cells
}

function formatDate(value?: string | null) {
  if (!value) return 'TBD'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'TBD'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function countOpenDays(weekly: Record<string, 'open' | 'busy'> | undefined) {
  return DAYS.filter((day) => weekly?.[day] === 'open').length
}

function sortByDueDate(left: DashboardTask, right: DashboardTask) {
  const leftDue = new Date(left.dueAt).getTime()
  const rightDue = new Date(right.dueAt).getTime()
  const leftSafe = Number.isNaN(leftDue) ? Number.POSITIVE_INFINITY : leftDue
  const rightSafe = Number.isNaN(rightDue) ? Number.POSITIVE_INFINITY : rightDue
  return leftSafe - rightSafe || left.studentName.localeCompare(right.studentName)
}

function sortByProgress(left: DashboardStudent, right: DashboardStudent) {
  const statusRank = (status: DashboardStudent['status']) => (status === 'Declining' ? 0 : status === 'Stable' ? 1 : 2)
  return statusRank(left.status) - statusRank(right.status) || left.progress - right.progress || left.name.localeCompare(right.name)
}

export default function DashboardPage() {
  const profileQuery = useQuery<DashboardProfile | null>({
    queryKey: ['dashboard-profile'],
    queryFn: async () => {
      const response = await fetch('/api/profile', { cache: 'no-store' })
      if (!response.ok) throw new Error('Unable to load profile')
      return response.json()
    },
    retry: false,
    refetchOnWindowFocus: false,
  })

  const workspaceQuery = useQuery<DashboardWorkspace | null>({
    queryKey: ['dashboard-workspace'],
    queryFn: async () => {
      const response = await fetch('/api/tutoring/workspace', { cache: 'no-store' })
      if (!response.ok) throw new Error('Unable to load workspace')
      return response.json()
    },
    retry: false,
    refetchOnWindowFocus: false,
  })

  if (profileQuery.isLoading || workspaceQuery.isLoading) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center bg-[#f8f5ef] px-6 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        <div className="flex items-center gap-3 rounded-[1.5rem] border border-slate-900/10 bg-white/90 px-5 py-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <Loader2 className="h-4 w-4 animate-spin text-[#9a5b00]" />
          <p className="text-sm font-medium">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  const profile = profileQuery.data
  const workspace = workspaceQuery.data

  const role = (profile?.role || workspace?.user?.role || '').toUpperCase()
  const staffMode = isStaffRole(role)
  const name = profile?.name || workspace?.user?.name || 'there'
  const weekly = profile?.weeklyAvailability?.weekly || workspace?.availability?.weekly || {}
  const blockedDates = profile?.weeklyAvailability?.blockedDates || workspace?.availability?.blockedDates || []
  const openDays = countOpenDays(weekly)
  const todayIso = toIsoDate(new Date())
  const futureBlockedDates = blockedDates.filter((value) => value >= todayIso)
  const currentMonth = new Date()
  const subjects = profile?.subjects || []
  const targets = profile?.targetUniversities || []
  const interests = profile?.careerInterests || []
  const profileSignals = [
    Boolean(profile?.curriculum),
    Boolean(profile?.gradeLevel),
    Boolean(profile?.intendedMajor),
    subjects.length > 0,
    targets.length > 0,
    openDays > 0,
  ].filter(Boolean).length

  const metrics = workspace?.metrics || {
    completionRate: 0,
    submittedOnTimeRate: 0,
    avgScore: 0,
    reviewLatencyHours: 0,
    openTasks: 0,
    dueThisWeek: 0,
    weakTopicFrequency: [],
    recentActivity: [],
  }

  const topTasks = [...(workspace?.tasks || [])].sort(sortByDueDate).slice(0, 4)
  const watchlist = [...(workspace?.students || [])].sort(sortByProgress).slice(0, 4)
  const feedbackItems = [...(workspace?.feedback || [])].slice(0, 3)
  const activityFeed = metrics.recentActivity || []
  const messages = [...(workspace?.messages || [])].slice(0, 3)
  const weakTopics = metrics.weakTopicFrequency?.slice(0, 4) || []
  const latestTask = topTasks[0] || null

  const quickActions = [
    { href: '/student-dashboard', label: 'Student dashboard', desc: 'Open the simpler live view.', icon: FileText },
    { href: '/settings', label: 'Profile settings', desc: 'Update subjects, targets, and availability.', icon: SettingsIcon },
    { href: '#tasks', label: 'Jump to tasks', desc: 'See what is due next.', icon: Clock3 },
    { href: '#feedback', label: 'Jump to feedback', desc: 'Read the latest review notes.', icon: Sparkles },
    { href: '#profile', label: 'Jump to profile', desc: 'Check curriculum, interests, and targets.', icon: Users },
    { href: '#availability', label: 'Jump to schedule', desc: 'Open days and blocked dates.', icon: CalendarClock },
    { href: '#activity', label: 'Jump to activity', desc: 'Recent changes and messages.', icon: MessageSquare },
    { href: '/home', label: 'Home', desc: 'Return to the public product page.', icon: BookOpen },
  ] as const

  const heroAction = staffMode
    ? { href: '/tutor-dashboard', label: 'Open tutor workspace' }
    : { href: latestTask ? `/student-dashboard/tasks/${latestTask.id}` : '/student-dashboard', label: 'Open latest task' }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 text-slate-950 dark:text-white sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Execution overview
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Welcome back, {name}. This view pulls together the current tutoring loop, profile context, priorities, feedback, and the next follow-up.
            </p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
              <Link
                href={heroAction.href}
                className="inline-flex items-center gap-2 text-slate-950 transition-colors hover:text-[#9a5b00] dark:text-white dark:hover:text-[#f2c06d]"
              >
                {heroAction.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/settings" className="inline-flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
                Edit profile
                <SettingsIcon className="h-4 w-4" />
              </Link>
              <Link href="/home" className="inline-flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
                Product home
                <BookOpen className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[32rem]">
            {[
              { label: 'Completion', value: `${Math.round(metrics.completionRate * 100)}%`, note: 'Tasks closed or reviewed' },
              { label: 'On time', value: `${Math.round(metrics.submittedOnTimeRate * 100)}%`, note: 'Submissions before deadline' },
              { label: 'Average score', value: `${Math.round(metrics.avgScore)}/100`, note: 'Latest tutor reviews' },
              { label: 'Review latency', value: `${metrics.reviewLatencyHours.toFixed(1)}h`, note: 'Submission to review' },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{item.value}</p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tasks" className="grid gap-4 lg:grid-cols-[1.08fr_.92fr]">
        <article className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10 dark:border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2c06d]">Priority queue</p>
              <h2 className="mt-2 text-2xl font-semibold">What needs attention next</h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/60">Open tasks</p>
              <p className="text-2xl font-semibold text-white">{metrics.openTasks}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {topTasks.length ? (
              topTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/student-dashboard/tasks/${task.id}`}
                  className="block rounded-[1.5rem] border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-white">{task.title}</p>
                      <p className="mt-1 text-sm text-white/65">
                        {task.studentName} · {task.subject} · {task.topic}
                      </p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${taskStatusClasses(task.status)}`}>
                      {taskStatusLabel(task.status)}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/70">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                      Due {formatDate(task.dueAt)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                      {task.priority.toUpperCase()} priority
                    </span>
                    {task.resourceTitles[0] ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                        {task.resourceTitles.length} resources
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-3 text-sm leading-6 text-white/75">{task.completionNote}</p>
                </Link>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-sm text-white/70">
                No open tasks yet. Once work is assigned, the queue will appear here.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">Watchlist</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Students to keep an eye on</h2>
            </div>
            <Link href="/student-dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
              View student dashboard
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {watchlist.length ? (
              watchlist.map((student) => (
                <div key={student.id} className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor:
                          student.status === 'Declining'
                            ? '#fee2e2'
                            : student.status === 'Improving'
                              ? '#dcfce7'
                              : '#fef3c7',
                        color:
                          student.status === 'Declining'
                            ? '#b91c1c'
                            : student.status === 'Improving'
                              ? '#166534'
                              : '#92400e',
                      }}
                    >
                      {student.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950 dark:text-white">{student.name}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {student.subject} · {student.grade}
                          </p>
                        </div>
                        <span className="rounded-full border border-slate-900/10 bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                          {progressLabel(student.status)}
                        </span>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                        <div className="h-full rounded-full" style={{ width: `${student.progress}%`, backgroundColor: progressColor(student.progress) }} />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{student.progress}% progress</span>
                        <span>Next session {student.nextSession}</span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{student.recap}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                No students are in the watchlist yet.
              </div>
            )}
          </div>
        </article>
      </section>

      <section id="feedback" className="grid gap-4 lg:grid-cols-[1.08fr_.92fr]">
        <article className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">Latest feedback</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">What changed after the last review</h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">Due this week</p>
              <p className="text-2xl font-semibold text-slate-950 dark:text-white">{metrics.dueThisWeek}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {feedbackItems.length ? (
              feedbackItems.map((feedback) => (
                <Link
                  key={feedback.id}
                  href={`/student-dashboard/tasks/${feedback.taskId}`}
                  className="block rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 transition-colors hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-white">{feedback.taskTitle}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {feedback.studentName} · {feedback.reviewerName}
                      </p>
                    </div>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
                      {feedback.score ?? 'N/A'} / 100
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{feedback.comments}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">
                    <span className="font-semibold">Next:</span> {feedback.nextAction}
                  </p>
                </Link>
              ))
            ) : (
              <div className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                No feedback yet. The next review will appear here.
              </div>
            )}
          </div>
        </article>

        <article id="activity" className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10 dark:border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2c06d]">Recent activity</p>
              <h2 className="mt-2 text-2xl font-semibold">What moved in the workspace</h2>
            </div>
            <BarChart3 className="h-5 w-5 text-[#f2c06d]" />
          </div>

          <div className="mt-5 space-y-3">
            {activityFeed.length ? (
              activityFeed.map((item) => (
                <div key={`${item.label}-${item.detail}`} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <span
                      className={[
                        'rounded-full px-3 py-1 text-xs font-semibold',
                        item.tone === 'green'
                          ? 'bg-emerald-500/15 text-emerald-200'
                          : item.tone === 'amber'
                            ? 'bg-amber-500/15 text-amber-200'
                            : 'bg-rose-500/15 text-rose-200',
                      ].join(' ')}
                    >
                      {item.tone}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/75">{item.detail}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5 text-sm text-white/70">
                No activity yet.
              </div>
            )}
          </div>

          <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#f2c06d]" />
              <p className="text-sm font-semibold">Messages</p>
            </div>
            <div className="mt-4 space-y-3">
              {messages.length ? (
                messages.map((message) => (
                  <div key={message.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {message.studentName} · {message.subject}
                        </p>
                        <p className="text-xs uppercase tracking-[0.18em] text-white/45">{message.channel}</p>
                      </div>
                      <span className="text-xs text-white/55">{message.updatedAt}</span>
                    </div>
                    <p className="mt-2 text-sm text-white/75">{message.lastMessage}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/70">No messages queued.</p>
              )}
            </div>
          </div>

          {weakTopics.length ? (
            <div className="mt-5">
              <p className="text-sm font-semibold text-white">Weak topics</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/75">
                {weakTopics.map((topic) => (
                  <span key={topic.label} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                    {topic.label} · {topic.count}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </article>
      </section>

      <section id="profile" className="grid gap-4 lg:grid-cols-[1.08fr_.92fr]">
        <article className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">Profile snapshot</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">The current student context</h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">Signals</p>
              <p className="text-2xl font-semibold text-slate-950 dark:text-white">{profileSignals}/6</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ['Curriculum', profile?.curriculum || 'Not set'],
              ['Grade level', profile?.gradeLevel || 'Not set'],
              ['Intended major', profile?.intendedMajor || 'Not set'],
              ['GPA', profile?.gpa ? String(profile.gpa) : 'Not set'],
              ['SAT', profile?.satScore ? String(profile.satScore) : 'Not set'],
              ['Open days', `${openDays} this week`],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{value as string}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Subjects, targets, interests</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-700 dark:text-slate-200">
              {(subjects.length ? subjects : ['Add subjects']).map((item) => (
                <span key={item} className="rounded-full border border-slate-900/10 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                  {item}
                </span>
              ))}
              {(targets.length ? targets : ['Add target universities']).map((item) => (
                <span key={item} className="rounded-full border border-slate-900/10 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                  {item}
                </span>
              ))}
              {(interests.length ? interests : ['Add career interests']).map((item) => (
                <span key={item} className="rounded-full border border-slate-900/10 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </article>

        <article id="availability" className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10 dark:border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2c06d]">Schedule</p>
              <h2 className="mt-2 text-2xl font-semibold">Weekly availability and blocked dates</h2>
            </div>
            <CalendarClock className="h-5 w-5 text-[#f2c06d]" />
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {DAYS.map((day) => {
              const open = weekly?.[day] === 'open'

              return (
                <div
                  key={day}
                  className={[
                    'rounded-2xl border p-3',
                    open ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-white/10 bg-white/5',
                  ].join(' ')}
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">{day}</p>
                  <p className={['mt-2 text-sm font-semibold', open ? 'text-emerald-200' : 'text-white'].join(' ')}>
                    {open ? 'Open' : 'Busy'}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Monthly calendar</p>
              <p className="text-xs text-white/55">{futureBlockedDates.length} blocked date{futureBlockedDates.length === 1 ? '' : 's'}</p>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1 text-[10px] uppercase tracking-[0.2em] text-white/35">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={`${day}-${index}`} className="text-center">
                  {day}
                </div>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {monthGrid(currentMonth).map((date, index) => {
                if (!date) return <div key={index} className="h-8" />

                const iso = toIsoDate(date)
                const blocked = futureBlockedDates.includes(iso)
                const isToday = iso === todayIso

                return (
                  <div
                    key={iso}
                    className={[
                      'flex h-8 items-center justify-center rounded-md border text-xs',
                      blocked
                        ? 'border-amber-300 bg-amber-50 text-amber-800'
                        : isToday
                          ? 'border-[#f2c06d] bg-[#1f2937] text-[#f2c06d]'
                          : 'border-white/10 bg-white/5 text-white/75',
                    ].join(' ')}
                  >
                    {date.getDate()}
                  </div>
                )
              })}
            </div>
          </div>
        </article>
      </section>

      <section id="actions">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">Shortcuts</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Jump where the work lives</h2>
          </div>
          <p className="hidden text-sm text-slate-500 dark:text-slate-400 md:block">Mix of anchors and direct routes.</p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group rounded-[1.5rem] border border-slate-900/10 bg-white p-5 transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/5 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-center justify-between gap-3">
                <action.icon className="h-6 w-6 text-[#9a5b00]" />
                <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#9a5b00]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{action.label}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{action.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
