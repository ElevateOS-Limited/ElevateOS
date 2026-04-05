import { prisma, DATABASE_URL_CONFIGURED } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { buildTutoringDemoWorkspace, formatDateLabel, initialsForName, type TutoringAccessTier, type TutoringFeedback, type TutoringMetrics, type TutoringResource, type TutoringStudent, type TutoringSubmission, type TutoringTask, type TutoringTaskStatus, type TutoringWorkspaceSnapshot } from './mock-data'

type WorkspaceSession = Awaited<ReturnType<typeof getSessionOrDemo>>

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function formatTaskStatus(status: string) {
  return status.toLowerCase() as TutoringTaskStatus
}

function getTaskStatus(task: { status: string; dueAt: Date | string | null; completedAt: Date | string | null }) {
  const normalizedStatus = formatTaskStatus(task.status)

  if (normalizedStatus === 'completed' || normalizedStatus === 'reviewed') return normalizedStatus
  const dueAt = task.dueAt ? new Date(task.dueAt) : null
  if (dueAt && !Number.isNaN(dueAt.getTime()) && dueAt < new Date() && !task.completedAt) {
    return 'overdue'
  }
  return normalizedStatus || 'assigned'
}

function toDateString(value?: Date | string | null) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function mapAccessTier(value?: string | null): TutoringAccessTier {
  switch ((value || '').toLowerCase()) {
    case 'ai_premium':
      return 'ai_premium'
    case 'tutoring_premium':
      return 'tutoring_premium'
    case 'tutor_only':
      return 'tutor_only'
    default:
      return 'free'
  }
}

function average(values: number[]) {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function uniqueStrings(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter((value): value is string => Boolean(value)),
    ),
  )
}

function countWeakTopics(feedback: TutoringFeedback[], tasks: TutoringTask[]) {
  const counts = new Map<string, number>()

  for (const item of feedback) {
    for (const topic of item.weakTopics || []) {
      const key = topic.trim()
      if (!key) continue
      counts.set(key, (counts.get(key) || 0) + 1)
    }
  }

  for (const task of tasks) {
    for (const topic of task.weakTopics || []) {
      const key = topic.trim()
      if (!key) continue
      counts.set(key, (counts.get(key) || 0) + 1)
    }
  }

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
    .slice(0, 6)
}

