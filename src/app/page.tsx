import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSiteVariantFromHeaders } from '@/lib/site'

export default async function RootPage() {
  const headerStore = await headers()
  const siteVariant = getSiteVariantFromHeaders(headerStore)
  redirect(siteVariant === 'tutoring' ? '/tutors' : '/home')
}
