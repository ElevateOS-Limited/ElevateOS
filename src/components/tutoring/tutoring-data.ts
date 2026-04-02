import type { LucideIcon } from 'lucide-react'
import {
  CalendarClock,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react'

export type TutoringNavId = 'dashboard' | 'students' | 'recaps' | 'progress' | 'schedule' | 'communication' | 'settings'
export type StudentStatus = 'Improving' | 'Stable' | 'Declining'
export type FilterKey = 'all' | 'improving' | 'stable' | 'declining'
export type SortKey = 'name' | 'progress' | 'sessions' | 'next'
export type TutoringPov = 'Tutor POV' | 'Parent POV'
export type SummaryTone = 'green' | 'amber' | 'red'

export type Student = {
  id: string
  initials: string
  name: string
  subject: string
  grade: string
  sessions: number
  status: StudentStatus
  progress: number
  nextSession: string
  recap: string
  note: string
}

export type TutoringThread = {
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

export const tutoringNavItems: Array<{ id: TutoringNavId; href: string; label: string; icon: LucideIcon; badge?: number }> = [
  { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', href: '/dashboard/students', label: 'Students', icon: Users },
  { id: 'recaps', href: '/dashboard/recaps', label: 'Recaps', icon: FileText },
  { id: 'progress', href: '/dashboard/progress', label: 'Progress', icon: TrendingUp },
  { id: 'schedule', href: '/dashboard/schedule', label: 'Schedule', icon: CalendarClock },
  { id: 'communication', href: '/dashboard/communication', label: 'Communication', icon: MessageSquare, badge: 3 },
  { id: 'settings', href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export const tutoringPovItems: TutoringPov[] = ['Tutor POV', 'Parent POV']

export function isParentPov(pov: TutoringPov) {
  return pov === 'Parent POV'
}

export const tutoringSectionMeta: Record<TutoringNavId, { title: string; description: string }> = {
  dashboard: {
    title: 'Dashboard',
    description: 'At-a-glance tutoring operations, priorities, and follow-ups.',
  },
  students: {
    title: 'Students',
    description: 'Roster, filters, notes, and intervention tracking.',
  },
  recaps: {
    title: 'Recaps',
    description: 'Recent session notes and parent-ready summaries.',
  },
  progress: {
    title: 'Progress',
    description: 'Trend lines, progress bars, and intervention signals.',
  },
  schedule: {
    title: 'Schedule',
    description: 'Weekly availability, blocked dates, and upcoming sessions.',
  },
  communication: {
    title: 'Communication',
    description: 'Parent, tutor, and student messages in one queue.',
  },
  settings: {
    title: 'Settings',
    description: 'Tutor preferences, default views, and workspace options.',
  },
}

export const tutoringStudentFilterOptions: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'all' },
  { key: 'improving', label: 'improving' },
  { key: 'stable', label: 'stable' },
  { key: 'declining', label: 'declining' },
]

export const tutoringStudentSortOptions: Array<{ key: SortKey; label: string }> = [
  { key: 'name', label: 'name' },
  { key: 'progress', label: 'progress' },
  { key: 'sessions', label: 'sessions' },
  { key: 'next', label: 'next session' },
]

export const initialStudents: Student[] = [
  { id: 'aiko-sato', initials: 'AS', name: 'Aiko Sato', subject: 'Physics', grade: 'Grade 12', sessions: 31, status: 'Improving', progress: 93, nextSession: 'Thu 3:00 PM', recap: 'Strong exam pacing and clean free-body diagrams.', note: 'Push for a short quiz on rotational motion before Thursday.' },
  { id: 'hana-kobayashi', initials: 'HK', name: 'Hana Kobayashi', subject: 'Biology', grade: 'Grade 11', sessions: 9, status: 'Stable', progress: 68, nextSession: 'Mon 6:00 PM', recap: 'Cell signaling summary is solid after the last recap.', note: 'Keep the next session focused on plant transport vocabulary.' },
  { id: 'kenji-yamamoto', initials: 'KY', name: 'Kenji Yamamoto', subject: 'Chemistry', grade: 'Grade 10', sessions: 12, status: 'Declining', progress: 48, nextSession: 'Fri 2:00 PM', recap: 'Needs more practice balancing equations under time pressure.', note: 'Bring back the stoichiometry scaffold and a short timed drill.' },
  { id: 'lucia-martinez', initials: 'LM', name: 'Lucia Martinez', subject: 'Essay Writing', grade: 'Grade 11', sessions: 16, status: 'Declining', progress: 52, nextSession: 'Sat 10:00 AM', recap: 'Thesis statements are clearer but transitions still need work.', note: 'Review one essay intro and one paragraph structure example.' },
  { id: 'mina-park', initials: 'MP', name: 'Mina Park', subject: 'Algebra II', grade: 'Grade 9', sessions: 14, status: 'Improving', progress: 76, nextSession: 'Tue 4:30 PM', recap: 'Quadratic factoring has improved since the last worksheet.', note: 'Add a mixed-problem set to keep the progress curve moving.' },
  { id: 'noah-williams', initials: 'NW', name: 'Noah Williams', subject: 'Pre-Calculus', grade: 'Grade 12', sessions: 20, status: 'Stable', progress: 74, nextSession: 'Sun 3:00 PM', recap: 'Function transformations are holding steady.', note: 'Revisit limits before the next session to avoid drift.' },
  { id: 'omar-hassan', initials: 'OH', name: 'Omar Hassan', subject: 'World History', grade: 'Grade 10', sessions: 11, status: 'Stable', progress: 61, nextSession: 'Thu 5:00 PM', recap: 'Better chronology, but cause/effect links still need more depth.', note: 'Bring one map-based review and one timeline summary.' },
  { id: 'ryo-nakamura', initials: 'RN', name: 'Ryo Nakamura', subject: 'English', grade: 'Grade 11', sessions: 18, status: 'Declining', progress: 59, nextSession: 'Wed 5:30 PM', recap: 'Close reading improved slightly, but evidence selection is weak.', note: 'Practice one paragraph with direct evidence and commentary.' },
  { id: 'yuki-tanaka', initials: 'YT', name: 'Yuki Tanaka', subject: 'Mathematics', grade: 'Grade 10', sessions: 24, status: 'Improving', progress: 82, nextSession: 'Mon 4:00 PM', recap: 'Graph interpretation is reliable and getting faster.', note: 'Keep a short timed warm-up at the start of each session.' },
]

export const tutoringThreads: TutoringThread[] = [
  {
    id: 'thread-aiko-parent',
    studentId: 'aiko-sato',
    studentName: 'Aiko Sato',
    channel: 'Parent',
    subject: 'Physics exam plan',
    lastMessage: 'Can we move the mock test earlier this week?',
    detail: 'Parent wants to see one timed set before Thursday. The tutor can reply with a clear prep plan and a quick recap attachment.',
    updatedAt: 'Today 6:45 PM',
    unread: true,
  },
  {
    id: 'thread-kenji-student',
    studentId: 'kenji-yamamoto',
    studentName: 'Kenji Yamamoto',
    channel: 'Student',
    subject: 'Stoichiometry review',
    lastMessage: 'I finished the balancing drill you sent.',
    detail: 'Kenji is ready for a tighter timed drill. A short acknowledgement plus a next-step practice set would keep momentum up.',
    updatedAt: 'Today 4:20 PM',
    unread: false,
  },
  {
    id: 'thread-lucia-tutor',
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
    id: 'thread-yuki-parent',
    studentId: 'yuki-tanaka',
    studentName: 'Yuki Tanaka',
    channel: 'Parent',
    subject: 'Math warm-up cadence',
    lastMessage: 'Can we keep the 10 minute warm-up for each session?',
    detail: 'The parent wants a consistent warm-up pattern. A simple affirmation and schedule note should close this thread.',
    updatedAt: 'Tue',
    unread: true,
  },
]

export function progressLabel(status: StudentStatus) {
  return status === 'Improving' ? '📈 Improving' : status === 'Declining' ? '📉 Declining' : '→ Stable'
}

export function statusClasses(status: StudentStatus) {
  return status === 'Improving'
    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700'
    : status === 'Declining'
      ? 'border-rose-500/20 bg-rose-500/10 text-rose-700'
      : 'border-amber-500/20 bg-amber-500/10 text-amber-700'
}

export function summaryClasses(tone: SummaryTone) {
  return tone === 'green'
    ? 'border-[#A7F3D0] bg-[#E6F4ED] text-[#2D6A4F]'
    : tone === 'red'
      ? 'border-[#FECACA] bg-[#FEE2E2] text-[#991B1B]'
      : 'border-[#FDE68A] bg-[#FEF3C7] text-[#92400E]'
}

export function progressColor(progress: number) {
  return progress >= 75 ? '#10B981' : progress >= 50 ? '#3B82F6' : '#EF4444'
}

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

export function getTutoringNavId(pathname: string): TutoringNavId {
  const normalizedPathname = pathname.startsWith('/dashboard/partner')
    ? pathname.replace('/dashboard/partner', '/dashboard')
    : pathname

  if (normalizedPathname === '/dashboard') {
    return 'dashboard'
  }

  const direct = tutoringNavItems.find((item) => item.id !== 'dashboard' && (normalizedPathname === item.href || normalizedPathname.startsWith(`${item.href}/`)))
  return direct?.id ?? 'dashboard'
}
