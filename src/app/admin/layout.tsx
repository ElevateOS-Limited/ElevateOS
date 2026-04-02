import { redirect } from 'next/navigation'
import DashboardShell from '@/components/layout/DashboardShell'
import { getSessionOrDemo } from '@/lib/auth/session'
import { hasRequiredRole } from '@/lib/auth/roles'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionOrDemo()
  if (!session) redirect('/auth/login')
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN'])) redirect('/dashboard')

  return <DashboardShell user={session.user}>{children}</DashboardShell>
}