function buildMetrics(tasks: TutoringTask[], submissions: TutoringSubmission[], feedback: TutoringFeedback[]): TutoringMetrics {
  const totalTasks = tasks.length || 1
  const completedTasks = tasks.filter((task) => task.status === 'completed' || task.status === 'reviewed').length
  const dueThisWeek = tasks.filter((task) => {
    if (!task.dueAt) return false
    const dueAt = new Date(task.dueAt)
    if (Number.isNaN(dueAt.getTime())) return false
    const now = new Date()
    const weekAway = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return dueAt >= now && dueAt <= weekAway
  }).length

  const submittedOnTime = submissions.filter((submission) => {
    const task = tasks.find((item) => item.id === submission.taskId)
    if (!task?.dueAt) return true
    const dueAt = new Date(task.dueAt)
    const submittedAt = new Date(submission.submittedAt)
    if (Number.isNaN(dueAt.getTime()) || Number.isNaN(submittedAt.getTime())) return true
    return submittedAt <= dueAt
  }).length

  const reviewLatencyHours = feedback.length
    ? average(
        feedback.map((item) => {
          const submission = submissions.find((candidate) => candidate.id === item.submissionId) ?? submissions.find((candidate) => candidate.taskId === item.taskId)
          if (!submission) return 0
          const reviewedAt = new Date(item.reviewedAt).getTime()
          const submittedAt = new Date(submission.submittedAt).getTime()
          if (!reviewedAt || !submittedAt) return 0
          return Math.max(0, (reviewedAt - submittedAt) / 3_600_000)
        }),
      )
    : 0

  const scoreTrendSource = [...feedback]
    .sort((left, right) => new Date(left.reviewedAt).getTime() - new Date(right.reviewedAt).getTime())
    .slice(-4)

  return {
    completionRate: clampPercent((completedTasks / totalTasks) * 100),
    submittedOnTimeRate: clampPercent((submittedOnTime / Math.max(1, submissions.length)) * 100),
    avgScore: clampPercent(average(feedback.map((item) => item.score ?? 0))),
    reviewLatencyHours: Number(reviewLatencyHours.toFixed(1)),
    engagementConsistency: clampPercent(Math.min(100, ((submissions.length + feedback.length) / Math.max(1, tasks.length)) * 32)),
    openTasks: tasks.filter((task) => task.status === 'assigned' || task.status === 'submitted' || task.status === 'overdue').length,
    dueThisWeek,
    weakTopicFrequency: countWeakTopics(feedback, tasks),
    scoreTrend: scoreTrendSource.length
      ? scoreTrendSource.map((item, index) => ({ label: `Review ${index + 1}`, value: item.score ?? 0 }))
      : [{ label: 'Review 1', value: 0 }],
    weeklyCompletion: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
      const completed = tasks.filter((task) => {
        const dueAt = task.dueAt ? new Date(task.dueAt) : null
        if (!dueAt || Number.isNaN(dueAt.getTime())) return false
        return dueAt.toLocaleDateString('en-US', { weekday: 'short' }).startsWith(day)
          && (task.status === 'completed' || task.status === 'reviewed')
      }).length
      const assigned = tasks.filter((task) => {
        const dueAt = task.dueAt ? new Date(task.dueAt) : null
        if (!dueAt || Number.isNaN(dueAt.getTime())) return false
        return dueAt.toLocaleDateString('en-US', { weekday: 'short' }).startsWith(day)
      }).length
      return { label: day, completed, assigned }
    }),
    recentActivity: [
      ...feedback.slice(0, 2).map((item) => ({
        label: 'Reviewed',
        detail: `${item.studentName} - ${item.taskTitle} scored ${item.score ?? 0}.`,
        tone: 'green' as const,
      })),
      ...tasks
        .filter((task) => task.status === 'overdue')
        .slice(0, 2)
        .map((task) => ({
          label: 'Overdue',
          detail: `${task.studentName} still needs ${task.title}.`,
          tone: 'amber' as const,
        })),
    ].slice(0, 3),
  }
}

function latestFeedbackForTask(taskId: string, feedback: TutoringFeedback[]) {
  return [...feedback].find((item) => item.taskId === taskId) ?? null
}

