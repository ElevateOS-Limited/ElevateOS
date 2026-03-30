'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import DashboardHeader from '@/components/layout/DashboardHeader'
import ChatBot from '@/components/dashboard/ChatBot'
import CommandPalette from '@/components/layout/CommandPalette'
import type { SiteVariant } from '@/lib/navigation'

export default function DashboardShell({ user, siteVariant = 'main', children }: { user: any; siteVariant?: SiteVariant; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#f8f5ef] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar user={user} siteVariant={siteVariant} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(242,192,109,0.18),transparent_35%),radial-gradient(circle_at_90%_20%,rgba(15,23,42,0.12),transparent_30%)] dark:bg-[radial-gradient(circle_at_20%_0%,rgba(242,192,109,0.12),transparent_35%),radial-gradient(circle_at_90%_20%,rgba(255,255,255,0.05),transparent_30%)]" />
        <DashboardHeader user={user} onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6 py-6">{children}</div>
        </main>
      </div>
      <ChatBot />
      <CommandPalette />
    </div>
  )
}
