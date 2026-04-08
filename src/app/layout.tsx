import type { Metadata } from 'next'
import { Geist, Instrument_Serif } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/layout/Providers'
import { getAppUrl } from '@/lib/app-url'

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
  title: 'ElevateOS | IB AI Revision and Tutoring Workspace',
  description: 'IB-first AI revision on elevateos.org and the tutoring execution loop on tutoring.elevateos.org, with tasks, submissions, feedback, and weekly reports.',
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
  icons: {
    icon: '/icon.jpg',
    apple: '/apple-icon.jpg',
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
