import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSessionOrDemo } from '@/lib/auth/session'
import { DEMO_MODE } from '@/lib/auth/demo'
import { isTutoringStaffRole, getRoleHomePath } from '@/lib/auth/routes'
import { getSiteVariantFromHeaders } from '@/lib/site'
import TutoringDashboardShell from '@/components/tutoring/TutoringDashboardShell'

export default async function TutorDashboardLayout({ children }: { children: React.ReactNode }) {
  const siteVariant = getSiteVariantFromHeaders(await headers())
  const allowDemoTutoringSurface = DEMO_MODE && siteVariant === 'tutoring'
  const session = await getSessionOrDemo()
  if (!allowDemoTutoringSurface) {
    if (!session?.user?.id) redirect('/login')
    if (!isTutoringStaffRole(session.user.role)) redirect(getRoleHomePath(session.user.role))
  }

  return <TutoringDashboardShell>{children}</TutoringDashboardShell>
}
