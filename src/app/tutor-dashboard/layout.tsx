import { redirect } from 'next/navigation'
import { getSessionOrDemo } from '@/lib/auth/session'
import { isTutoringStaffRole, getRoleHomePath } from '@/lib/auth/routes'
import TutoringDashboardShell from '@/components/tutoring/TutoringDashboardShell'

export default async function TutorDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) redirect('/login')
  if (!isTutoringStaffRole(session.user.role)) redirect(getRoleHomePath(session.user.role))

  return <TutoringDashboardShell>{children}</TutoringDashboardShell>
}
