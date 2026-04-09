import { redirect } from 'next/navigation'
import DashboardShell from '@/components/layout/DashboardShell'
import { getSessionOrDemo } from '@/lib/auth/session'
import { hasRequiredRole } from '@/lib/auth/roles'
import { getRoleHomePath } from '@/lib/auth/routes'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionOrDemo()
  if (!session) redirect('/login')
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN'])) redirect(getRoleHomePath(session.user.role))

  return <DashboardShell user={session.user} siteVariant="tutoring">{children}</DashboardShell>
}
