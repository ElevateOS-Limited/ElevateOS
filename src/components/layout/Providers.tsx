'use client'

import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './ThemeProvider'
import { ToastViewport } from '@/components/ui/ToastViewport'

const queryClient = new QueryClient()

export function Providers({ children, session }: { children: React.ReactNode; session?: Session | null }) {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {children}
          <ToastViewport />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
