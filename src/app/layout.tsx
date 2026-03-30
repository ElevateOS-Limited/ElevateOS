import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Geist, Instrument_Serif } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/layout/Providers'
import { getSiteVariantFromHeaders } from '@/lib/site'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument-serif',
})

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers()
  const siteVariant = getSiteVariantFromHeaders(headerStore)

  return {
    metadataBase: new URL('https://elevateos.org'),
    title:
      siteVariant === 'tutoring'
        ? 'ElevateOS | Tutoring Workflow Platform'
        : 'ElevateOS | Student Workflow Platform',
    description:
      siteVariant === 'tutoring'
        ? 'Tutoring, study planning, worksheets, and progress tracking for students and tutors.'
        : 'Tutoring, study planning, worksheets, progress tracking, admissions support, and internships for students and tutors.',
    applicationName: 'ElevateOS',
    authors: [{ name: 'Howard' }],
    creator: 'Howard',
    publisher: 'Howard',
    robots: {
      index: true,
      follow: true,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
    },
    verification: {
      other: { 'ip-provenance': 'HOWARD-APPDEMO-20260222' },
    },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${instrumentSerif.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
