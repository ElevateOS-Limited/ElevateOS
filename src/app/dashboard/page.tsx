import { headers } from 'next/headers'
import { getSiteVariantFromHeaders } from '@/lib/site'
import MainDashboardPage from '@/components/dashboard/MainDashboardPage'
import TutoringDashboardShell from '@/components/tutoring/TutoringDashboardShell'
import TutoringOverviewPage from '@/components/tutoring/TutoringOverviewPage'

export default async function DashboardPage() {
  const siteVariant = getSiteVariantFromHeaders(await headers())
  return siteVariant === 'tutoring' ? (
    <TutoringDashboardShell>
      <TutoringOverviewPage />
    </TutoringDashboardShell>
  ) : (
    <MainDashboardPage />
  )
}
