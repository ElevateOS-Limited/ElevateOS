import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSiteVariantFromHeaders } from '@/lib/site'

const TUTORING_ROUTE_MAP: Record<string, string> = {
  students: '/tutor-dashboard/students',
  tasks: '/tutor-dashboard/tasks',
  feedback: '/tutor-dashboard/feedback',
  reports: '/tutor-dashboard/reports',
  recaps: '/tutor-dashboard/feedback',
  progress: '/tutor-dashboard/progress',
  resources: '/tutor-dashboard/resources',
  schedule: '/tutor-dashboard/schedule',
  communication: '/tutor-dashboard/communication',
  settings: '/settings',
  partner: '/tutor-dashboard',
}

const MAIN_ROUTE_MAP: Record<string, string> = {
  planner: '/dashboard#planner',
  schedule: '/dashboard#planner',
  activities: '/dashboard#planner',
  internships: '/dashboard#internships',
  universities: '/dashboard#universities',
  admissions: '/dashboard#universities',
  profile: '/settings',
  settings: '/settings',
  demo: '/demo',
  pricing: '/pricing',
  home: '/home',
  student: '/student-dashboard',
  'student-dashboard': '/student-dashboard',
}

function resolveLegacyTarget(slug: string[], isTutoringSite: boolean) {
  const [head = '', ...rest] = slug

  if (!head) return '/dashboard'

  if (isTutoringSite) {
    const tail = rest.join('/')

    if (head === 'partner') {
      return tail ? `/tutor-dashboard/${tail}` : '/tutor-dashboard'
    }

    if (head in TUTORING_ROUTE_MAP) {
      return TUTORING_ROUTE_MAP[head]
    }

    return tail ? `/tutor-dashboard/${[head, ...rest].join('/')}` : '/tutor-dashboard'
  }

  if (head in MAIN_ROUTE_MAP) {
    return MAIN_ROUTE_MAP[head]
  }

  return '/dashboard'
}

export default async function DashboardLegacyRoute({ params }: { params: { slug?: string[] } }) {
  const siteVariant = getSiteVariantFromHeaders(await headers())
  redirect(resolveLegacyTarget(params.slug || [], siteVariant === 'tutoring'))
}
