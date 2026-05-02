import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import TutoringDashboardShell from '@/components/tutoring/TutoringDashboardShell'
import { getSiteVariantFromHeaders } from '@/lib/site'

export default async function TutoringDashboardLayout({ children }: { children: React.ReactNode }) {
  const headerStore = await headers()

  if (getSiteVariantFromHeaders(headerStore) !== 'tutoring') {
    redirect('/dashboard')
  }

  return <TutoringDashboardShell>{children}</TutoringDashboardShell>
}
