import type { Metadata } from 'next'
import { Geist, Instrument_Serif } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/layout/Providers'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument-serif',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://elevateos.org'),
  title: 'ElevateOS | Student Workflow Platform',
  description: 'Tutoring, study planning, worksheets, progress tracking, admissions support, and internships for students and tutors.',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${instrumentSerif.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
