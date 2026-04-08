import { generateJson } from '@/lib/ai/provider'
import type {
  TutoringFeedback,
  TutoringStudent,
  TutoringSubmission,
  TutoringTask,
  TutoringTaskStatus,
} from './mock-data'

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
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

function formatStatus(status: TutoringTaskStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
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

function summarizeWindow(now = new Date()) {
  const end = new Date(now)
  const start = new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000)
  return {
    weekStart: start.toISOString(),
    weekEnd: end.toISOString(),
  }
}

function buildTaskDigest(tasks: TutoringTask[], submissions: TutoringSubmission[], feedback: TutoringFeedback[]) {
  return tasks.slice(0, 5).map((task) => {
    const latestSubmission = submissions.find((item) => item.taskId === task.id) ?? null
    const latestFeedback = feedback.find((item) => item.taskId === task.id) ?? null

    return {
      id: task.id,
      title: task.title,
      subject: task.subject,
      topic: task.topic,
      status: task.status,
      statusLabel: formatStatus(task.status),
      dueAt: task.dueAt || null,
      submittedAt: latestSubmission?.submittedAt || null,
      reviewedAt: latestFeedback?.reviewedAt || null,
      score: latestFeedback?.score ?? null,
      weakTopics: uniqueStrings([...(task.weakTopics || []), ...(latestFeedback?.weakTopics || [])]),
    }
  })
}

function buildDeterministicSummary(studentName: string, taskCount: number, completedCount: number, submittedOnTimeRate: number, avgScore: number, weakTopicFrequency: Array<{ label: string; count: number }>) {
  const topWeakTopic = weakTopicFrequency[0]

  if (!taskCount) {
    return `${studentName} does not have any active tutoring tasks in this window yet. Once assignments are added, the weekly report will track submissions, review speed, weak topics, and next steps.`
  }

  const progressLine = `${studentName} completed ${completedCount} of ${taskCount} active tasks with a ${submittedOnTimeRate}% on-time submission rate.`
  const scoreLine = avgScore > 0 ? `The current average review score is ${avgScore}%.` : 'No scored feedback has been recorded yet.'
  const topicLine = topWeakTopic ? `The strongest repeated focus area is ${topWeakTopic.label}.` : 'No repeated weak-topic pattern is recorded yet.'

  return `${progressLine} ${scoreLine} ${topicLine}`
}

export type WeeklyParentReportTask = {
  id: string
  title: string
  subject: string
  topic: string
  status: TutoringTaskStatus
  statusLabel: string
  dueAt: string | null
  submittedAt: string | null
  reviewedAt: string | null
  score: number | null
  weakTopics: string[]
}

export type WeeklyParentReport = {
  generatedAt: string
  window: {
    weekStart: string
    weekEnd: string
  }
  student: {
    id: string
    name: string
    gradeLevel: string
    curriculum: string
    parentNames: string[]
    tutorNames: string[]
  }
  headline: string
  summary: string
  strengths: string[]
  concerns: string[]
  nextSteps: string[]
  weakTopics: Array<{ label: string; count: number }>
  metrics: {
    taskCount: number
    completedCount: number
    submittedCount: number
    reviewedCount: number
    overdueCount: number
    completionRate: number
    submittedOnTimeRate: number
    avgScore: number
    reviewLatencyHours: number
    engagementConsistency: number
    scoreTrend: Array<{ label: string; value: number }>
  }
  taskDigest: WeeklyParentReportTask[]
  aiSummary?: string
}

