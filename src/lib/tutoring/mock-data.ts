import { type LucideIcon, CalendarClock, FileText, LayoutDashboard, Library, MessageSquare, Settings, Sparkles, TrendingUp, Users } from 'lucide-react'

export type TutoringNavId =
  | 'dashboard'
  | 'students'
  | 'tasks'
  | 'feedback'
  | 'reports'
  | 'progress'
  | 'resources'
  | 'schedule'
  | 'communication'
  | 'settings'

export type TutoringPov = 'Student POV' | 'Tutor POV' | 'Parent POV'
export type TutoringTaskStatus = 'assigned' | 'submitted' | 'reviewed' | 'overdue' | 'completed'
export type TutoringResourceKind = 'lesson_file' | 'question_bank' | 'model_answer' | 'tutor_resource'
export type TutoringAccessTier = 'free' | 'ai_premium' | 'tutoring_premium' | 'tutor_only'
export type TutoringStatusTone = 'green' | 'amber' | 'red'

export type TutoringStudent = {
  id: string
  initials: string
  name: string
  grade: string
  subject: string
  curriculum: string
  plan: 'FREE' | 'PRO' | 'ELITE'
  sessions: number
  status: 'Improving' | 'Stable' | 'Declining'
  progress: number
  nextSession: string
  nextDeadline: string
  recap: string
  note: string
  tutorSummary: string
  parentSummary: string
  tutorNames: string[]
  parentNames: string[]
  weakTopics: string[]
  todayTasks: string[]
  completionRate: number
  overdueTasks: number
}

export type Student = TutoringStudent
export type StudentStatus = TutoringStudent['status']
export type FilterKey = 'all' | 'improving' | 'stable' | 'declining'
export type SortKey = 'name' | 'progress' | 'sessions' | 'next'

export type TutoringTask = {
  id: string
  studentId: string
  studentName: string
  subject: string
  topic: string
  title: string
  instructions: string
  status: TutoringTaskStatus
  dueAt: string
  submittedAt?: string
  reviewedAt?: string
  priority: 'low' | 'medium' | 'high'
  assignedBy: string
  resourceTitles: string[]
  weakTopics: string[]
  completionNote: string
}

export type TutoringSubmission = {
  id: string
  taskId: string
  studentId: string
  studentName: string
  taskTitle: string
  submittedAt: string
  textResponse: string
  fileName?: string
  fileMimeType?: string
  externalLink?: string
  status: 'submitted' | 'reviewed'
}

export type TutoringFeedback = {
  id: string
  taskId: string
  submissionId?: string
  studentId: string
  studentName: string
  taskTitle: string
  reviewerName: string
  score: number
  comments: string
  strengths: string[]
  weaknesses: string[]
  nextAction: string
  weakTopics: string[]
  aiSummary?: string
  reviewedAt: string
}

export type TutoringResource = {
  id: string
  title: string
  subject: string
  topic: string
  kind: TutoringResourceKind
  accessTier: TutoringAccessTier
  summary: string
  fileName?: string
  externalLink?: string
  uploadedBy: string
  taskId?: string
  studentId?: string
}

export type TutoringMessage = {
  id: string
  studentId: string
  studentName: string
  channel: 'Parent' | 'Tutor' | 'Student'
  subject: string
  lastMessage: string
  detail: string
  updatedAt: string
  unread: boolean
}

export type Thread = TutoringMessage

export type TutoringMetrics = {
  completionRate: number
  submittedOnTimeRate: number
  avgScore: number
  reviewLatencyHours: number
  engagementConsistency: number
  openTasks: number
  dueThisWeek: number
  weakTopicFrequency: Array<{ label: string; count: number }>
  scoreTrend: Array<{ label: string; value: number }>
  weeklyCompletion: Array<{ label: string; completed: number; assigned: number }>
  recentActivity: Array<{ label: string; detail: string; tone: TutoringStatusTone }>
}

