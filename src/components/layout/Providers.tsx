'use client'

import { SessionProvider, signIn, useSession } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './ThemeProvider'
import { ChatBot } from '@/components/chat/ChatBot'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const queryClient = new QueryClient()
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_USER_EMAIL ?? 'demo@elevateos.org'
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_USER_PASSWORD ?? 'demopassword123'

function DemoAutoSignIn() {
  const { status } = useSession()
  const hasAutoSignedIn = useRef(false)

  useEffect(() => {
    if (!DEMO_MODE || hasAutoSignedIn.current) return
    if (status === 'unauthenticated') {
      hasAutoSignedIn.current = true
      signIn('credentials', { email: DEMO_EMAIL, password: DEMO_PASSWORD, redirect: false })
    }
  }, [status])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/auth')

  return (
    <SessionProvider>
      <DemoAutoSignIn />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {children}
          <Toaster position="top-right" />
          {!isAuthPage && <ChatBot />}
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