function buildStudentRecords(params: {
  users: Array<{
    id: string
    name: string | null
    plan: string
    role: string
    studentProfile: {
      gradeLevel: string | null
      curriculum: string | null
      schoolName: string | null
      weeklyGoal: string | null
      notes: string | null
    } | null
    tutoringStudentLinks: Array<{ tutorUserId: string }>
    tutoringParentLinksAsStudent: Array<{ parentUserId: string }>
  }>
  tasks: TutoringTask[]
  submissions: TutoringSubmission[]
  feedback: TutoringFeedback[]
  tutorNamesByStudentId: Map<string, string[]>
  parentNamesByStudentId: Map<string, string[]>
}) {
  return params.users.map<TutoringStudent>((user) => {
    const studentTasks = params.tasks.filter((task) => task.studentId === user.id)
    const studentSubmissions = params.submissions.filter((submission) => submission.studentId === user.id)
    const studentFeedback = params.feedback.filter((item) => item.studentId === user.id)
    const latestTask = [...studentTasks].sort((left, right) => new Date(right.dueAt || 0).getTime() - new Date(left.dueAt || 0).getTime())[0]
    const latestFeedback = studentFeedback[0] ?? latestFeedbackForTask(latestTask?.id || '', params.feedback)
    const nextDeadline = [...studentTasks]
      .filter((task) => task.dueAt)
      .sort((left, right) => new Date(left.dueAt || '').getTime() - new Date(right.dueAt || '').getTime())[0]

    const completionRate = studentTasks.length
      ? studentTasks.filter((task) => task.status === 'completed' || task.status === 'reviewed').length / studentTasks.length
      : 0

    const avgScore = studentFeedback.length ? average(studentFeedback.map((item) => item.score ?? 0)) : latestFeedback?.score ?? 0
    const progress = clampPercent((completionRate * 60) + (avgScore * 0.4))
    const overdueTasks = studentTasks.filter((task) => task.status === 'overdue').length

    return {
      id: user.id,
      initials: initialsForName(user.name || 'Student'),
      name: user.name || 'Student',
      grade: user.studentProfile?.gradeLevel || 'Grade TBD',
      subject: latestTask?.subject || user.studentProfile?.curriculum || 'General',
      curriculum: user.studentProfile?.curriculum || 'IB',
      plan: (user.plan as TutoringStudent['plan']) || 'FREE',
      sessions: studentTasks.length + studentSubmissions.length,
      status: overdueTasks > 1 || progress < 55 ? 'Declining' : progress >= 75 ? 'Improving' : 'Stable',
      progress,
      nextSession: nextDeadline ? formatDateLabel(nextDeadline.dueAt || '') : 'TBD',
      nextDeadline: nextDeadline?.dueAt || '',
      recap: latestFeedback?.comments || latestTask?.completionNote || 'No feedback yet.',
      note: latestFeedback?.nextAction || latestTask?.instructions || 'No next action yet.',
      tutorSummary: latestFeedback?.aiSummary || user.studentProfile?.weeklyGoal || 'Tutor summary pending.',
      parentSummary: latestFeedback?.comments || user.studentProfile?.notes || 'Parent summary pending.',
      tutorNames: params.tutorNamesByStudentId.get(user.id) || [],
      parentNames: params.parentNamesByStudentId.get(user.id) || [],
      weakTopics: uniqueStrings([...(latestFeedback?.weakTopics || []), ...(latestTask?.weakTopics || [])]).slice(0, 4),
      todayTasks: studentTasks.filter((task) => ['assigned', 'submitted', 'overdue'].includes(task.status)).slice(0, 3).map((task) => task.title),
      completionRate: Number(completionRate.toFixed(2)),
      overdueTasks,
    }
  })
}

function mapTasks(tasks: Array<any>, feedback: TutoringFeedback[], submissions: TutoringSubmission[]): TutoringTask[] {
  return tasks.map((task) => {
    const latestFeedback = [...feedback].find((item) => item.taskId === task.id) ?? null
    const latestSubmission = [...submissions].find((item) => item.taskId === task.id) ?? null

    return {
      id: task.id,
      studentId: task.studentUserId,
      studentName: task.student?.name || 'Student',
      subject: task.subject,
      topic: task.topic,
      title: task.title,
      instructions: task.instructions,
      status: getTaskStatus(task),
      dueAt: task.dueAt ? task.dueAt.toISOString() : '',
      submittedAt: latestSubmission?.submittedAt || undefined,
      reviewedAt: latestFeedback?.reviewedAt || undefined,
      priority: (task.priority || 'medium').toLowerCase() as TutoringTask['priority'],
      assignedBy: task.assignedBy?.name || 'Tutor',
      resourceTitles: Array.isArray(task.resources) ? task.resources.map((resource: any) => resource.title).filter(Boolean) : [],
      weakTopics: uniqueStrings([...(latestFeedback?.weakTopics || []), ...(task.weakTopics || [])]),
      completionNote: task.completionNote || latestFeedback?.nextAction || 'Awaiting next step.',
    }
  })
}

