import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/layout/Providers'
import { getAppUrl } from '@/lib/app-url'

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: 'ElevateOS | Study Planning And Tutoring Workflows',
  description: 'Study planning, practice, progress tracking, and tutoring workflows for serious students and tutors.',
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
