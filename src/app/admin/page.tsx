import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Activity, ArrowRight, Mail, Shield, UserRoundCog } from 'lucide-react'
import { getSessionOrDemo } from '@/lib/auth/session'
import { getRoleHomePath } from '@/lib/auth/routes'
import { hasRequiredRole } from '@/lib/auth/roles'
import { prisma } from '@/lib/prisma'
import { LeadStatusForm } from '@/components/admin/LeadStatusForm'
import { UserRoleForm } from '@/components/admin/UserRoleForm'

function formatDate(value: Date | null | undefined) {
  if (!value) return 'TBD'
  return value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default async function AdminPage() {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) redirect('/login')
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN'])) redirect(getRoleHomePath(session.user.role))

  const [leads, users, openTasks, reports, sessionNotes] = await Promise.all([
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: {
        id: true,
        email: true,
        roleInterest: true,
        source: true,
        campaign: true,
        status: true,
        notes: true,
        createdAt: true,
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        createdAt: true,
      },
    }),
    prisma.tutoringTask.count({
      where: {
        status: { notIn: ['COMPLETED', 'REVIEWED'] },
      },
    }),
    prisma.tutoringParentReport.count(),
    prisma.tutoringSessionNote.count(),
  ])

  const leadStats = {
    total: leads.length,
    new: leads.filter((lead) => lead.status === 'new').length,
    contacted: leads.filter((lead) => lead.status === 'contacted').length,
    converted: leads.filter((lead) => lead.status === 'converted').length,
  }

  const userStats = {
    total: users.length,
    students: users.filter((user) => user.role === 'STUDENT' || user.role === 'USER').length,
    tutors: users.filter((user) => user.role === 'TUTOR').length,
    parents: users.filter((user) => user.role === 'PARENT').length,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-slate-950 dark:text-white sm:px-6">
      <section className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Admin dashboard</p>
            <h1 className="font-display mt-3 text-4xl tracking-tight">Keep the tutoring business operational.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              This surface is intentionally small: manage leads, correct roles, and keep the canonical user store clean.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[36rem]">
            {[
              ['Leads', leadStats.total],
              ['Open tasks', openTasks],
              ['Reports', reports],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-2 text-3xl font-semibold">{value as number}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">New leads</p>
            <p className="mt-2 text-lg font-semibold">{leadStats.new}</p>
          </div>
          <div className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Contacted</p>
            <p className="mt-2 text-lg font-semibold">{leadStats.contacted}</p>
          </div>
          <div className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Converted</p>
            <p className="mt-2 text-lg font-semibold">{leadStats.converted}</p>
          </div>
          <div className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Session notes</p>
            <p className="mt-2 text-lg font-semibold">{sessionNotes}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Users</p>
            <p className="mt-2 text-lg font-semibold">{userStats.total}</p>
          </div>
          <div className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Students</p>
            <p className="mt-2 text-lg font-semibold">{userStats.students}</p>
          </div>
          <div className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Tutors</p>
            <p className="mt-2 text-lg font-semibold">{userStats.tutors}</p>
          </div>
          <div className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Parents</p>
            <p className="mt-2 text-lg font-semibold">{userStats.parents}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 py-6 lg:grid-cols-[1fr_.95fr]">
        <article className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#9a5b00]" />
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Leads</p>
          </div>
          <div className="mt-4 space-y-3">
            {leads.length ? (
              leads.map((lead) => (
                <LeadStatusForm
                  key={lead.id}
                  leadId={lead.id}
                  leadEmail={lead.email}
                  initialStatus={lead.status as 'new' | 'contacted' | 'qualified' | 'converted' | 'closed'}
                  initialNotes={lead.notes}
                />
              ))
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">No leads have been captured yet.</p>
            )}
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <UserRoundCog className="h-4 w-4 text-[#9a5b00]" />
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Users</p>
          </div>
          <div className="mt-4 space-y-3">
            {users.length ? (
              users.map((user) => (
                <div key={user.id} className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950 dark:text-white">{user.name || user.email || 'User'}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {user.email || 'No email'} · {user.role} · {user.plan || 'FREE'}
                      </p>
                    </div>
                    <span className="rounded-full border border-slate-900/10 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300">
                      Joined {formatDate(user.createdAt)}
                    </span>
                  </div>
                  <div className="mt-3">
                    <UserRoleForm
                      userId={user.id}
                      userName={user.name || user.email || 'User'}
                      initialRole={user.role}
                      initialPlan={user.plan}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">No users found.</p>
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-5 py-2 lg:grid-cols-[1fr_.95fr]">
        <article className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#f2c06d]" />
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f2c06d]">Operational links</p>
          </div>
          <div className="mt-4 space-y-3 text-sm leading-7 text-white/75">
            <p>Use lead capture on the public pages to bring families into the tutoring loop.</p>
            <p>Use the tutor workspace to assign tasks, review submissions, and generate parent summaries.</p>
            <p>Use the admin role only for canonical user and lead management.</p>
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">Quick links</p>
              <h2 className="mt-2 text-2xl font-semibold">Open the tutoring flow directly.</h2>
            </div>
            <Shield className="h-5 w-5 text-[#9a5b00]" />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/tutors" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
              Tutor workspace <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/parent-dashboard" className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:text-white">
              Parent view
            </Link>
            <Link href="/home" className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:text-white">
              Public home
            </Link>
          </div>
        </article>
      </section>
    </div>
  )
}
