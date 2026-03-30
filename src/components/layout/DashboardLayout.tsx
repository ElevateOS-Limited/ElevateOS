'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTheme } from './ThemeProvider'
import {
  BookOpen,
  FileText,
  Clock,
  GraduationCap,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  LayoutDashboard,
  Shield,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/study', label: 'Study Assistant', icon: BookOpen },
  { href: '/worksheets', label: 'Worksheets', icon: FileText },
  { href: '/past-papers', label: 'Past Papers', icon: Clock },
  { href: '/admissions', label: 'Admissions', icon: GraduationCap },
  { href: '/internships', label: 'Internships', icon: Briefcase },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex h-screen bg-[#f8f5ef] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-slate-950 text-[#f8f5ef] shadow-xl transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-950">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-lg text-white">ElevateOS</p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Workspace</p>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-white/10 text-white ring-1 ring-white/10'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            {session?.user?.role === 'ADMIN' && (
              <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#f2c06d] hover:bg-white/5">
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-950">
                {session?.user?.name?.[0] || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{session?.user?.name || 'User'}</p>
                <p className="truncate text-xs text-white/50">{session?.user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleTheme} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs transition-colors hover:bg-white/10">
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs transition-colors hover:bg-white/10">
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-900/10 bg-[#f8f5ef]/85 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/75 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="font-bold text-slate-950 dark:text-white">
            ElevateOS
          </Link>
          <div className="w-5" />
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