export function buildWeeklyParentReport(params: {
  student: TutoringStudent
  parentNames: string[]
  tutorNames: string[]
  tasks: TutoringTask[]
  submissions: TutoringSubmission[]
  feedback: TutoringFeedback[]
  generatedAt?: string
  weekStart?: string
  weekEnd?: string
}): WeeklyParentReport {
  const generatedAt = params.generatedAt || new Date().toISOString()
  const window = params.weekStart && params.weekEnd
    ? { weekStart: params.weekStart, weekEnd: params.weekEnd }
    : summarizeWindow(new Date(generatedAt))

  const taskCount = params.tasks.length
  const completedCount = params.tasks.filter((task) => task.status === 'completed' || task.status === 'reviewed').length
  const submittedCount = params.submissions.length
  const reviewedCount = params.feedback.length
  const overdueCount = params.tasks.filter((task) => task.status === 'overdue').length

  const submittedOnTimeCount = params.submissions.filter((submission) => {
    const task = params.tasks.find((item) => item.id === submission.taskId)
    if (!task?.dueAt) return true
    const dueAt = new Date(task.dueAt)
    const submittedAt = new Date(submission.submittedAt)
    if (Number.isNaN(dueAt.getTime()) || Number.isNaN(submittedAt.getTime())) return true
    return submittedAt <= dueAt
  }).length

  const reviewLatencyHours = params.feedback.length
    ? average(
        params.feedback.map((item) => {
          const submission = params.submissions.find((candidate) => candidate.id === item.submissionId) ?? params.submissions.find((candidate) => candidate.taskId === item.taskId)
          if (!submission) return 0
          const reviewedAt = new Date(item.reviewedAt).getTime()
          const submittedAt = new Date(submission.submittedAt).getTime()
          if (Number.isNaN(reviewedAt) || Number.isNaN(submittedAt)) return 0
          return Math.max(0, (reviewedAt - submittedAt) / 3_600_000)
        }),
      )
    : 0

  const weakTopicFrequency = countWeakTopics(params.feedback, params.tasks)
  const strengths = uniqueStrings(params.feedback.flatMap((item) => item.strengths))
  const weaknesses = uniqueStrings(
    params.feedback.flatMap((item) => [
      ...item.weaknesses,
      ...(item.weakTopics || []).map((topic) => `Weak topic: ${topic}`),
    ]),
  )
  const nextSteps = uniqueStrings([
    ...params.feedback.map((item) => item.nextAction),
    ...params.tasks.filter((task) => task.status === 'assigned' || task.status === 'overdue').map((task) => `Complete ${task.title}`),
  ]).slice(0, 5)
  const scoreTrend = params.feedback
    .slice()
    .sort((left, right) => new Date(left.reviewedAt).getTime() - new Date(right.reviewedAt).getTime())
    .slice(-4)
    .map((item, index) => ({
      label: `Review ${index + 1}`,
      value: item.score ?? 0,
    }))

  const completionRate = taskCount ? clampPercent((completedCount / taskCount) * 100) : 0
  const submittedOnTimeRate = submittedCount ? clampPercent((submittedOnTimeCount / submittedCount) * 100) : 0
  const avgScore = params.feedback.length ? clampPercent(average(params.feedback.map((item) => item.score ?? 0))) : 0
  const engagementConsistency = clampPercent(Math.min(100, ((submittedCount + reviewedCount) / Math.max(1, taskCount)) * 32))

  const headline =
    overdueCount > 0 || avgScore < 60
      ? 'Needs attention this week'
      : completionRate >= 75 && submittedOnTimeRate >= 75
        ? 'On track this week'
        : 'Steady progress with a few gaps'

  const summary = buildDeterministicSummary(params.student.name, taskCount, completedCount, submittedOnTimeRate, avgScore, weakTopicFrequency)

  return {
    generatedAt,
    window,
    student: {
      id: params.student.id,
      name: params.student.name,
      gradeLevel: params.student.grade,
      curriculum: params.student.curriculum,
      parentNames: params.parentNames,
      tutorNames: params.tutorNames,
    },
    headline,
    summary,
    strengths: strengths.length ? strengths : ['Consistent attendance', 'Open to feedback'],
    concerns: weaknesses.length ? weaknesses : ['No major concerns logged yet'],
    nextSteps: nextSteps.length ? nextSteps : ['Keep the weekly task cadence moving', 'Capture the next submission clearly'],
    weakTopics: weakTopicFrequency,
    metrics: {
      taskCount,
      completedCount,
      submittedCount,
      reviewedCount,
      overdueCount,
      completionRate,
      submittedOnTimeRate,
      avgScore,
      reviewLatencyHours: Number(reviewLatencyHours.toFixed(1)),
      engagementConsistency,
      scoreTrend,
    },
    taskDigest: buildTaskDigest(params.tasks, params.submissions, params.feedback),
  }
}

export async function generateWeeklyParentAiSummary(report: WeeklyParentReport): Promise<string | null> {
  try {
    const result = await generateJson<{ summary: string }>({
      system:
        'You are a tutoring operations assistant. Rewrite tutoring reports into concise, reassuring parent language. Return valid JSON only.',
      messages: [
        {
          role: 'user',
          content: `Rewrite this weekly tutoring report for a parent. Keep it concise, specific, and reassuring. Avoid jargon.

Student: ${report.student.name}
Grade: ${report.student.gradeLevel}
Curriculum: ${report.student.curriculum}
Headline: ${report.headline}
Tasks: ${report.metrics.taskCount}
Completed: ${report.metrics.completedCount}
Submitted on time: ${report.metrics.submittedOnTimeRate}%
Average score: ${report.metrics.avgScore}%
Review latency: ${report.metrics.reviewLatencyHours} hours
Weak topics: ${report.weakTopics.map((topic) => `${topic.label} (${topic.count})`).join(', ') || 'None'}
Strengths: ${report.strengths.join('; ')}
Concerns: ${report.concerns.join('; ')}
Next steps: ${report.nextSteps.join('; ')}

Return JSON:
{
  "summary": "A short parent-ready summary that highlights progress, one concern, and the next step."
}`,
        },
      ],
      maxTokens: 400,
      temperature: 0.3,
    })

    const summary = result.summary.trim()
    return summary || null
  } catch {
    return null
  }
}
