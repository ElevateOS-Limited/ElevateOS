'use client'

import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { BookOpen, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function GuestPage() {
  const [status, setStatus] = useState<'loading' | 'error'>('loading')

  useEffect(() => {
    const email = process.env.NEXT_PUBLIC_DEMO_EMAIL || 'demo@elevateos.org'
    const password = process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'demopassword123'

    signIn('credentials', { email, password, redirect: false }).then((res) => {
      if (res?.ok) {
        window.location.href = '/dashboard'
      } else {
        setStatus('error')
      }
    }).catch(() => setStatus('error'))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f5ef] dark:bg-slate-950 px-4">
      <div className="text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-[#f8f5ef] dark:bg-white dark:text-slate-950 mx-auto mb-4">
          <BookOpen className="h-6 w-6" />
        </div>

        {status === 'loading' ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-[#d97706] mx-auto mb-3" />
            <p className="text-lg font-semibold text-slate-950 dark:text-white">Opening guest workspace…</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Setting up your demo session</p>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold text-slate-950 dark:text-white mb-2">Guest access unavailable</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Demo mode may not be enabled on this instance.</p>
            <Link href="/demo" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
              Back to demo
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
