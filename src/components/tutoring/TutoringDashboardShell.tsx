'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getTutoringNavId,
  tutoringNavItems,
  tutoringPovItems,
  tutoringSectionMeta,
  type TutoringNavId,
  type TutoringPov,
} from './tutoring-data'

type TutoringUiContextValue = {
  activePov: TutoringPov
  setActivePov: (value: TutoringPov) => void
  activeNav: TutoringNavId
}

const TutoringUiContext = createContext<TutoringUiContextValue | null>(null)

export function useTutoringUi() {
  const value = useContext(TutoringUiContext)

  if (!value) {
    throw new Error('useTutoringUi must be used inside TutoringDashboardShell')
  }

  return value
}

function TutoringSidebar({
  activeNav,
  activePov,
  mobile = false,
  povLabel,
  onClose,
  onSetActivePov,
}: {
  activeNav: TutoringNavId
  activePov: TutoringPov
  mobile?: boolean
  povLabel: string
  onClose: () => void
  onSetActivePov: (value: TutoringPov) => void
}) {
  return (
    <div className={cn('flex h-full flex-col bg-[#1E293B] text-[#F8F9FA]', mobile ? 'w-[84vw] max-w-[280px]' : 'w-[220px]')}>
      <div className="flex items-center gap-2 border-b border-[#334155] px-5 py-[21px] pb-[18px]">
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[7px] bg-[#DF5B30] font-display text-[15px] text-white">E</div>
        <div className="min-w-0">
          <div className="font-display text-[16.5px] tracking-[-0.3px] text-[#F8F9FA]">ElevateOS</div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.9px] text-[#9B9B9B]">{povLabel}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-[#334155] px-5 py-[13px]">
        <div className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#DF5B30]/20 text-[11px] font-semibold text-[#DF5B30]">AP</div>
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-[#F8F9FA]">Avery Park</div>
          <div className="text-[11px] text-[#F8F9FA]/70">Tutor</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-[10px] py-[10px]">
        <div className="mb-[3px] mt-3 px-[10px] text-[10px] font-semibold uppercase tracking-[0.9px] text-[#9B9B9B]">Main</div>
        {tutoringNavItems.map((item) => {
          const Icon = item.icon
          const active = item.id === activeNav

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onClose}
              className={cn(
                'mb-px flex w-full items-center gap-[9px] rounded-[8px] px-[10px] py-[8.5px] text-[13px] font-[450] transition-colors',
                active ? 'bg-[#EFF6FF] text-[#3B82F6]' : 'text-[#F8F9FA] hover:bg-[#334155]',
              )}
            >
              <Icon className="h-[15px] w-[15px] shrink-0 opacity-60" />
              <span>{item.label}</span>
              {item.badge ? <span className="ml-auto rounded-full bg-[#DF5B30] px-[6px] py-[2px] text-[9.5px] font-semibold text-white">{item.badge}</span> : null}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-[#334155] px-[10px] py-[12px]">
        <div className="mb-3 rounded-[12px] border border-[#334155] bg-[#111827] p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.7px] text-[#9B9B9B]">View</div>
          <div className="flex flex-col gap-2">
            {tutoringPovItems.map((label) => {
              const isActive = label === activePov

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => onSetActivePov(label)}
                  className={cn(
                    'rounded-[8px] border px-3 py-2 text-left text-[12px] font-medium transition-colors',
                    isActive ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#3B82F6]' : 'border-[#334155] bg-[#1E293B] text-[#F8F9FA] hover:bg-[#334155]',
                  )}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
        <Link
          href="/auth/login"
          onClick={onClose}
          className="flex items-center gap-[9px] rounded-[8px] px-[10px] py-[8.5px] text-[13px] font-[450] text-[#F8F9FA] transition-colors hover:bg-[#334155]"
        >
          <LogOut className="h-[15px] w-[15px] shrink-0 opacity-60" />
          <span>Sign Out</span>
        </Link>
      </div>
    </div>
  )
}

export default function TutoringDashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activePov, setActivePov] = useState<TutoringPov>('Tutor view')

  const activeNav = useMemo(() => getTutoringNavId(pathname), [pathname])
  const section = tutoringSectionMeta[activeNav]
  const povLabel = activePov

  return (
    <TutoringUiContext.Provider value={{ activePov, setActivePov, activeNav }}>
      <div className="relative flex min-h-[100svh] overflow-hidden bg-[#1E293B] text-[#F8F9FA]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(223,91,48,0.08),transparent_28%),radial-gradient(circle_at_90%_20%,rgba(255,255,255,0.03),transparent_24%)]" />

        <aside className="hidden shrink-0 border-r border-[#334155] bg-[#1E293B] lg:flex">
          <TutoringSidebar activeNav={activeNav} activePov={activePov} onClose={() => setMobileOpen(false)} onSetActivePov={setActivePov} povLabel={povLabel} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-[58px] shrink-0 items-center gap-3 border-b border-[#334155] bg-[#1E293B] px-6">
            <button
              type="button"
              className="mr-1 rounded-[6px] p-2 text-[#F8F9FA] transition-colors hover:bg-[#334155] lg:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="font-display flex-1 text-[18px] tracking-[-0.3px] text-[#F8F9FA]">
              {section.title}
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-[#334155] bg-[#111827] px-3 py-1.5 text-[12px] font-medium text-[#F8F9FA] md:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {povLabel}
            </div>

            <div className="hidden rounded-[8px] border border-[#334155] bg-[#111827] px-3 py-1.5 text-[11px] font-medium text-[#9B9B9B] md:block">
              {section.description}
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-y-auto bg-[#F8F9FA] p-6 text-[#1A1A1A]">
            {children}
          </main>
        </div>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/60"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative flex h-full flex-col overflow-y-auto border-r border-[#334155] bg-[#1E293B] shadow-2xl">
              <div className="flex items-center justify-end px-4 py-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full p-2 text-[#F8F9FA] transition-colors hover:bg-[#334155]"
                  aria-label="Close navigation panel"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <TutoringSidebar activeNav={activeNav} activePov={activePov} mobile onClose={() => setMobileOpen(false)} onSetActivePov={setActivePov} povLabel={povLabel} />
            </aside>
          </div>
        ) : null}
      </div>
    </TutoringUiContext.Provider>
  )
}
