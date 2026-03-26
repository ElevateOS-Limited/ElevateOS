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

const STORAGE_KEY = 'edutech.sidebar.state'

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
  const [openGroups, setOpenGroups] = useState<string[]>(() => getStoredSidebarState()?.openGroups ?? ['dashboard', 'learn', 'plan', 'apply'])
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
    <aside className={cn('flex flex-col h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800 transition-all shadow-sm', collapsed ? 'w-28' : 'w-72')}>
      <div className={cn('border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2', collapsed ? 'p-4' : 'p-4')}>
        <Link href="/dashboard" className={cn('flex items-center min-w-0', collapsed ? 'justify-center w-full' : 'gap-2')}>
          <div className={cn('bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center', collapsed ? 'w-9 h-9' : 'w-8 h-8')}><Brain className={cn('text-white', collapsed ? 'w-6 h-6' : 'w-5 h-5')} /></div>
          {!collapsed && <span className="text-xl font-bold gradient-text truncate">ElevateOS</span>}
        </Link>
        <button onClick={() => setCollapsed((v) => !v)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <PanelLeft className="w-4 h-4" />
        </button>
      </div>

      {!collapsed && (
        <div className="p-3 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search modules..." className="w-full pl-8 pr-2 py-2 text-sm border rounded-lg bg-transparent" />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <button type="button" onClick={() => setShowQuickActions((v) => !v)} className="text-xs text-gray-500 underline">
              {showQuickActions ? 'Hide quick actions' : 'Show quick actions'}
            </button>
            {user.plan === 'FREE' && (
              <Link href="/pricing" className="text-xs text-indigo-600 underline">Upgrade →</Link>
            )}
          </div>
          {showQuickActions && (
            <div className="mt-2 flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((a) => (
                <Link key={a.href} href={a.href} className="text-xs px-2 py-1 rounded-md bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">{a.label}</Link>
              ))}
            </div>
          )}
        </div>
      )}

      <nav className="flex-1 overflow-auto p-2 space-y-2">
        {filteredGroups.map((group) => {
          const groupOpen = openGroups.includes(group.key)
          return (
            <div key={group.key}>
              <button onClick={() => toggleGroup(group.key)} className={cn("w-full flex items-center justify-between text-xs uppercase tracking-wide text-gray-500", collapsed ? 'px-1 py-1' : 'px-2 py-1.5')}>
                {!collapsed && <span>{group.label}</span>}
                {!collapsed && (groupOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
              </button>
              {groupOpen && (
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
                    const locked = item.planRequired === 'PRO' && user.plan === 'FREE'
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={item.label}
                        onClick={() => onCloseMobile?.()}
                        className={cn('flex items-center gap-3 rounded-xl text-sm transition-all', collapsed ? 'px-3 py-2.5 justify-center' : 'px-3 py-2', active ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800')}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">{item.label}</span>
                            {item.badge && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">{item.badge}</span>}
                            {locked && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                          </>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {!collapsed && user.plan === 'FREE' && (
        <div className="p-2.5 hidden md:block">
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">Upgrade to Pro</p>
              <Crown className="w-4 h-4" />
            </div>
            <p className="text-[11px] text-violet-100 mt-1 line-clamp-1">Unlock premium modules + analytics</p>
            <Link href="/pricing" className="mt-2 block text-center bg-white text-violet-700 text-xs font-semibold py-1.5 rounded-md">Upgrade</Link>
          </div>
        </div>
      )}

      <div className="p-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-white flex items-center justify-center text-sm font-semibold">{user.name?.[0]?.toUpperCase() || 'U'}</div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.name || 'Student'}</p>
              <p className="text-xs text-gray-500 capitalize">{user.plan.toLowerCase()} plan</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )

  return (
    <>
      <div className="hidden md:flex h-full">{sidebarBody}</div>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={onCloseMobile} />
          <div className="relative w-72 h-full">{sidebarBody}</div>
        </div>
      )}
    </>
  )
}
