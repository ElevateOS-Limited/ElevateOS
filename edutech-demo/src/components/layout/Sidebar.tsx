'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Brain, BookOpen, Trophy, GraduationCap, Briefcase, ScanLine,
  LayoutDashboard, Settings, Crown, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/study', icon: Brain, label: 'AI Study Assistant' },
  { href: '/dashboard/worksheets', icon: BookOpen, label: 'Worksheets', badge: 'New' },
  { href: '/dashboard/pastpapers', icon: Trophy, label: 'Past Papers' },
  { href: '/dashboard/admissions', icon: GraduationCap, label: 'Admissions' },
  { href: '/dashboard/internships', icon: Briefcase, label: 'Internships' },
  { href: '/dashboard/planner', icon: BookOpen, label: 'Activity Planner' },
  { href: '/dashboard/paper-scan', icon: ScanLine, label: 'Paper Scanner' },
  { href: '/dashboard/extracurriculars', icon: Trophy, label: 'EC Scoring' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

interface SidebarProps {
  user: { name?: string | null; email?: string | null; plan: string; image?: string | null }
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const activePath = pathname ?? '/'

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">EduTech</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            activePath === item.href || (item.href !== '/dashboard' && activePath.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400 px-1.5 py-0.5 rounded-md">
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
            </Link>
          )
        })}
      </nav>

      {/* Upgrade banner */}
      {user.plan === 'FREE' && (
        <div className="p-4">
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-xl p-4 text-white">
            <Crown className="w-5 h-5 mb-2" />
            <p className="text-sm font-semibold mb-1">Upgrade to Pro</p>
            <p className="text-xs text-violet-200 mb-3">Unlock unlimited AI tools</p>
            <Link href="/pricing" className="block text-center bg-white text-violet-700 text-xs font-semibold py-1.5 rounded-lg hover:bg-violet-50 transition-colors">
              Upgrade Now
            </Link>
          </div>
        </div>
      )}

      {/* User info */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name || 'Student'}</p>
            <p className="text-xs text-gray-500 capitalize">{user.plan?.toLowerCase()} plan</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
