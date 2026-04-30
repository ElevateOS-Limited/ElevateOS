import { redirect } from 'next/navigation'

const LEGACY_ROUTE_MAP: Record<string, string> = {
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
}

function resolveLegacyTarget(slug: string[]) {
  const [head = '', ...rest] = slug

  if (head === 'partner') {
    const tail = rest.join('/')
    return tail ? `/tutor-dashboard/${tail}` : '/tutor-dashboard'
  }

  if (head in LEGACY_ROUTE_MAP) {
    return LEGACY_ROUTE_MAP[head]
  }

  return '/dashboard'
}

export default function DashboardLegacyRoute({ params }: { params: { slug?: string[] } }) {
  redirect(resolveLegacyTarget(params.slug || []))
}
