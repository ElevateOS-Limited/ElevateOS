import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import TutorDashboardClient from '@/components/tutoring/TutoringDashboardClient'
import { getSiteVariantFromHeaders } from '@/lib/site'

export default async function TutorDashboardPage() {
  const headerStore = await headers()

  if (getSiteVariantFromHeaders(headerStore) !== 'tutoring') {
    redirect('/dashboard')
  }

  return <TutorDashboardClient />
}
