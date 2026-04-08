'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Brain, ChevronDown, ChevronRight, Crown, PanelLeft, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_GROUPS, QUICK_ACTIONS } from '@/lib/navigation'

type SidebarProps = {
  user: { name?: string | null; email?: string | null; plan: string; image?: string | null }
  mobileOpen?: boolean
  onCloseMobile?: () => void
}

const STORAGE_KEY = 'elevateos.sidebar.state'

function getStoredSidebarState() {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    return {
      collapsed: typeof parsed.collapsed === 'boolean' ? parsed.collapsed : false,
      openGroups: Array.isArray(parsed.openGroups) ? parsed.openGroups : null,
    }
  } catch {
    return null
  }
}

export default function Sidebar({ user, mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState<boolean>(() => getStoredSidebarState()?.collapsed ?? false)
  const [openGroups, setOpenGroups] = useState<string[]>(() => getStoredSidebarState()?.openGroups ?? ['dashboard', 'learn', 'plan', 'account'])
  const [search, setSearch] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [showQuickActions, setShowQuickActions] = useState(false)

  useEffect(() => {
    fetch('/api/sidebar-preferences')
      .then((r) => r.json())
      .then((data) => {
        if (typeof data?.collapsed === 'boolean') setCollapsed(data.collapsed)
        if (Array.isArray(data?.openGroups)) setOpenGroups(data.openGroups)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const payload = { collapsed, openGroups }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    fetch('/api/sidebar-preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {})
  }, [collapsed, openGroups])

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return NAV_GROUPS
    const q = search.toLowerCase()
    return NAV_GROUPS
      .map((g) => ({
        ...g,
        items: g.items.filter((i) => i.label.toLowerCase().includes(q) || i.href.toLowerCase().includes(q)),
      }))
      .filter((g) => g.items.length)
  }, [search])

  const flatItems = filteredGroups.flatMap((g) => g.items)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!flatItems.length) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedIndex((v) => (v + 1) % flatItems.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIndex((v) => (v - 1 + flatItems.length) % flatItems.length)
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        const target = flatItems[focusedIndex]
        if (target) router.push(target.href)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flatItems, focusedIndex, router])

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  const sidebarBody = (
    <aside className={cn('flex h-full flex-col border-r border-white/10 bg-slate-950 text-[#f8f5ef] shadow-sm backdrop-blur-xl transition-all', collapsed ? 'w-28' : 'w-72')}>
      <div className="flex items-center justify-between gap-2 border-b border-white/10 p-4">
        <Link href="/dashboard" className={cn('flex min-w-0 items-center', collapsed ? 'w-full justify-center' : 'gap-2')}>
          <div className={cn('flex items-center justify-center rounded-xl bg-white text-slate-950 shadow-lg shadow-black/20', collapsed ? 'h-9 w-9' : 'h-8 w-8')}>
            <Brain className={cn(collapsed ? 'h-6 w-6' : 'h-5 w-5')} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xl font-bold text-white">ElevateOS</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Workspace</p>
            </div>
          )}
        </Link>
        <button onClick={() => setCollapsed((v) => !v)} className="rounded-md p-1.5 hover:bg-white/10" title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <PanelLeft className="w-4 h-4" />
        </button>
      </div>

      {!collapsed && (
        <div className="border-b border-white/10 p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/45" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search modules..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-8 pr-2 text-sm text-white placeholder:text-white/40"
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <button type="button" onClick={() => setShowQuickActions((v) => !v)} className="text-xs text-white/65 underline decoration-white/30">
              {showQuickActions ? 'Hide quick actions' : 'Show quick actions'}
            </button>
            {user.plan === 'FREE' && (
              <Link href="/pricing" className="text-xs text-[#f2c06d] underline decoration-white/20">
                Upgrade →
              </Link>
            )}
          </div>
          {showQuickActions && (
            <div className="mt-2 flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((a) => (
                <Link key={a.href} href={a.href} className="rounded-md bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/15">
                  {a.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <nav className="flex-1 space-y-2 overflow-auto p-2">
        {filteredGroups.map((group) => {
          const groupOpen = openGroups.includes(group.key)
          return (
            <div key={group.key}>
              <button onClick={() => toggleGroup(group.key)} className={cn('flex w-full items-center justify-between text-xs uppercase tracking-wide text-white/50', collapsed ? 'px-1 py-1' : 'px-2 py-1.5')}>
                {!collapsed && <span>{group.label}</span>}
                {!collapsed && (groupOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />)}
              </button>
              {groupOpen && (
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
                    const locked = item.planRequired === 'PRO' && user.plan === 'FREE'
                    const isExternal = item.href.startsWith('http')
                    return (
                      isExternal ? (
                        <a
                          key={item.href}
                          href={item.href}
                          title={item.label}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => onCloseMobile?.()}
                          className={cn(
                            'flex items-center gap-3 rounded-xl text-sm transition-all',
                            collapsed ? 'justify-center px-3 py-2.5' : 'px-3 py-2',
                            active ? 'bg-white/10 text-white ring-1 ring-white/10' : 'text-white/70 hover:bg-white/5 hover:text-white'
                          )}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          {!collapsed && (
                            <>
                              <span className="flex-1 truncate">{item.label}</span>
                              {item.badge && <span className="rounded bg-[#f2c06d]/15 px-1.5 py-0.5 text-[10px] text-[#f5d59f]">{item.badge}</span>}
                              {locked && <Crown className="h-3.5 w-3.5 text-[#f2c06d]" />}
                            </>
                          )}
                        </a>
                      ) : (
                        <Link
                          key={item.href}
                          href={item.href}
                          title={item.label}
                          onClick={() => onCloseMobile?.()}
                          className={cn(
                            'flex items-center gap-3 rounded-xl text-sm transition-all',
                            collapsed ? 'justify-center px-3 py-2.5' : 'px-3 py-2',
                            active ? 'bg-white/10 text-white ring-1 ring-white/10' : 'text-white/70 hover:bg-white/5 hover:text-white'
                          )}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          {!collapsed && (
                            <>
                              <span className="flex-1 truncate">{item.label}</span>
                              {item.badge && <span className="rounded bg-[#f2c06d]/15 px-1.5 py-0.5 text-[10px] text-[#f5d59f]">{item.badge}</span>}
                              {locked && <Crown className="h-3.5 w-3.5 text-[#f2c06d]" />}
                            </>
                          )}
                        </Link>
                      )
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {!collapsed && user.plan === 'FREE' && (
        <div className="hidden p-2.5 md:block">
          <div className="rounded-lg bg-gradient-to-br from-[#d97706] to-[#9a5b00] p-3 text-white">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">Upgrade to Pro</p>
              <Crown className="h-4 w-4" />
            </div>
            <p className="mt-1 line-clamp-1 text-[11px] text-white/80">Unlock premium modules + analytics</p>
            <Link href="/pricing" className="mt-2 block rounded-md bg-white px-3 py-1.5 text-center text-xs font-semibold text-[#9a5b00]">
              Upgrade
            </Link>
          </div>
        </div>
      )}

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-950">
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name || 'Student'}</p>
              <p className="text-xs capitalize text-white/55">{user.plan.toLowerCase()} plan</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )

  return (
    <>
      <div className="hidden h-full md:flex">{sidebarBody}</div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onCloseMobile} />
          <div className="relative h-full w-72">{sidebarBody}</div>
        </div>
      )}
    </>
  )
}
