'use client'

import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { BookOpen, FileText, Clock, GraduationCap, Briefcase, ArrowRight, CalendarClock } from 'lucide-react'

export default function DashboardPage() {
  const { data: session, status } = useSession()

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => fetch('/api/profile').then(r => r.json()),
  })

  const { data: materials } = useQuery({
    queryKey: ['study-materials'],
    queryFn: () => fetch('/api/study').then(r => r.json()),
  })

  const { data: worksheets } = useQuery({
    queryKey: ['worksheets'],
    queryFn: () => fetch('/api/worksheets').then(r => r.json()),
  })

  const quickActions = [
    { href: '/dashboard/study', label: 'New Study Session', icon: BookOpen, desc: 'Upload material & get AI notes', color: 'from-blue-500 to-indigo-600' },
    { href: '/dashboard/worksheets', label: 'Generate Worksheet', icon: FileText, desc: 'Create practice questions', color: 'from-purple-500 to-pink-600' },
    { href: '/dashboard/pastpapers', label: 'Simulate Exam', icon: Clock, desc: 'Timed past paper practice', color: 'from-orange-500 to-red-600' },
    { href: '/dashboard/admissions', label: 'Check Admissions', icon: GraduationCap, desc: 'AI university analysis', color: 'from-green-500 to-teal-600' },
    { href: '/dashboard/internships', label: 'Find Internships', icon: Briefcase, desc: 'Curated opportunities', color: 'from-pink-500 to-rose-600' },
    { href: '/dashboard/planner', label: 'Activity Planner', icon: CalendarClock, desc: 'Match open days to top-university activities', color: 'from-indigo-500 to-violet-600' },
  ]

  const stats = [
    { label: 'Study Sessions', value: (materials as any[])?.length || 0, icon: BookOpen },
    { label: 'Worksheets', value: (worksheets as any[])?.length || 0, icon: FileText },
    { label: 'Exams Practiced', value: 0, icon: Clock },
  ]

  const firstName = session?.user?.name?.split(' ')?.[0] || 'Student'

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Loading dashboard…</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {profile?.curriculum ? `${profile.curriculum} Student` : 'Ready to ace your studies?'}
          </p>
        </div>

        {/* Profile completion prompt */}
        {!profile?.curriculum && (
          <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-medium text-indigo-800 dark:text-indigo-300">Complete your profile for personalized AI recommendations</p>
              <p className="text-sm text-indigo-600 dark:text-indigo-400">Add your curriculum, subjects, and target universities</p>
            </div>
            <Link href="/dashboard/settings" className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors whitespace-nowrap">
              Complete Profile
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 text-center">
              <stat.icon className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {quickActions.map((action, i) => (
            <Link key={i} href={action.href} className="group bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:shadow-md">
              <div className={`w-10 h-10 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-semibold mb-1">{action.label}</p>
              <p className="text-sm text-gray-500">{action.desc}</p>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 mt-2 transition-colors" />
            </Link>
          ))}
        </div>

        {/* Recent Materials */}
        {(materials as any[])?.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Recent Study Materials</h2>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {(materials as any[]).slice(0, 5).map((m: any, i: number) => (
                <div key={m.id} className={`p-4 flex items-center gap-4 ${i !== 0 ? 'border-t border-gray-200 dark:border-gray-800' : ''}`}>
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{m.title}</p>
                    <p className="text-sm text-gray-500">{m.subject} {m.level ? `· ${m.level}` : ''}</p>
                  </div>
                  <p className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