function mapSubmissions(submissions: Array<any>): TutoringSubmission[] {
  return submissions.map((submission) => ({
    id: submission.id,
    taskId: submission.taskId,
    studentId: submission.studentUserId,
    studentName: submission.student?.name || 'Student',
    taskTitle: submission.task?.title || 'Task',
    submittedAt: submission.submittedAt.toISOString(),
    textResponse: submission.textResponse || '',
    fileName: submission.fileName || undefined,
    fileMimeType: submission.fileMimeType || undefined,
    externalLink: submission.externalLink || undefined,
    status: submission.feedback?.length ? 'reviewed' : 'submitted',
  }))
}

function mapFeedback(feedback: Array<any>): TutoringFeedback[] {
  return feedback.map((item) => ({
    id: item.id,
    taskId: item.taskId,
    submissionId: item.submissionId || undefined,
    studentId: item.task?.studentUserId || item.submission?.studentUserId || item.reviewerUserId,
    studentName: item.task?.student?.name || item.submission?.student?.name || 'Student',
    taskTitle: item.task?.title || item.submission?.task?.title || 'Task',
    reviewerName: item.reviewer?.name || 'Tutor',
    score: item.score ?? 0,
    comments: item.comments || '',
    strengths: Array.isArray(item.strengths) ? item.strengths : [],
    weaknesses: Array.isArray(item.weaknesses) ? item.weaknesses : [],
    nextAction: item.nextAction || '',
    weakTopics: Array.isArray(item.weakTopics) ? item.weakTopics : [],
    aiSummary: item.aiSummary || undefined,
    reviewedAt: item.reviewedAt.toISOString(),
  }))
}

function mapResources(resources: Array<any>): TutoringResource[] {
  return resources.map((resource) => ({
    id: resource.id,
    title: resource.title,
    subject: resource.subject,
    topic: resource.topic,
    kind: (resource.kind || 'TUTOR_RESOURCE').toLowerCase() as TutoringResource['kind'],
    accessTier: mapAccessTier(resource.accessTier),
    summary: resource.summary || '',
    fileName: resource.fileName || undefined,
    fileMimeType: resource.fileMimeType || undefined,
    externalLink: resource.externalLink || undefined,
    uploadedBy: resource.uploadedBy?.name || 'Tutor',
    taskId: resource.taskId || undefined,
    studentId: resource.studentUserId || undefined,
  }))
}