export type TutoringWorkspaceSnapshot = {
  generatedAt: string
  user: {
    name: string
    role: string
    plan: string
  }
  students: TutoringStudent[]
  tasks: TutoringTask[]
  submissions: TutoringSubmission[]
  feedback: TutoringFeedback[]
  resources: TutoringResource[]
  messages: TutoringMessage[]
  metrics: TutoringMetrics
  availability: {
    weekly: Record<string, 'open' | 'busy'>
    blockedDates: string[]
  }
}

export function getTutoringNavId(pathname?: string | null): TutoringNavId {
  const normalized = (pathname || '').split(/[?#]/)[0].toLowerCase().replace(/\/+$/, '')
  const dashboardPath = normalized.startsWith('/dashboard/partner')
    ? normalized.slice('/dashboard/partner'.length) || '/dashboard'
    : normalized.startsWith('/dashboard')
      ? normalized.slice('/dashboard'.length) || '/dashboard'
      : normalized

  const cleaned = dashboardPath === '/' ? '/dashboard' : dashboardPath

  const mapping: Array<[string, TutoringNavId]> = [
    ['/dashboard', 'dashboard'],
    ['/students', 'students'],
    ['/tasks', 'tasks'],
    ['/feedback', 'feedback'],
    ['/reports', 'reports'],
    ['/recaps', 'feedback'],
    ['/progress', 'progress'],
    ['/resources', 'resources'],
    ['/schedule', 'schedule'],
    ['/communication', 'communication'],
    ['/settings', 'settings'],
  ]

  for (const [suffix, navId] of mapping) {
    if (cleaned === `/dashboard${suffix === '/dashboard' ? '' : suffix}`) return navId
    if (cleaned === suffix || cleaned === `${suffix}/`) return navId
  }

  return 'dashboard'
}

export const tutoringNavItems: Array<{ id: TutoringNavId; href: string; label: string; icon: LucideIcon; badge?: number }> = [
  { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', href: '/dashboard/students', label: 'Students', icon: Users },
  { id: 'tasks', href: '/dashboard/tasks', label: 'Tasks', icon: FileText, badge: 4 },
  { id: 'feedback', href: '/dashboard/feedback', label: 'Feedback', icon: Sparkles, badge: 2 },
  { id: 'reports', href: '/dashboard/reports', label: 'Reports', icon: FileText, badge: 1 },
  { id: 'progress', href: '/dashboard/progress', label: 'Progress', icon: TrendingUp },
  { id: 'resources', href: '/dashboard/resources', label: 'Resources', icon: Library },
  { id: 'schedule', href: '/dashboard/schedule', label: 'Schedule', icon: CalendarClock },
  { id: 'communication', href: '/dashboard/communication', label: 'Communication', icon: MessageSquare, badge: 2 },
  { id: 'settings', href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export const tutoringPovItems: TutoringPov[] = ['Student POV', 'Tutor POV', 'Parent POV']

export function isStudentPov(pov: TutoringPov) {
  return pov === 'Student POV'
}

export function isTutorPov(pov: TutoringPov) {
  return pov === 'Tutor POV'
}

export function isParentPov(pov: TutoringPov) {
  return pov === 'Parent POV'
}

export const tutoringSectionMeta: Record<TutoringNavId, { title: string; description: string }> = {
  dashboard: {
    title: 'Dashboard',
    description: 'Execution snapshot with tasks, submissions, and the next moves.',
  },
  students: {
    title: 'Students',
    description: 'Assigned students, linked parents, linked tutors, and entitlement context.',
  },
  tasks: {
    title: 'Tasks',
    description: 'Weekly assignments, deadlines, resource links, and submission actions.',
  },
  feedback: {
    title: 'Feedback',
    description: 'Reviewed work, weak-topic tags, scores, and next actions.',
  },
  reports: {
    title: 'Reports',
    description: 'Weekly parent summaries, execution metrics, and AI-assisted recaps.',
  },
  progress: {
    title: 'Progress',
    description: 'Completion, score trend, review turnaround, and consistency.',
  },
  resources: {
    title: 'Resources',
    description: 'Lesson files, question banks, model answers, and tutor-only references.',
  },
  schedule: {
    title: 'Schedule',
    description: 'Weekly availability and upcoming due dates.',
  },
  communication: {
    title: 'Communication',
    description: 'Parent, tutor, and student updates in one queue.',
  },
  settings: {
    title: 'Settings',
    description: 'Pov defaults, notifications, and workspace preferences.',
  },
}

export const tutoringStudentFilterOptions: Array<{ key: 'all' | 'improving' | 'stable' | 'declining'; label: string }> = [
  { key: 'all', label: 'all' },
  { key: 'improving', label: 'improving' },
  { key: 'stable', label: 'stable' },
  { key: 'declining', label: 'declining' },
]

export const tutoringStudentSortOptions: Array<{ key: 'name' | 'progress' | 'sessions' | 'next'; label: string }> = [
  { key: 'name', label: 'name' },
  { key: 'progress', label: 'progress' },
  { key: 'sessions', label: 'sessions' },
  { key: 'next', label: 'next session' },
]

export function initialsForName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2)
    .padEnd(2, 'X')
}

export function progressLabel(status: TutoringStudent['status']) {
  return status === 'Improving' ? 'Growing' : status === 'Declining' ? 'Needs support' : 'Stable'
}

export function statusClasses(status: TutoringStudent['status']) {
  return status === 'Improving'
    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700'
    : status === 'Declining'
      ? 'border-rose-500/20 bg-rose-500/10 text-rose-700'
      : 'border-amber-500/20 bg-amber-500/10 text-amber-700'
}

export function summaryClasses(tone: TutoringStatusTone) {
  return tone === 'green'
    ? 'border-[#A7F3D0] bg-[#E6F4ED] text-[#2D6A4F]'
    : tone === 'red'
      ? 'border-[#FECACA] bg-[#FEE2E2] text-[#991B1B]'
      : 'border-[#FDE68A] bg-[#FEF3C7] text-[#92400E]'
}

export function progressColor(progress: number) {
  return progress >= 75 ? '#10B981' : progress >= 50 ? '#3B82F6' : '#EF4444'
}

export function taskStatusLabel(status: TutoringTaskStatus) {
  const labels: Record<TutoringTaskStatus, string> = {
    assigned: 'Assigned',
    submitted: 'Submitted',
    reviewed: 'Reviewed',
    overdue: 'Overdue',
    completed: 'Completed',
  }
  return labels[status]
}

export function taskStatusClasses(status: TutoringTaskStatus) {
  switch (status) {
    case 'completed':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700'
    case 'reviewed':
      return 'border-sky-500/20 bg-sky-500/10 text-sky-700'
    case 'submitted':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-700'
    case 'overdue':
      return 'border-rose-500/20 bg-rose-500/10 text-rose-700'
    default:
      return 'border-slate-900/10 bg-slate-100 text-slate-700'
  }
}

export function resourceKindLabel(kind: TutoringResourceKind) {
  const labels: Record<TutoringResourceKind, string> = {
    lesson_file: 'Lesson file',
    question_bank: 'Question bank',
    model_answer: 'Model answer',
    tutor_resource: 'Tutor resource',
  }

  return labels[kind]
}

export function accessTierLabel(tier: TutoringAccessTier) {
  const labels: Record<TutoringAccessTier, string> = {
    free: 'Free',
    ai_premium: 'AI Premium',
    tutoring_premium: 'Tutoring Premium',
    tutor_only: 'Tutor only',
  }

  return labels[tier]
}

export function formatDateLabel(dateIso: string) {
  const date = new Date(dateIso)
  if (Number.isNaN(date.getTime())) return 'TBD'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function formatDateTimeLabel(dateIso: string) {
  const date = new Date(dateIso)
  if (Number.isNaN(date.getTime())) return 'TBD'
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function nextSessionKey(nextSession: string) {
  const [dayPart = '', timePart = '', period = ''] = nextSession.split(' ')
  const dayIndex = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].indexOf(dayPart.slice(0, 3).toLowerCase())
  const [hourText = '0', minuteText = '0'] = timePart.split(':')
  let hour = Number(hourText)
  const minute = Number(minuteText)
  if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12
  if (period.toUpperCase() === 'AM' && hour === 12) hour = 0
  return (dayIndex < 0 ? 99 : dayIndex) * 24 * 60 + hour * 60 + minute
}

function weeklyAvailability() {
  return {
    weekly: {
      Monday: 'open',
      Tuesday: 'busy',
      Wednesday: 'open',
      Thursday: 'open',
      Friday: 'busy',
      Saturday: 'open',
      Sunday: 'busy',
    } as Record<string, 'open' | 'busy'>,
    blockedDates: ['2026-04-10', '2026-04-16'],
  }
}

const students: TutoringStudent[] = [
  {
    id: 'aiko-sato',
    initials: 'AS',
    name: 'Aiko Sato',
    grade: 'Grade 12',
    subject: 'Physics HL',
    curriculum: 'IB',
    plan: 'ELITE',
    sessions: 31,
    status: 'Improving',
    progress: 93,
    nextSession: 'Thu 3:00 PM',
    nextDeadline: '2026-04-09T15:00:00.000Z',
    recap: 'Strong exam pacing and clean free-body diagrams.',
    note: 'Push for a short quiz on rotational motion before Thursday.',
    tutorSummary: 'Tutor focus: rotational motion and concise explanations.',
    parentSummary: 'Parent summary: steady improvement and a strong mock test result.',
    tutorNames: ['James Chen', 'Nadia Ali'],
    parentNames: ['Chak Hang Chan'],
    weakTopics: ['Rotational dynamics', 'Units under pressure'],
    todayTasks: ['Complete timed rotational motion drill', 'Annotate one past-paper response'],
    completionRate: 0.96,
    overdueTasks: 0,
  },
  {
    id: 'hana-kobayashi',
    initials: 'HK',
    name: 'Hana Kobayashi',
    grade: 'Grade 11',
    subject: 'Biology HL',
    curriculum: 'IB',
    plan: 'PRO',
    sessions: 9,
    status: 'Stable',
    progress: 68,
    nextSession: 'Mon 6:00 PM',
    nextDeadline: '2026-04-08T18:00:00.000Z',
    recap: 'Cell signaling summary is solid after the last recap.',
    note: 'Keep the next session focused on plant transport vocabulary.',
    tutorSummary: 'Tutor focus: terminology precision and application questions.',
    parentSummary: 'Parent summary: work is on track, with one terminology gap to close.',
    tutorNames: ['James Chen'],
    parentNames: ['Mika Kobayashi', 'Kenji Kobayashi'],
    weakTopics: ['Plant transport', 'Signal cascades'],
    todayTasks: ['Review membrane transport notes', 'Answer one 8-mark application question'],
    completionRate: 0.82,
    overdueTasks: 1,
  },
  {
    id: 'kenji-yamamoto',
    initials: 'KY',
    name: 'Kenji Yamamoto',
    grade: 'Grade 10',
    subject: 'Chemistry',
    curriculum: 'IB',
    plan: 'FREE',
    sessions: 12,
    status: 'Declining',
    progress: 48,
    nextSession: 'Fri 2:00 PM',
    nextDeadline: '2026-04-11T14:00:00.000Z',
    recap: 'Needs more practice balancing equations under time pressure.',
    note: 'Bring back the stoichiometry scaffold and a short timed drill.',
    tutorSummary: 'Tutor focus: stoichiometry and exam timing.',
    parentSummary: 'Parent summary: inconsistent completion means the next week must be simpler.',
    tutorNames: ['James Chen'],
    parentNames: ['Yui Yamamoto'],
    weakTopics: ['Stoichiometry', 'Equation balancing'],
    todayTasks: ['Redo the balancing drill', 'Upload one photo of corrected work'],
    completionRate: 0.61,
    overdueTasks: 2,
  },
  {
    id: 'lucia-martinez',
    initials: 'LM',
    name: 'Lucia Martinez',
    grade: 'Grade 11',
    subject: 'Essay Writing',
    curriculum: 'IB',
    plan: 'ELITE',
    sessions: 16,
    status: 'Declining',
    progress: 52,
    nextSession: 'Sat 10:00 AM',
    nextDeadline: '2026-04-12T10:00:00.000Z',
    recap: 'Thesis statements are clearer but transitions still need work.',
    note: 'Review one essay intro and one paragraph structure example.',
    tutorSummary: 'Tutor focus: structure, evidence, and transitions.',
    parentSummary: 'Parent summary: writing is improving, but the weekly submission is late.',
    tutorNames: ['James Chen', 'Sofia Rivera'],
    parentNames: ['Gabriela Martinez'],
    weakTopics: ['Transitions', 'Evidence selection', 'Topic sentences'],
    todayTasks: ['Revise one paragraph', 'Upload the latest draft with comments'],
    completionRate: 0.57,
    overdueTasks: 1,
  },
]

const tasks: TutoringTask[] = [
  {
    id: 'task-aiko-rotational',
    studentId: 'aiko-sato',
    studentName: 'Aiko Sato',
    subject: 'Physics HL',
    topic: 'Rotational motion',
    title: 'Timed drill: rotational motion',
    instructions: 'Complete the 18-minute drill, show all reasoning, and tag any step you would like corrected.',
    status: 'submitted',
    dueAt: '2026-04-08T09:00:00.000Z',
    submittedAt: '2026-04-07T08:10:00.000Z',
    priority: 'high',
    assignedBy: 'James Chen',
    resourceTitles: ['Rotational motion pack', 'Model answer set'],
    weakTopics: ['Rotational dynamics', 'Units under pressure'],
    completionNote: 'Submitted early and on target for review.',
  },
  {
    id: 'task-hana-transport',
    studentId: 'hana-kobayashi',
    studentName: 'Hana Kobayashi',
    subject: 'Biology HL',
    topic: 'Membrane transport',
    title: 'Explain membrane transport in one page',
    instructions: 'Write a one-page explanation with one diagram and one exam-style application example.',
    status: 'assigned',
    dueAt: '2026-04-08T18:00:00.000Z',
    priority: 'medium',
    assignedBy: 'James Chen',
    resourceTitles: ['Lesson file: membrane transport', 'Question bank: transport questions'],
    weakTopics: ['Plant transport', 'Signal cascades'],
    completionNote: 'Waiting for a first submission.',
  },
  {
    id: 'task-kenji-stoich',
    studentId: 'kenji-yamamoto',
    studentName: 'Kenji Yamamoto',
    subject: 'Chemistry',
    topic: 'Stoichiometry',
    title: 'Redo stoichiometry scaffold',
    instructions: 'Redo the scaffolded practice, then upload a corrected copy with the mistakes marked.',
    status: 'overdue',
    dueAt: '2026-04-06T14:00:00.000Z',
    priority: 'high',
    assignedBy: 'James Chen',
    resourceTitles: ['Model answer: balancing equations'],
    weakTopics: ['Stoichiometry', 'Equation balancing'],
    completionNote: 'Needs intervention because the deadline passed.',
  },
  {
    id: 'task-lucia-essay',
    studentId: 'lucia-martinez',
    studentName: 'Lucia Martinez',
    subject: 'Essay Writing',
    topic: 'Transitions',
    title: 'Revise one essay paragraph',
    instructions: 'Improve the transition sentence and add one line of evidence commentary.',
    status: 'reviewed',
    dueAt: '2026-04-09T10:00:00.000Z',
    submittedAt: '2026-04-07T14:30:00.000Z',
    reviewedAt: '2026-04-07T18:15:00.000Z',
    priority: 'high',
    assignedBy: 'James Chen',
    resourceTitles: ['Model answer: essay transitions', 'Tutor note: paragraph structure'],
    weakTopics: ['Transitions', 'Evidence selection'],
    completionNote: 'Reviewed and ready for the next revision pass.',
  },
  {
    id: 'task-aiko-quiz',
    studentId: 'aiko-sato',
    studentName: 'Aiko Sato',
    subject: 'Physics HL',
    topic: 'Momentum',
    title: 'Five-question warm-up',
    instructions: 'Complete the warm-up before the next session and bring one question to discuss.',
    status: 'completed',
    dueAt: '2026-04-05T16:00:00.000Z',
    submittedAt: '2026-04-05T13:45:00.000Z',
    reviewedAt: '2026-04-05T15:10:00.000Z',
    priority: 'low',
    assignedBy: 'James Chen',
    resourceTitles: ['Question bank: momentum drill'],
    weakTopics: ['Momentum conservation'],
    completionNote: 'Completed and logged as a warm-up success.',
  },
]

const submissions: TutoringSubmission[] = [
  {
    id: 'submission-lucia-1',
    taskId: 'task-lucia-essay',
    studentId: 'lucia-martinez',
    studentName: 'Lucia Martinez',
    taskTitle: 'Revise one essay paragraph',
    submittedAt: '2026-04-07T14:30:00.000Z',
    textResponse: 'I tightened the topic sentence and added a clearer link back to the thesis.',
    fileName: 'lucia-essay-draft.docx',
    fileMimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    status: 'reviewed',
  },
  {
    id: 'submission-aiko-1',
    taskId: 'task-aiko-rotational',
    studentId: 'aiko-sato',
    studentName: 'Aiko Sato',
    taskTitle: 'Timed drill: rotational motion',
    submittedAt: '2026-04-07T08:10:00.000Z',
    textResponse: 'Attached is the corrected timed drill with units checked on each step.',
    externalLink: 'https://example.com/aiko-rotational',
    status: 'submitted',
  },
  {
    id: 'submission-kenji-1',
    taskId: 'task-kenji-stoich',
    studentId: 'kenji-yamamoto',
    studentName: 'Kenji Yamamoto',
    taskTitle: 'Redo stoichiometry scaffold',
    submittedAt: '2026-04-04T09:10:00.000Z',
    textResponse: 'I completed the scaffold but still need help with the mole ratio step.',
    fileName: 'kenji-stoich-photo.png',
    fileMimeType: 'image/png',
    status: 'submitted',
  },
]

const feedback: TutoringFeedback[] = [
  {
    id: 'feedback-lucia-1',
    taskId: 'task-lucia-essay',
    submissionId: 'submission-lucia-1',
    studentId: 'lucia-martinez',
    studentName: 'Lucia Martinez',
    taskTitle: 'Revise one essay paragraph',
    reviewerName: 'James Chen',
    score: 82,
    comments: 'Clearer structure and stronger evidence selection than the previous draft.',
    strengths: ['Cleaner thesis link', 'More precise evidence', 'Better paragraph flow'],
    weaknesses: ['Transition sentence still feels repetitive', 'Needs one concrete quote'],
    nextAction: 'Rewrite the transition and add one more piece of textual evidence.',
    weakTopics: ['Transitions', 'Evidence selection'],
    aiSummary: 'Keep the paragraph structure, but sharpen the transitions and quote selection.',
    reviewedAt: '2026-04-07T18:15:00.000Z',
  },
  {
    id: 'feedback-aiko-1',
    taskId: 'task-aiko-rotational',
    submissionId: 'submission-aiko-1',
    studentId: 'aiko-sato',
    studentName: 'Aiko Sato',
    taskTitle: 'Timed drill: rotational motion',
    reviewerName: 'James Chen',
    score: 94,
    comments: 'Excellent pacing and clear reasoning throughout.',
    strengths: ['Strong exam pacing', 'Correct units', 'Good diagram annotation'],
    weaknesses: ['One sign error on the torque question'],
    nextAction: 'Do one short correction set before the next session.',
    weakTopics: ['Rotational dynamics'],
    aiSummary: 'Excellent drill performance with one sign error to correct.',
    reviewedAt: '2026-04-05T15:10:00.000Z',
  },
]

const resources: TutoringResource[] = [
  {
    id: 'resource-physics-pack',
    title: 'Rotational motion pack',
    subject: 'Physics HL',
    topic: 'Rotational motion',
    kind: 'lesson_file',
    accessTier: 'tutoring_premium',
    summary: 'Lesson notes and worked examples for the current physics sequence.',
    fileName: 'rotational-motion.pdf',
    uploadedBy: 'James Chen',
    taskId: 'task-aiko-rotational',
    studentId: 'aiko-sato',
  },
  {
    id: 'resource-bio-bank',
    title: 'Transport question bank',
    subject: 'Biology HL',
    topic: 'Membrane transport',
    kind: 'question_bank',
    accessTier: 'ai_premium',
    summary: 'Mixed practice questions with markscheme prompts.',
    fileName: 'transport-question-bank.pdf',
    uploadedBy: 'James Chen',
    taskId: 'task-hana-transport',
    studentId: 'hana-kobayashi',
  },
  {
    id: 'resource-essay-model',
    title: 'Essay transitions model answer',
    subject: 'Essay Writing',
    topic: 'Transitions',
    kind: 'model_answer',
    accessTier: 'tutor_only',
    summary: 'Model paragraph showing a tighter topic sentence and cleaner commentary.',
    externalLink: 'https://example.com/model-essay',
    uploadedBy: 'Sofia Rivera',
    taskId: 'task-lucia-essay',
    studentId: 'lucia-martinez',
  },
  {
    id: 'resource-tutor-note',
    title: 'Tutor review checklist',
    subject: 'General',
    topic: 'Weekly review',
    kind: 'tutor_resource',
    accessTier: 'tutor_only',
    summary: 'Internal workflow checklist for session planning, review, and parent updates.',
    uploadedBy: 'James Chen',
  },
  {
    id: 'resource-momentum',
    title: 'Momentum warm-up set',
    subject: 'Physics HL',
    topic: 'Momentum',
    kind: 'question_bank',
    accessTier: 'free',
    summary: 'Short warm-up set for fast review before class.',
    fileName: 'momentum-warmup.pdf',
    uploadedBy: 'James Chen',
    taskId: 'task-aiko-quiz',
    studentId: 'aiko-sato',
  },
]

const messages: TutoringMessage[] = [
  {
    id: 'message-parent-aiko',
    studentId: 'aiko-sato',
    studentName: 'Aiko Sato',
    channel: 'Parent',
    subject: 'Physics exam plan',
    lastMessage: 'Can we move the mock test earlier this week?',
    detail: 'Parent wants to see one timed set before Thursday. Reply with a clear prep plan and a short recap attachment.',
    updatedAt: 'Today 6:45 PM',
    unread: true,
  },
  {
    id: 'message-student-kenji',
    studentId: 'kenji-yamamoto',
    studentName: 'Kenji Yamamoto',
    channel: 'Student',
    subject: 'Stoichiometry review',
    lastMessage: 'I finished the balancing drill you sent.',
    detail: 'Kenji is ready for a tighter timed drill. A short acknowledgement plus the next practice set would keep momentum up.',
    updatedAt: 'Today 4:20 PM',
    unread: false,
  },
  {
    id: 'message-tutor-lucia',
    studentId: 'lucia-martinez',
    studentName: 'Lucia Martinez',
    channel: 'Tutor',
    subject: 'Essay revision notes',
    lastMessage: 'Add one example on transitions before sending it out.',
    detail: 'The tutor draft is almost ready. Add one transition example and send the parent summary after the next review.',
    updatedAt: 'Yesterday',
    unread: false,
  },
  {
    id: 'message-parent-hana',
    studentId: 'hana-kobayashi',
    studentName: 'Hana Kobayashi',
    channel: 'Parent',
    subject: 'Biology recap timing',
    lastMessage: 'Can we keep weekly recaps on Monday?',
    detail: 'Family wants a simple weekly recap cadence. Confirm the Monday rhythm and keep the update concise.',
    updatedAt: 'Tue',
    unread: true,
  },
]

export const demoTutoringWorkspace: TutoringWorkspaceSnapshot = {
  generatedAt: new Date().toISOString(),
  user: {
    name: 'James Chen',
    role: 'TUTOR',
    plan: 'ELITE',
  },
  students,
  tasks,
  submissions,
  feedback,
  resources,
  messages,
  metrics: {
    completionRate: 0.84,
    submittedOnTimeRate: 0.78,
    avgScore: 88,
    reviewLatencyHours: 7.5,
    engagementConsistency: 0.91,
    openTasks: 4,
    dueThisWeek: 5,
    weakTopicFrequency: [
      { label: 'Transitions', count: 3 },
      { label: 'Stoichiometry', count: 2 },
      { label: 'Rotational dynamics', count: 2 },
      { label: 'Evidence selection', count: 1 },
    ],
    scoreTrend: [
      { label: 'Week 1', value: 74 },
      { label: 'Week 2', value: 81 },
      { label: 'Week 3', value: 86 },
      { label: 'Week 4', value: 88 },
    ],
    weeklyCompletion: [
      { label: 'Mon', completed: 4, assigned: 4 },
      { label: 'Tue', completed: 3, assigned: 4 },
      { label: 'Wed', completed: 4, assigned: 5 },
      { label: 'Thu', completed: 2, assigned: 3 },
      { label: 'Fri', completed: 3, assigned: 4 },
      { label: 'Sat', completed: 1, assigned: 2 },
      { label: 'Sun', completed: 0, assigned: 1 },
    ],
    recentActivity: [
      { label: 'Reviewed', detail: 'Lucia essay paragraph reviewed and tagged for transitions.', tone: 'green' },
      { label: 'Submitted', detail: 'Aiko uploaded the rotational motion drill ahead of the deadline.', tone: 'green' },
      { label: 'Overdue', detail: 'Kenji still needs to clear the stoichiometry scaffold.', tone: 'amber' },
    ],
  },
  availability: weeklyAvailability(),
}

export const initialStudents = demoTutoringWorkspace.students
export const tutoringThreads = demoTutoringWorkspace.messages

export function buildTutoringDemoWorkspace(overrides?: Partial<TutoringWorkspaceSnapshot>): TutoringWorkspaceSnapshot {
  return {
    ...demoTutoringWorkspace,
    ...overrides,
    user: {
      ...demoTutoringWorkspace.user,
      ...(overrides?.user || {}),
    },
    students: overrides?.students ?? demoTutoringWorkspace.students,
    tasks: overrides?.tasks ?? demoTutoringWorkspace.tasks,
    submissions: overrides?.submissions ?? demoTutoringWorkspace.submissions,
    feedback: overrides?.feedback ?? demoTutoringWorkspace.feedback,
    resources: overrides?.resources ?? demoTutoringWorkspace.resources,
    messages: overrides?.messages ?? demoTutoringWorkspace.messages,
    metrics: overrides?.metrics ?? demoTutoringWorkspace.metrics,
    availability: overrides?.availability ?? demoTutoringWorkspace.availability,
    generatedAt: overrides?.generatedAt ?? new Date().toISOString(),
  }
}
