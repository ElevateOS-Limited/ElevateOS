'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import DashboardHeader from '@/components/layout/DashboardHeader'
import ChatBot from '@/components/dashboard/ChatBot'
import CommandPalette from '@/components/layout/CommandPalette'
import { usePathname } from 'next/navigation'
import type { SiteVariant } from '@/lib/site'

type DashboardShellProps = {
  user: any
  children: React.ReactNode
  siteVariant?: SiteVariant
}

function MainDashboardShell({ user, children }: Omit<DashboardShellProps, 'siteVariant'>) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#f8f5ef] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar user={user} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(242,192,109,0.18),transparent_35%),radial-gradient(circle_at_90%_20%,rgba(15,23,42,0.12),transparent_30%)] dark:bg-[radial-gradient(circle_at_20%_0%,rgba(242,192,109,0.12),transparent_35%),radial-gradient(circle_at_90%_20%,rgba(255,255,255,0.05),transparent_30%)]" />
        <DashboardHeader user={user} onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="relative mx-auto w-full max-w-7xl px-4 py-6 md:px-6">{children}</div>
        </main>
      </div>
      <ChatBot />
      <CommandPalette />
    </div>
  )
}

export default function DashboardShell({ user, children, siteVariant = 'main' }: DashboardShellProps) {
  const pathname = usePathname()

  if (siteVariant === 'tutoring' || pathname.startsWith('/dashboard/partner')) {
    return <>{children}</>
  }

  return <MainDashboardShell user={user}>{children}</MainDashboardShell>
}
