import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import DashboardShell from '@/components/layout/DashboardShell'
import { getSessionOrDemo } from '@/lib/auth/session'
import { getSiteVariantFromHeaders } from '@/lib/site'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionOrDemo()
  if (!session) redirect('/auth/login')

  const headerStore = await headers()
  const siteVariant = getSiteVariantFromHeaders(headerStore)

  return <DashboardShell user={session.user} siteVariant={siteVariant}>{children}</DashboardShell>
}