async function queryWorkspaceData() {
  const [taskRows, submissionRows, feedbackRows, resourceRows, studentTutorLinks, studentParentLinks, studentUsers] = await Promise.all([
    prisma.tutoringTask.findMany({
      orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
      include: {
        student: {
          select: {
            id: true,
            name: true,
            plan: true,
            role: true,
            studentProfile: {
              select: {
                gradeLevel: true,
                curriculum: true,
                schoolName: true,
                weeklyGoal: true,
                notes: true,
              },
            },
            tutoringStudentLinks: {
              select: {
                tutorUserId: true,
              },
            },
            tutoringParentLinksAsStudent: {
              select: {
                parentUserId: true,
              },
            },
          },
        },
        assignedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        submissions: {
          orderBy: { submittedAt: 'desc' },
          include: {
            feedback: {
              select: { id: true },
            },
            student: {
              select: {
                id: true,
                name: true,
              },
            },
            task: {
              select: {
                id: true,
                title: true,
                studentUserId: true,
              },
            },
          },
        },
        feedback: {
          orderBy: { reviewedAt: 'desc' },
          include: {
            submission: {
              include: {
                student: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                task: {
                  select: {
                    id: true,
                    title: true,
                    studentUserId: true,
                  },
                },
              },
            },
            reviewer: {
              select: {
                id: true,
                name: true,
              },
            },
            task: {
              include: {
                student: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        resources: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.tutoringSubmission.findMany({
      orderBy: { submittedAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
        submittedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            studentUserId: true,
          },
        },
        feedback: {
          select: {
            id: true,
          },
        },
      },
    }),
    prisma.tutoringFeedback.findMany({
      orderBy: { reviewedAt: 'desc' },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
        submission: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
              },
            },
            task: {
              select: {
                id: true,
                title: true,
                studentUserId: true,
              },
            },
          },
        },
        task: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.tutoringResource.findMany({
      orderBy: [{ createdAt: 'desc' }],
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.tutoringStudentTutor.findMany({
      include: {
        student: {
          select: { id: true, name: true },
        },
        tutor: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.tutoringStudentParent.findMany({
      include: {
        student: {
          select: { id: true, name: true },
        },
        parent: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { tutoringTasksOwned: { some: {} } },
          { studentProfile: { isNot: null } },
        ],
      },
      select: {
        id: true,
        name: true,
        role: true,
        plan: true,
        studentProfile: {
          select: {
            gradeLevel: true,
            curriculum: true,
            schoolName: true,
            weeklyGoal: true,
            notes: true,
          },
        },
        tutoringStudentLinks: {
          select: {
            tutorUserId: true,
          },
        },
        tutoringParentLinksAsStudent: {
          select: {
            parentUserId: true,
          },
        },
      },
    }),
  ])

  return {
    taskRows,
    submissionRows,
    feedbackRows,
    resourceRows,
    studentTutorLinks,
    studentParentLinks,
    studentUsers,
  }
}

export async function getTutoringWorkspaceSnapshot(session: WorkspaceSession): Promise<TutoringWorkspaceSnapshot> {
  if (!session?.user?.id || !DATABASE_URL_CONFIGURED) {
    return buildTutoringDemoWorkspace({
      user: {
        name: session?.user?.name || 'Demo Tutor',
        role: session?.user?.role || 'TUTOR',
        plan: session?.user?.plan || 'ELITE',
      },
    })
  }

  try {
    const { taskRows, submissionRows, feedbackRows, resourceRows, studentTutorLinks, studentParentLinks, studentUsers } = await queryWorkspaceData()

    if (!taskRows.length && !submissionRows.length && !feedbackRows.length && !resourceRows.length) {
      return buildTutoringDemoWorkspace({
        user: {
          name: session.user.name || 'Demo Tutor',
          role: session.user.role || 'TUTOR',
          plan: session.user.plan || 'ELITE',
        },
      })
    }

    const tutorNamesByStudentId = new Map<string, string[]>()
    for (const link of studentTutorLinks) {
      const current = tutorNamesByStudentId.get(link.studentUserId) || []
      if (link.tutor?.name) current.push(link.tutor.name)
      tutorNamesByStudentId.set(link.studentUserId, uniqueStrings(current))
    }

    const parentNamesByStudentId = new Map<string, string[]>()
    for (const link of studentParentLinks) {
      const current = parentNamesByStudentId.get(link.studentUserId) || []
      if (link.parent?.name) current.push(link.parent.name)
      parentNamesByStudentId.set(link.studentUserId, uniqueStrings(current))
    }

    const feedback = mapFeedback(feedbackRows)
    const submissions = mapSubmissions(submissionRows)
    const tasks = mapTasks(taskRows, feedback, submissions)
    const resources = mapResources(resourceRows)
    const students = buildStudentRecords({
      users: studentUsers,
      tasks,
      submissions,
      feedback,
      tutorNamesByStudentId,
      parentNamesByStudentId,
    })

    return {
      generatedAt: new Date().toISOString(),
      user: {
        name: session.user.name || 'Tutor',
        role: session.user.role || 'TUTOR',
        plan: session.user.plan || 'ELITE',
      },
      students,
      tasks,
      submissions,
      feedback,
      resources,
      messages: buildTutoringDemoWorkspace().messages,
      metrics: buildMetrics(tasks, submissions, feedback),
      availability: buildTutoringDemoWorkspace().availability,
    }
  } catch (error) {
    console.warn('tutoring_workspace_snapshot_failed', error)
    return buildTutoringDemoWorkspace({
      user: {
        name: session.user.name || 'Demo Tutor',
        role: session.user.role || 'TUTOR',
        plan: session.user.plan || 'ELITE',
      },
    })
  }
}
