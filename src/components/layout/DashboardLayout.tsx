'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTheme } from './ThemeProvider'
import {
  BookOpen, FileText, Clock, GraduationCap, Briefcase,
  Settings, LogOut, Menu, X, Sun, Moon, LayoutDashboard, Shield
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg gradient-text">ElevateOS</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            {session?.user?.role === 'ADMIN' && (
              <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30">
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                {session?.user?.name?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session?.user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleTheme} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors">
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="font-bold gradient-text">ElevateOS</Link>
          <div className="w-5" />
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
