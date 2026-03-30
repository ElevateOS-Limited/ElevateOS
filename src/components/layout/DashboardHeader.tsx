'use client'

import { signOut } from 'next-auth/react'
import { LogOut, Bell, Moon, Sun, Menu, Command } from 'lucide-react'
import { useTheme } from 'next-themes'

interface DashboardHeaderProps {
  user: { name?: string | null; email?: string | null }
  onMenu?: () => void
}

export default function DashboardHeader({ user, onMenu }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-900/10 bg-[#f8f5ef]/85 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 md:px-6">
      <div className="flex items-center gap-2">
        <button onClick={onMenu} className="rounded-lg p-2 hover:bg-white/70 dark:hover:bg-white/10 md:hidden">
          <Menu className="w-4 h-4" />
        </button>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Welcome back, <span className="text-slate-900 dark:text-white font-semibold">{user.name || 'Student'}</span>
        </p>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
          className="hidden items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-2.5 py-1.5 text-xs text-slate-500 md:flex dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
          title="Command Palette"
        >
          <Command className="w-3.5 h-3.5" />
          Ctrl/Cmd + K
        </button>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-lg p-2 transition-colors hover:bg-white/70 dark:hover:bg-white/10"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button className="relative rounded-lg p-2 transition-colors hover:bg-white/70 dark:hover:bg-white/10">
          <Bell className="w-4 h-4" />
        </button>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2 rounded-full border border-slate-900/10 px-3 py-2 text-sm text-slate-600 transition-colors hover:border-slate-900/20 hover:bg-white/70 hover:text-slate-950 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:block">Sign out</span>
        </button>
      </div>
    </header>
  )
}
