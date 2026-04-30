import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSiteVariantFromHeaders } from '@/lib/site'

export default async function RootPage() {
  const siteVariant = getSiteVariantFromHeaders(await headers())
  redirect(siteVariant === 'tutoring' ? '/home' : '/dashboard')
}
