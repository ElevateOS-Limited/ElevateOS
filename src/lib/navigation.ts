import {
  Brain,
  BookOpen,
  Layers,
  FileText,
  Library,
  HelpCircle,
  Trophy,
  Calendar,
  Target,
  Clock3,
  GraduationCap,
  Briefcase,
  ScanLine,
  BarChart3,
  Flame,
  Activity,
  AlertCircle,
  Settings,
  CreditCard,
  MessageSquare,
  Megaphone,
  LayoutDashboard,
} from 'lucide-react'

export type NavItem = {
  href: string
  label: string
  icon: any
  badge?: string
  planRequired?: 'FREE' | 'PRO' | 'ELITE'
}

export type NavGroup = {
  key: string
  label: string
  items: NavItem[]
}

export type SiteVariant = 'main' | 'tutoring'

export const SIDEBAR_BADGES: Record<string, string | undefined> = {
  '/dashboard/worksheets': 'New',
  '/dashboard/paper-scan': 'Beta',
  '/dashboard/extracurriculars': 'Beta',
}

export const NAV_GROUPS: NavGroup[] = [
  {
    key: 'dashboard',
    label: 'Home',
    items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    key: 'learn',
    label: 'Learn',
    items: [
      { href: '/dashboard/study', label: 'AI Study Assistant', icon: Brain },
      { href: '/dashboard/notes', label: 'Notes', icon: BookOpen },
      { href: '/dashboard/flashcards', label: 'Flashcards', icon: Layers },
      { href: '/dashboard/question-bank', label: 'Question Bank', icon: Library },
      { href: '/dashboard/worksheets', label: 'Worksheets', icon: FileText, badge: SIDEBAR_BADGES['/dashboard/worksheets'] },
      { href: '/dashboard/pastpapers', label: 'Past Papers', icon: Trophy },
      { href: '/dashboard/paper-scan', label: 'Paper Scanner', icon: ScanLine, badge: SIDEBAR_BADGES['/dashboard/paper-scan'], planRequired: 'PRO' },
    ],
  },
  {
    key: 'plan',
    label: 'Plan',
    items: [
      { href: '/dashboard/planner', label: 'Activity Planner', icon: Calendar },
      { href: '/dashboard/calendar', label: 'Calendar', icon: Clock3 },
      { href: '/dashboard/goals', label: 'Goals', icon: Target },
      { href: '/dashboard/deadlines', label: 'Deadlines', icon: AlertCircle },
    ],
  },
  {
    key: 'apply',
    label: 'Apply',
    items: [
      { href: '/dashboard/admissions', label: 'Admissions', icon: GraduationCap },
      { href: '/dashboard/scholarships', label: 'Scholarships', icon: HelpCircle },
      { href: '/dashboard/internships', label: 'Internships', icon: Briefcase },
      { href: '/dashboard/extracurriculars', label: 'EC Scoring', icon: Trophy, badge: SIDEBAR_BADGES['/dashboard/extracurriculars'] },
      { href: '/dashboard/portfolio-insights', label: 'Portfolio', icon: Activity },
    ],
  },
  {
    key: 'insights',
    label: 'Insights',
    items: [
      { href: '/dashboard/progress', label: 'Progress', icon: BarChart3 },
      { href: '/dashboard/analytics', label: 'Analytics', icon: Activity, planRequired: 'PRO' },
      { href: '/dashboard/streaks', label: 'Streaks', icon: Flame },
      { href: '/dashboard/weak-areas', label: 'Weak Areas', icon: AlertCircle },
    ],
  },
  {
    key: 'system',
    label: 'System',
    items: [
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      { href: '/pricing', label: 'Billing / Plan', icon: CreditCard },
      { href: '/dashboard/help', label: 'Help / Feedback', icon: MessageSquare },
      { href: '/dashboard/changelog', label: 'Changelog', icon: Megaphone },
    ],
  },
]

export const QUICK_ACTIONS = [
  { href: '/dashboard/notes', label: 'New Note' },
  { href: '/dashboard/question-bank', label: 'Start Practice' },
  { href: '/dashboard/paper-scan', label: 'Scan Paper' },
  { href: '/dashboard/planner', label: 'Plan Today' },
]

export const flattenNav = () => NAV_GROUPS.flatMap((g) => g.items)

export function getNavGroups(variant: SiteVariant = 'main') {
  if (variant === 'tutoring') {
    return NAV_GROUPS.filter((group) => group.key !== 'apply')
  }

  return NAV_GROUPS
}
