'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Bell,
  CalendarClock,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Settings,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type NavId = 'dashboard' | 'students' | 'recaps' | 'progress' | 'schedule' | 'communication' | 'settings'
type StudentStatus = 'Improving' | 'Stable' | 'Declining'
type FilterKey = 'all' | 'improving' | 'stable' | 'declining'
type SortKey = 'name' | 'progress' | 'sessions' | 'next'
type PovKey = 'Demo POV' | 'Tutor POV' | 'Parent POV'
type SummaryTone = 'green' | 'amber' | 'red'

type NavItem = { id: NavId; label: string; icon: LucideIcon; badge?: number }
type Student = { id: string; initials: string; name: string; subject: string; grade: string; sessions: number; status: StudentStatus; progress: number; nextSession: string; recap: string; note: string }
type DraftStudent = { name: string; subject: string; grade: string; sessions: string; progress: string; nextSession: string; status: StudentStatus }

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'recaps', label: 'Recaps', icon: FileText },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'schedule', label: 'Schedule', icon: CalendarClock },
  { id: 'communication', label: 'Communication', icon: MessageSquare, badge: 3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const povItems: PovKey[] = ['Demo POV', 'Tutor POV', 'Parent POV']
const filterOptions: Array<{ key: FilterKey; label: string }> = [{ key: 'all', label: 'all' }, { key: 'improving', label: 'improving' }, { key: 'stable', label: 'stable' }, { key: 'declining', label: 'declining' }]
const sortOptions: Array<{ key: SortKey; label: string }> = [{ key: 'name', label: 'name' }, { key: 'progress', label: 'progress' }, { key: 'sessions', label: 'sessions' }, { key: 'next', label: 'next session' }]

const initialStudents: Student[] = [
  { id: 'aiko-sato', initials: 'AS', name: 'Aiko Sato', subject: 'Physics', grade: 'Grade 12', sessions: 31, status: 'Improving', progress: 93, nextSession: 'Thu 3:00 PM', recap: 'Strong exam pacing and clean free-body diagrams.', note: 'Push for a short quiz on rotational motion before Thursday.' },
  { id: 'hana-kobayashi', initials: 'HK', name: 'Hana Kobayashi', subject: 'Biology', grade: 'Grade 11', sessions: 9, status: 'Stable', progress: 68, nextSession: 'Mon 6:00 PM', recap: 'Cell signaling summary is solid after the last recap.', note: 'Keep the next session focused on plant transport vocabulary.' },
  { id: 'kenji-yamamoto', initials: 'KY', name: 'Kenji Yamamoto', subject: 'Chemistry', grade: 'Grade 10', sessions: 12, status: 'Declining', progress: 48, nextSession: 'Fri 2:00 PM', recap: 'Needs more practice balancing equations under time pressure.', note: 'Bring back the stoichiometry scaffold and a short timed drill.' },
  { id: 'lucia-martinez', initials: 'LM', name: 'Lucia Martinez', subject: 'Essay Writing', grade: 'Grade 11', sessions: 16, status: 'Declining', progress: 52, nextSession: 'Sat 10:00 AM', recap: 'Thesis statements are clearer but transitions still need work.', note: 'Review one essay intro and one paragraph structure example.' },
  { id: 'mina-park', initials: 'MP', name: 'Mina Park', subject: 'Algebra II', grade: 'Grade 9', sessions: 14, status: 'Improving', progress: 76, nextSession: 'Tue 4:30 PM', recap: 'Quadratic factoring has improved since the last worksheet.', note: 'Add a mixed-problem set to keep the progress curve moving.' },
  { id: 'noah-williams', initials: 'NW', name: 'Noah Williams', subject: 'Pre-Calculus', grade: 'Grade 12', sessions: 20, status: 'Stable', progress: 74, nextSession: 'Sun 3:00 PM', recap: 'Function transformations are holding steady.', note: 'Revisit limits before the next session to avoid drift.' },
  { id: 'omar-hassan', initials: 'OH', name: 'Omar Hassan', subject: 'World History', grade: 'Grade 10', sessions: 11, status: 'Stable', progress: 61, nextSession: 'Thu 5:00 PM', recap: 'Better chronology, but cause/effect links still need more depth.', note: 'Bring one map-based review and one timeline summary.' },
  { id: 'ryo-nakamura', initials: 'RN', name: 'Ryo Nakamura', subject: 'English', grade: 'Grade 11', sessions: 18, status: 'Declining', progress: 59, nextSession: 'Wed 5:30 PM', recap: 'Close reading improved slightly, but evidence selection is weak.', note: 'Practice one paragraph with direct evidence and commentary.' },
  { id: 'yuki-tanaka', initials: 'YT', name: 'Yuki Tanaka', subject: 'Mathematics', grade: 'Grade 10', sessions: 24, status: 'Improving', progress: 82, nextSession: 'Mon 4:00 PM', recap: 'Graph interpretation is reliable and getting faster.', note: 'Keep a short timed warm-up at the start of each session.' },
]

const progressLabel = (status: StudentStatus) => (status === 'Improving' ? '📈 Improving' : status === 'Declining' ? '📉 Declining' : '→ Stable')
const statusClasses = (status: StudentStatus) => (status === 'Improving' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700' : status === 'Declining' ? 'border-rose-500/20 bg-rose-500/10 text-rose-700' : 'border-amber-500/20 bg-amber-500/10 text-amber-700')
const summaryClasses = (tone: SummaryTone) => (tone === 'green' ? 'border-[#A7F3D0] bg-[#E6F4ED] text-[#2D6A4F]' : tone === 'red' ? 'border-[#FECACA] bg-[#FEE2E2] text-[#991B1B]' : 'border-[#FDE68A] bg-[#FEF3C7] text-[#92400E]')
const progressColor = (progress: number) => (progress >= 75 ? '#10B981' : progress >= 50 ? '#3B82F6' : '#EF4444')
const initialsForName = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('').slice(0, 2).padEnd(2, 'X')

function nextSessionKey(nextSession: string) {
  const [dayPart = '', timePart = '', period = ''] = nextSession.split(' ')
  const dayIndex = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].indexOf(dayPart.slice(0, 3).toLowerCase())
  const [hourText = '0', minuteText = '0'] = timePart.split(':')
  let hour = Number(hourText)
  const minute = Number(minuteText)
  if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12
  if (period.toUpperCase() === 'AM' && hour === 12) hour = 0
  return (dayIndex < 0 ? 99 : dayIndex) * 24 * 60 + hour * 60 + minute
}

function SidebarContent({ activeNav, activePov, onSelectNav, onSelectPov, onCloseMobile }: { activeNav: NavId; activePov: PovKey; onSelectNav: (id: NavId) => void; onSelectPov: (pov: PovKey) => void; onCloseMobile?: () => void }) {
  return (
    <>
      <div className="flex items-center gap-2 border-b border-[#F8F9FA] px-5 py-[21px] pb-[18px]"><div className="flex h-[30px] w-[30px] items-center justify-center rounded-[7px] bg-[#DF5B30] font-display text-[15px] text-white">E</div><span className="font-display text-[16.5px] tracking-[-0.3px] text-[#F8F9FA]">ElevateOS</span></div>
      <div className="flex items-center gap-2 border-b border-[#F8F9FA] px-5 py-[13px]"><div className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#DF5B30]/20 text-[11px] font-semibold text-[#DF5B30]">JC</div><div className="min-w-0"><div className="text-[13px] font-medium text-[#F8F9FA]">James Chen</div><div className="text-[11px] text-[#F8F9FA]/70">Tutor</div></div></div>
      <nav className="flex-1 overflow-y-auto px-[10px] py-[10px]"><div className="mb-[3px] mt-3 px-[10px] text-[10px] font-semibold uppercase tracking-[0.9px] text-[#9B9B9B]">Main</div>{navItems.map((item) => { const Icon = item.icon; const active = item.id === activeNav; return (<button key={item.id} type="button" onClick={() => { onSelectNav(item.id); onCloseMobile?.() }} className={['mb-px flex w-full items-center gap-[9px] rounded-[8px] px-[10px] py-[8.5px] text-[13px] font-[450] transition-colors', active ? 'bg-[#EFF6FF] text-[#3B82F6]' : 'text-[#F8F9FA] hover:bg-[#334155]'].join(' ')}><Icon className="h-[15px] w-[15px] shrink-0 opacity-60" /><span>{item.label}</span>{item.badge ? <span className="ml-auto rounded-full bg-[#DF5B30] px-[6px] py-[2px] text-[9.5px] font-semibold text-white">{item.badge}</span> : null}</button>) })}</nav>
      <div className="border-t border-[#F8F9FA] px-[10px] py-[12px]"><div className="mb-3 rounded-[12px] border border-[#334155] bg-[#111827] p-3"><div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.7px] text-[#9B9B9B]">POV</div><div className="flex flex-col gap-2">{povItems.map((label) => { const active = label === activePov; return (<button key={label} type="button" onClick={() => { onSelectPov(label); onCloseMobile?.() }} className={['rounded-[8px] border px-3 py-2 text-left text-[12px] font-medium transition-colors', active ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#3B82F6]' : 'border-[#334155] bg-[#1E293B] text-[#F8F9FA] hover:bg-[#334155]'].join(' ')}>{label}</button>) })}</div></div><Link href="/auth/login" onClick={() => onCloseMobile?.()} className="flex items-center gap-[9px] rounded-[8px] px-[10px] py-[8.5px] text-[13px] font-[450] text-[#F8F9FA] transition-colors hover:bg-[#334155]"><LogOut className="h-[15px] w-[15px] shrink-0 opacity-60" /><span>Sign Out</span></Link></div>
    </>
  )
}

function MenuButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={['flex h-[34px] items-center gap-1 rounded-[8px] border px-[11px] py-[6px] text-[12px] font-medium transition-colors', active ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#3B82F6]' : 'border-[#E9ECEF] bg-white text-[#4A4A4A] hover:bg-[#F8F9FA]'].join(' ')}>{label}<ChevronDown className="h-3.5 w-3.5" /></button>
}

export default function TutoringDashboardClient() {
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [query, setQuery] = useState('')
  const [filterKey, setFilterKey] = useState<FilterKey>('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [activePov, setActivePov] = useState<PovKey>('Tutor POV')
  const [activeNav, setActiveNav] = useState<NavId>('students')
  const [selectedId, setSelectedId] = useState(initialStudents[0].id)
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)
  const [sortMenuOpen, setSortMenuOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [draft, setDraft] = useState<DraftStudent>({ name: '', subject: '', grade: '', sessions: '', progress: '', nextSession: '', status: 'Stable' })

  const visibleStudents = students.filter((student) => {
    const needle = query.trim().toLowerCase()
    const matchesQuery = !needle || [student.name, student.subject, student.grade, student.nextSession, student.recap, student.note].join(' ').toLowerCase().includes(needle)
    const matchesFilter = filterKey === 'all' || (filterKey === 'improving' && student.status === 'Improving') || (filterKey === 'stable' && student.status === 'Stable') || (filterKey === 'declining' && student.status === 'Declining')
    return matchesQuery && matchesFilter
  }).sort((left, right) => {
    if (sortKey === 'progress') return right.progress - left.progress || left.name.localeCompare(right.name)
    if (sortKey === 'sessions') return right.sessions - left.sessions || left.name.localeCompare(right.name)
    if (sortKey === 'next') return nextSessionKey(left.nextSession) - nextSessionKey(right.nextSession) || left.name.localeCompare(right.name)
    return left.name.localeCompare(right.name)
  })

  const selectedStudent = visibleStudents.find((student) => student.id === selectedId) ?? visibleStudents[0] ?? null
  const activeModule = navItems.find((item) => item.id === activeNav)?.label ?? 'Students'
  const summaryStudents = visibleStudents.length > 0 ? visibleStudents : students
  const accelerating = summaryStudents.filter((student) => student.status === 'Improving').length
  const steady = summaryStudents.filter((student) => student.status === 'Stable').length
  const intervention = summaryStudents.filter((student) => student.status === 'Declining').length
  const averageProgress = summaryStudents.length > 0 ? (summaryStudents.reduce((sum, student) => sum + student.progress, 0) / summaryStudents.length).toFixed(1) : null

  const clearFilters = () => { setQuery(''); setFilterKey('all'); setSortKey('name'); setFilterMenuOpen(false); setSortMenuOpen(false) }

  const submitStudentDraft = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = draft.name.trim()
    if (!name) return

    const sessions = Math.max(0, Number.parseInt(draft.sessions, 10) || 0)
    const progress = Math.max(0, Math.min(100, Number.parseInt(draft.progress, 10) || 0))
    const id = `student-${Date.now()}`
    const nextStudent: Student = { id, initials: initialsForName(name), name, subject: draft.subject.trim() || 'Subject', grade: draft.grade.trim() || 'Grade', sessions, status: draft.status, progress, nextSession: draft.nextSession.trim() || 'TBD', recap: 'New student added from the tutoring dashboard.', note: 'Follow up with an intake recap and a first homework list.' }

    setStudents((current) => [nextStudent, ...current])
    setSelectedId(id)
    setDraft({ name: '', subject: '', grade: '', sessions: '', progress: '', nextSession: '', status: 'Stable' })
    setAddOpen(false)
  }

  return (
    <div className="relative flex min-h-[100svh] overflow-hidden bg-[#1E293B] text-[#F8F9FA]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(223,91,48,0.08),transparent_28%),radial-gradient(circle_at_90%_20%,rgba(255,255,255,0.03),transparent_24%)]" />
      <aside className="hidden w-[220px] shrink-0 flex-col border-r border-[#334155] bg-[#1E293B] lg:flex"><SidebarContent activeNav={activeNav} activePov={activePov} onSelectNav={setActiveNav} onSelectPov={setActivePov} /></aside>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[58px] shrink-0 items-center gap-3 border-b border-[#334155] bg-[#1E293B] px-6">
          <button type="button" className="mr-1 rounded-[6px] p-2 text-[#F8F9FA] transition-colors hover:bg-[#334155] lg:hidden" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button>
          <div className="font-display flex-1 text-[18px] tracking-[-0.3px] text-[#F8F9FA]">Students</div>
          <label className="hidden w-[220px] items-center gap-[7px] rounded-[8px] border border-[#E9ECEF] bg-[#F8F9FA] px-[11px] py-[6px] text-[#6B6B6B] focus-within:border-[#DF5B30] lg:flex"><Search className="h-[13px] w-[13px] shrink-0 text-[#9B9B9B]" /><input className="w-full bg-transparent text-[13px] text-[#1A1A1A] outline-none placeholder:text-[#9B9B9B]" placeholder="Search students, sessions…" aria-label="Search students and sessions" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <div className="flex items-center gap-[7px]"><button type="button" className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#E9ECEF] bg-[#F8F9FA] text-[#6B6B6B] transition-colors hover:bg-[#E9ECEF] hover:text-[#1A1A1A]" aria-label="Create new item" onClick={() => setAddOpen((current) => !current)}><Plus className="h-[14px] w-[14px]" /></button><button type="button" className="relative flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#E9ECEF] bg-[#F8F9FA] text-[#6B6B6B] transition-colors hover:bg-[#E9ECEF] hover:text-[#1A1A1A]" aria-label="Notifications"><Bell className="h-[14px] w-[14px]" /><span className="absolute right-[5px] top-[5px] h-[6px] w-[6px] rounded-full border border-[#F1F3F4] bg-[#DF5B30]" /></button></div>
        </header>
        <div className="flex min-w-0 flex-1 overflow-hidden bg-[#F8F9FA]">
          <main className="min-w-0 flex-1 overflow-y-auto p-6">
            <section className="mb-4 flex items-start justify-between gap-4"><div><div className="text-[10.5px] font-semibold uppercase tracking-[0.7px] text-[#9B9B9B]">Students</div><div className="mt-1 font-display text-[20px] tracking-[-0.3px] text-[#1A1A1A]">Your current roster</div><div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#4A4A4A]"><span className="rounded-full border border-[#E9ECEF] bg-white px-3 py-1">Active module: {activeModule}</span><span className="rounded-full border border-[#E9ECEF] bg-white px-3 py-1">Viewing: {activePov}</span>{query || filterKey !== 'all' || sortKey !== 'name' ? (<button type="button" onClick={clearFilters} className="rounded-full border border-[#E9ECEF] bg-white px-3 py-1 text-[#DF5B30] transition-colors hover:bg-[#F8F9FA]">Clear filters</button>) : null}</div></div><button type="button" className="inline-flex items-center gap-2 rounded-[8px] bg-[#3B82F6] px-[15px] py-[8px] text-[13px] font-medium text-white transition-colors hover:bg-[#60A5FA]" onClick={() => setAddOpen((current) => !current)}><Plus className="h-4 w-4" />Add Student</button></section>
            {addOpen ? (
              <section className="mb-4 rounded-[16px] border border-[#E9ECEF] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"><div className="mb-4 flex items-center justify-between gap-3"><div><div className="text-[10.5px] font-semibold uppercase tracking-[0.7px] text-[#9B9B9B]">Quick add</div><div className="mt-1 font-display text-[16px] tracking-[-0.3px] text-[#1A1A1A]">Add a new student locally</div></div><button type="button" onClick={() => setAddOpen(false)} className="rounded-full border border-[#E9ECEF] px-3 py-1.5 text-[12px] font-medium text-[#4A4A4A] transition-colors hover:bg-[#F8F9FA]">Hide</button></div><form className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" onSubmit={submitStudentDraft}><label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#4A4A4A]">Name<input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} className="rounded-[8px] border border-[#E9ECEF] px-3 py-2 text-[13px] text-[#1A1A1A] outline-none focus:border-[#3B82F6]" placeholder="Student name" /></label><label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#4A4A4A]">Subject<input value={draft.subject} onChange={(event) => setDraft((current) => ({ ...current, subject: event.target.value }))} className="rounded-[8px] border border-[#E9ECEF] px-3 py-2 text-[13px] text-[#1A1A1A] outline-none focus:border-[#3B82F6]" placeholder="Physics" /></label><label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#4A4A4A]">Grade<input value={draft.grade} onChange={(event) => setDraft((current) => ({ ...current, grade: event.target.value }))} className="rounded-[8px] border border-[#E9ECEF] px-3 py-2 text-[13px] text-[#1A1A1A] outline-none focus:border-[#3B82F6]" placeholder="Grade 11" /></label><label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#4A4A4A]">Sessions<input value={draft.sessions} onChange={(event) => setDraft((current) => ({ ...current, sessions: event.target.value }))} type="number" min="0" className="rounded-[8px] border border-[#E9ECEF] px-3 py-2 text-[13px] text-[#1A1A1A] outline-none focus:border-[#3B82F6]" placeholder="12" /></label><label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#4A4A4A]">Progress<input value={draft.progress} onChange={(event) => setDraft((current) => ({ ...current, progress: event.target.value }))} type="number" min="0" max="100" className="rounded-[8px] border border-[#E9ECEF] px-3 py-2 text-[13px] text-[#1A1A1A] outline-none focus:border-[#3B82F6]" placeholder="72" /></label><label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#4A4A4A]">Next session<input value={draft.nextSession} onChange={(event) => setDraft((current) => ({ ...current, nextSession: event.target.value }))} className="rounded-[8px] border border-[#E9ECEF] px-3 py-2 text-[13px] text-[#1A1A1A] outline-none focus:border-[#3B82F6]" placeholder="Thu 4:00 PM" /></label><label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#4A4A4A]">Status<select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as StudentStatus }))} className="rounded-[8px] border border-[#E9ECEF] bg-white px-3 py-2 text-[13px] text-[#1A1A1A] outline-none focus:border-[#3B82F6]"><option value="Improving">Improving</option><option value="Stable">Stable</option><option value="Declining">Declining</option></select></label><div className="flex items-end gap-2 md:col-span-2 xl:col-span-3"><button type="submit" className="inline-flex items-center gap-2 rounded-[8px] bg-[#3B82F6] px-[15px] py-[8px] text-[13px] font-medium text-white transition-colors hover:bg-[#60A5FA]"><Plus className="h-4 w-4" />Save Student</button><button type="button" onClick={() => setAddOpen(false)} className="rounded-[8px] border border-[#E9ECEF] bg-white px-[15px] py-[8px] text-[13px] font-medium text-[#4A4A4A] transition-colors hover:bg-[#F8F9FA]">Cancel</button></div></form></section>
            ) : null}

            <section className="overflow-hidden rounded-[16px] border border-[#E9ECEF] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E9ECEF] px-[18px] py-[15px]"><div className="font-display text-[14px] text-[#1E293B]">All Students ({visibleStudents.length})</div><div className="flex items-center gap-[7px]"><div className="relative"><MenuButton label={`Filter: ${filterKey}`} active={filterMenuOpen} onClick={() => { setFilterMenuOpen((current) => !current); setSortMenuOpen(false) }} />{filterMenuOpen ? (<div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-[12px] border border-[#E9ECEF] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.14)]">{filterOptions.map((option) => (<button key={option.key} type="button" onClick={() => { setFilterKey(option.key); setFilterMenuOpen(false) }} className={['flex w-full items-center justify-between px-4 py-3 text-left text-[13px] transition-colors hover:bg-[#F8F9FA]', filterKey === option.key ? 'font-semibold text-[#3B82F6]' : 'text-[#1E293B]'].join(' ')}><span>{option.label}</span>{filterKey === option.key ? <span className="text-[11px]">Selected</span> : null}</button>))}</div>) : null}</div><div className="relative"><MenuButton label={`Sort: ${sortOptions.find((option) => option.key === sortKey)?.label ?? 'name'}`} active={sortMenuOpen} onClick={() => { setSortMenuOpen((current) => !current); setFilterMenuOpen(false) }} />{sortMenuOpen ? (<div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-[12px] border border-[#E9ECEF] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.14)]">{sortOptions.map((option) => (<button key={option.key} type="button" onClick={() => { setSortKey(option.key); setSortMenuOpen(false) }} className={['flex w-full items-center justify-between px-4 py-3 text-left text-[13px] transition-colors hover:bg-[#F8F9FA]', sortKey === option.key ? 'font-semibold text-[#3B82F6]' : 'text-[#1E293B]'].join(' ')}><span>{option.label}</span>{sortKey === option.key ? <span className="text-[11px]">Selected</span> : null}</button>))}</div>) : null}</div></div></div>
              <div className="overflow-x-auto"><table className="min-w-full border-collapse"><thead><tr className="bg-[#F8F9FA]">{['Student', 'Subject', 'Grade', 'Sessions', 'Status', 'Progress', 'Next Session', ''].map((heading) => (<th key={heading || 'actions'} className="px-[18px] py-[9px] text-left text-[10.5px] font-semibold uppercase tracking-[0.5px] text-[#9B9B9B]">{heading}</th>))}</tr></thead><tbody>{visibleStudents.length > 0 ? visibleStudents.map((student) => { const isSelected = student.id === selectedStudent?.id; return (<tr key={student.id} className={['border-t border-[#F8F9FA] transition-colors', isSelected ? 'bg-[#EFF6FF]' : 'hover:bg-[#F8F9FA]'].join(' ')}><td className="px-[18px] py-[12px]"><div className="flex items-center gap-[9px]"><div className="flex h-[32px] w-[32px] items-center justify-center rounded-full text-[11px] font-semibold" style={{ backgroundColor: `${student.status === 'Declining' ? '#EF4444' : student.status === 'Improving' ? '#10B981' : '#DF5B30'}18`, color: student.status === 'Declining' ? '#EF4444' : student.status === 'Improving' ? '#10B981' : '#DF5B30' }}>{student.initials}</div><button type="button" onClick={() => setSelectedId(student.id)} className="text-left text-[13.5px] font-medium text-[#1A1A1A] transition-colors hover:text-[#3B82F6]">{student.name}</button></div></td><td className="px-[18px] py-[12px]"><span className="inline-flex rounded-full bg-[#F8F9FA] px-3 py-1 text-[11px] font-medium text-[#1E293B]">{student.subject}</span></td><td className="px-[18px] py-[12px] text-[13px] text-[#6B6B6B]">{student.grade}</td><td className="px-[18px] py-[12px] text-[13.5px] font-medium text-[#1A1A1A]">{student.sessions}</td><td className="px-[18px] py-[12px]"><span className={['inline-flex rounded-full border px-[9px] py-[3px] text-[11px] font-semibold', statusClasses(student.status)].join(' ')}>{progressLabel(student.status)}</span></td><td className="px-[18px] py-[12px]"><div className="flex items-center gap-2"><div className="h-[5px] w-[70px] overflow-hidden rounded-full bg-[#E9ECEF]"><div className="h-full rounded-full" style={{ width: `${student.progress}%`, backgroundColor: progressColor(student.progress) }} /></div><span className="text-[11.5px] font-semibold text-[#4A4A4A]">{student.progress}%</span></div></td><td className="px-[18px] py-[12px] text-[12.5px] font-medium text-[#DF5B30]">{student.nextSession}</td><td className="px-[12px] py-[12px]"><button type="button" onClick={() => setSelectedId(student.id)} className="rounded-[8px] border border-[#E9ECEF] bg-white px-[11px] py-[6px] text-[12px] font-medium text-[#1E293B] transition-colors hover:bg-[#F8F9FA]">View</button></td></tr>) }) : (<tr><td className="px-[18px] py-[24px]" colSpan={8}><div className="rounded-[12px] border border-dashed border-[#E9ECEF] bg-[#F8F9FA] p-6 text-center"><p className="text-[14px] font-semibold text-[#1E293B]">No students match the current filter.</p><p className="mt-1 text-[12px] text-[#6B6B6B]">Try a broader search or clear the filter to restore the full roster.</p><button type="button" onClick={clearFilters} className="mt-4 inline-flex items-center gap-2 rounded-[8px] bg-[#3B82F6] px-[15px] py-[8px] text-[13px] font-medium text-white transition-colors hover:bg-[#60A5FA]">Reset view</button></div></td></tr>)}</tbody></table></div></section>
          </main>
          <aside className="hidden w-[272px] shrink-0 overflow-y-auto border-l border-[#E9ECEF] bg-[#F1F3F4] p-5 xl:block"><div className="mb-5 rounded-[8px] border border-[#E9ECEF] bg-white p-[10px]"><div className="text-[10px] font-semibold uppercase tracking-[0.7px] text-[#9B9B9B]">Current context</div><div className="mt-2 text-[12px] font-semibold text-[#1E293B]">{activeModule} / {activePov}</div><div className="mt-1 text-[11px] leading-5 text-[#6B6B6B]">Search, filter, sort, and add a student locally to test the tutoring workflow without leaving the page.</div></div><div className="mb-6"><div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.7px] text-[#9B9B9B]">Status Summary</div><div className="space-y-3">{[{ label: 'Accelerating', value: accelerating.toString(), tone: 'green' as const }, { label: 'Steady', value: steady.toString(), tone: 'amber' as const }, { label: 'Intervention Plan', value: intervention.toString(), tone: 'red' as const }].map((item) => (<div key={item.label} className={['rounded-[8px] border p-[10px]', summaryClasses(item.tone)].join(' ')}><div className="text-[12px] font-semibold">{item.label}: {item.value}</div></div>))}</div></div><div className="rounded-[8px] border border-[#E9ECEF] bg-white p-[10px]"><div className="text-[12px] font-semibold text-[#4A4A4A]">📊 Avg Progress</div><div className="mt-1 text-[22px] font-bold text-[#3B82F6]">{averageProgress ? `${averageProgress}%` : '—'}</div><div className="mt-1 text-[11px] text-[#6B6B6B]">Showing {visibleStudents.length} of {students.length} students</div></div><div className="mt-5 rounded-[8px] border border-[#E9ECEF] bg-white p-[10px]"><div className="mb-3 flex items-center justify-between gap-3"><div className="text-[12px] font-semibold text-[#4A4A4A]">Selected student</div>{selectedStudent ? (<button type="button" onClick={() => setSelectedId(selectedStudent.id)} className="inline-flex items-center gap-1 rounded-full border border-[#E9ECEF] px-2 py-1 text-[11px] font-medium text-[#3B82F6]"><ArrowRight className="h-3 w-3" />Focus</button>) : null}</div>{selectedStudent ? (<div className="space-y-3"><div className="flex items-center gap-3"><div className="flex h-[36px] w-[36px] items-center justify-center rounded-full text-[11px] font-semibold" style={{ backgroundColor: `${selectedStudent.status === 'Declining' ? '#EF4444' : selectedStudent.status === 'Improving' ? '#10B981' : '#DF5B30'}18`, color: selectedStudent.status === 'Declining' ? '#EF4444' : selectedStudent.status === 'Improving' ? '#10B981' : '#DF5B30' }}>{selectedStudent.initials}</div><div><div className="text-[13px] font-semibold text-[#1A1A1A]">{selectedStudent.name}</div><div className="text-[11px] text-[#6B6B6B]">{selectedStudent.subject} · {selectedStudent.grade}</div></div></div><div className="rounded-[8px] border border-[#E9ECEF] bg-[#F8F9FA] p-3 text-[12px] leading-5 text-[#4A4A4A]">{selectedStudent.recap}</div><div className="grid grid-cols-2 gap-2 text-[11px]"><div className="rounded-[8px] border border-[#E9ECEF] bg-white p-2"><div className="text-[#9B9B9B]">Sessions</div><div className="mt-1 font-semibold text-[#1A1A1A]">{selectedStudent.sessions}</div></div><div className="rounded-[8px] border border-[#E9ECEF] bg-white p-2"><div className="text-[#9B9B9B]">Progress</div><div className="mt-1 font-semibold text-[#1A1A1A]">{selectedStudent.progress}%</div></div><div className="rounded-[8px] border border-[#E9ECEF] bg-white p-2"><div className="text-[#9B9B9B]">Status</div><div className="mt-1 font-semibold text-[#1A1A1A]">{progressLabel(selectedStudent.status)}</div></div><div className="rounded-[8px] border border-[#E9ECEF] bg-white p-2"><div className="text-[#9B9B9B]">Next</div><div className="mt-1 font-semibold text-[#1A1A1A]">{selectedStudent.nextSession}</div></div></div><div className="rounded-[8px] border border-[#E9ECEF] bg-white p-3 text-[12px] leading-5 text-[#4A4A4A]"><span className="font-semibold text-[#1A1A1A]">Next note:</span> {selectedStudent.note}</div></div>) : <p className="text-[12px] leading-5 text-[#6B6B6B]">No student matches the current filter. Clear the view or add a new student to continue.</p>}</div></aside>
        </div>
      </div>

      {mobileOpen ? (<div className="fixed inset-0 z-50 lg:hidden"><button type="button" className="absolute inset-0 bg-slate-950/60" aria-label="Close navigation" onClick={() => setMobileOpen(false)} /><aside className="relative flex h-full w-[84vw] max-w-[280px] flex-col overflow-y-auto border-r border-[#334155] bg-[#1E293B] shadow-2xl"><div className="flex items-center justify-end px-4 py-3"><button type="button" onClick={() => setMobileOpen(false)} className="rounded-full p-2 text-[#F8F9FA] transition-colors hover:bg-[#334155]" aria-label="Close navigation panel"><X className="h-5 w-5" /></button></div><SidebarContent activeNav={activeNav} activePov={activePov} onSelectNav={setActiveNav} onSelectPov={setActivePov} onCloseMobile={() => setMobileOpen(false)} /></aside></div>) : null}
    </div>
  )
}
