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

export default function Sidebar({ user, mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [openGroups, setOpenGroups] = useState<string[]>(['dashboard', 'learn', 'plan', 'apply'])
  const [search, setSearch] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [showQuickActions, setShowQuickActions] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (typeof parsed.collapsed === 'boolean') setCollapsed(parsed.collapsed)
        if (Array.isArray(parsed.openGroups)) setOpenGroups(parsed.openGroups)
      } catch {}
    }

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
    <aside className={cn('flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all', collapsed ? 'w-20' : 'w-72')}>
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
        <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center"><Brain className="w-5 h-5 text-white" /></div>
          {!collapsed && <span className="text-xl font-bold gradient-text truncate">EduTech</span>}
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
              <button onClick={() => toggleGroup(group.key)} className="w-full flex items-center justify-between px-2 py-1.5 text-xs uppercase tracking-wide text-gray-500">
                {!collapsed && <span>{group.label}</span>}
                {groupOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
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
                        className={cn('flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all', active ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800')}
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
        <div className="p-3 hidden md:block">
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-xl p-4 text-white">
            <Crown className="w-5 h-5 mb-2" />
            <p className="text-sm font-semibold mb-1">Upgrade to Pro</p>
            <p className="text-xs text-violet-200 mb-3">Unlock premium modules and advanced analytics</p>
            <Link href="/pricing" className="block text-center bg-white text-violet-700 text-xs font-semibold py-1.5 rounded-lg">Upgrade</Link>
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
