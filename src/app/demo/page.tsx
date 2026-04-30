'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CalendarClock,
  CheckCircle2,
  FileText,
  GraduationCap,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'

const TABS = [
  { id: 'study', label: 'Study Assistant', icon: BookOpen },
  { id: 'worksheets', label: 'Worksheets', icon: FileText },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'admissions', label: 'Admissions', icon: GraduationCap },
  { id: 'planner', label: 'Planner', icon: CalendarClock },
]

const STUDY_MESSAGES = [
  {
    role: 'user',
    text: 'I have a chemistry exam next week on organic reactions — can you help me prioritize?',
  },
  {
    role: 'assistant',
    text: `Based on your recent worksheet scores and weak-area report, I'd suggest this order:\n\n1. **Nucleophilic substitution (SN1/SN2)** — you scored 54% last time. High exam weight.\n2. **Elimination reactions (E1/E2)** — closely related, easy wins once SN mechanisms click.\n3. **Carbonyl chemistry** — you're already at 78% here, so one review session should hold that.\n\nWant me to generate a focused worksheet on SN1 vs SN2 now?`,
  },
  {
    role: 'user',
    text: 'Yes please, make it challenging.',
  },
  {
    role: 'assistant',
    text: 'Generating a 12-question SN1/SN2 worksheet at A-level difficulty — includes mechanism drawing, stereochemistry, and rate-law prediction. Ready in a moment.',
  },
]

const WORKSHEET_QUESTIONS = [
  {
    q: '1. Draw the mechanism for the SN2 reaction of (R)-2-bromobutane with NaOH. What is the configuration of the product?',
    tag: 'Mechanism · Stereochemistry',
    difficulty: 'Hard',
  },
  {
    q: '2. Explain why tertiary alkyl halides do not undergo SN2 reactions. Include steric arguments.',
    tag: 'Conceptual',
    difficulty: 'Medium',
  },
  {
    q: '3. Predict whether each substrate undergoes SN1 or SN2 with CN⁻ in DMSO: (a) CH₃Br (b) (CH₃)₃CBr (c) (CH₃)₂CHBr',
    tag: 'Prediction · Multi-part',
    difficulty: 'Hard',
  },
  {
    q: '4. A reaction shows first-order kinetics and racemisation of the product. Identify the mechanism and justify.',
    tag: 'Kinetics · Analysis',
    difficulty: 'Hard',
  },
]

const PROGRESS_SUBJECTS = [
  { name: 'Chemistry', score: 72, change: +8, sessions: 14 },
  { name: 'Mathematics', score: 88, change: +3, sessions: 21 },
  { name: 'Physics', score: 61, change: -2, sessions: 9 },
  { name: 'Biology', score: 79, change: +5, sessions: 11 },
]

const WEAK_AREAS = [
  { topic: 'SN1/SN2 Mechanisms', subject: 'Chemistry', score: 54 },
  { topic: 'Integration by Parts', subject: 'Mathematics', score: 63 },
  { topic: 'Wave Optics', subject: 'Physics', score: 49 },
]

const UNIVERSITIES = [
  { name: 'University of Tokyo', status: 'In Progress', deadline: 'Jan 15', essays: 2, complete: 1 },
  { name: 'Waseda University', status: 'Draft', deadline: 'Feb 1', essays: 3, complete: 0 },
  { name: 'Keio University', status: 'Not Started', deadline: 'Mar 1', essays: 2, complete: 0 },
]

const PLANNER_DAYS = [
  { day: 'Mon', slots: ['Chemistry', 'Mathematics'], busy: false },
  { day: 'Tue', slots: [], busy: true },
  { day: 'Wed', slots: ['Physics', 'Essay Review'], busy: false },
  { day: 'Thu', slots: ['Chemistry'], busy: false },
  { day: 'Fri', slots: [], busy: true },
  { day: 'Sat', slots: ['Mock Exam', 'Review'], busy: false },
  { day: 'Sun', slots: ['Free'], busy: false },
]

function StudyTab() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="rounded-[1.5rem] border border-slate-900/10 bg-white dark:border-white/10 dark:bg-slate-900/70 overflow-hidden">
        <div className="border-b border-slate-900/10 dark:border-white/10 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-slate-950 dark:bg-white flex items-center justify-center">
              <Brain className="h-4 w-4 text-white dark:text-slate-950" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Study Assistant</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Chemistry · A-Level</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-500/20 dark:text-emerald-400">
            Active session
          </span>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-80 overflow-y-auto">
          {STUDY_MESSAGES.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 ${
                msg.role === 'user'
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 rounded-br-md'
                  : 'bg-[#f8f5ef] border border-slate-900/10 text-slate-800 dark:bg-slate-800/60 dark:border-white/10 dark:text-slate-100 rounded-bl-md'
              }`}>
                {msg.text.split('\n').map((line, j) => (
                  <span key={j}>
                    {line.split(/\*\*(.*?)\*\*/g).map((part, k) =>
                      k % 2 === 1 ? <strong key={k}>{part}</strong> : part
                    )}
                    {j < msg.text.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-900/10 dark:border-white/10 px-4 py-3 flex gap-2">
          <div className="flex-1 rounded-xl border border-slate-900/10 bg-[#f8f5ef] dark:border-white/10 dark:bg-white/5 px-4 py-2.5 text-sm text-slate-400 dark:text-slate-500">
            Ask a follow-up question…
          </div>
          <button className="rounded-xl bg-slate-950 dark:bg-white px-4 py-2.5">
            <ArrowRight className="h-4 w-4 text-white dark:text-slate-950" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-slate-900/10 bg-white dark:border-white/10 dark:bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-3">Session context</p>
          <div className="space-y-2">
            {[['Student', 'Yuki Tanaka'], ['Subject', 'Chemistry'], ['Topic', 'Organic Reactions'], ['Level', 'A-Level / IB HL']].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">{k}</span>
                <span className="font-medium text-slate-950 dark:text-white">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[#d97706]/20 bg-[#fef3c7]/40 dark:border-[#d97706]/20 dark:bg-[#d97706]/5 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-[#d97706]" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d97706]">AI suggested</p>
          </div>
          <p className="text-sm font-medium text-slate-950 dark:text-white">Generate SN1/SN2 worksheet</p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Based on 54% score in last 3 sessions</p>
          <button className="mt-3 w-full rounded-xl bg-[#d97706] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b45309] transition-colors">
            Generate now
          </button>
        </div>
      </div>
    </div>
  )
}

function WorksheetsTab() {
  return (
    <div className="rounded-[1.5rem] border border-slate-900/10 bg-white dark:border-white/10 dark:bg-slate-900/70 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Generated worksheet</p>
          <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">SN1 vs SN2 Mechanisms — A-Level Chemistry</p>
        </div>
        <div className="flex gap-2">
          <span className="rounded-full border border-slate-900/10 dark:border-white/10 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">12 questions</span>
          <span className="rounded-full bg-red-50 border border-red-200/60 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:border-red-500/20 dark:text-red-400">Hard</span>
        </div>
      </div>

      <div className="space-y-3">
        {WORKSHEET_QUESTIONS.map((q, i) => (
          <div key={i} className="rounded-xl border border-slate-900/10 bg-[#f8f5ef] dark:border-white/10 dark:bg-white/5 p-4">
            <p className="text-sm leading-7 text-slate-800 dark:text-slate-100">{q.q}</p>
            <div className="mt-2 flex gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/50 border border-slate-900/10 dark:border-white/10 px-2 py-0.5 rounded-full">{q.tag}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${q.difficulty === 'Hard' ? 'text-red-700 bg-red-50 border-red-200/60 dark:text-red-400 dark:bg-red-900/20 dark:border-red-500/20' : 'text-amber-700 bg-amber-50 border-amber-200/60 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-500/20'}`}>{q.difficulty}</span>
            </div>
          </div>
        ))}
        <div className="rounded-xl border border-dashed border-slate-900/15 dark:border-white/15 p-4 text-center text-sm text-slate-400 dark:text-slate-500">
          + 8 more questions…
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="flex-1 rounded-xl bg-slate-950 dark:bg-white px-4 py-2.5 text-sm font-semibold text-white dark:text-slate-950 hover:opacity-90 transition-opacity">
          Assign to student
        </button>
        <button className="rounded-xl border border-slate-900/10 dark:border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
          Export PDF
        </button>
      </div>
    </div>
  )
}

function ProgressTab() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
      <div className="rounded-[1.5rem] border border-slate-900/10 bg-white dark:border-white/10 dark:bg-slate-900/70 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-4">Subject performance</p>
        <div className="space-y-4">
          {PROGRESS_SUBJECTS.map((s) => (
            <div key={s.name}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-medium text-slate-950 dark:text-white">{s.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${s.change > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                    {s.change > 0 ? '+' : ''}{s.change}%
                  </span>
                  <span className="font-semibold text-slate-950 dark:text-white">{s.score}%</span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${s.score}%`,
                    background: s.score >= 80 ? '#10b981' : s.score >= 65 ? '#d97706' : '#ef4444',
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{s.sessions} sessions logged</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-slate-900/10 bg-slate-950 dark:border-white/10 p-5 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">Execution score</p>
          <div className="mt-2 flex items-end gap-2">
            <p className="text-5xl font-semibold">84</p>
            <p className="pb-1.5 text-sm text-white/60">/ 100</p>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-[84%] rounded-full bg-[#f2c06d]" />
          </div>
          <p className="mt-3 text-xs text-white/50">+6 pts this month · on track for target schools</p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-900/10 bg-white dark:border-white/10 dark:bg-slate-900/70 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-[#d97706]" />
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Weak areas</p>
          </div>
          <div className="space-y-2">
            {WEAK_AREAS.map((w) => (
              <div key={w.topic} className="flex items-center justify-between rounded-xl border border-slate-900/10 dark:border-white/10 bg-[#f8f5ef] dark:bg-white/5 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-slate-950 dark:text-white">{w.topic}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{w.subject}</p>
                </div>
                <span className="rounded-full bg-red-50 border border-red-200/60 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/20 dark:border-red-500/20 dark:text-red-400">
                  {w.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AdmissionsTab() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        {UNIVERSITIES.map((u) => (
          <div key={u.name} className="rounded-[1.5rem] border border-slate-900/10 bg-white dark:border-white/10 dark:bg-slate-900/70 p-5">
            <div className="flex items-start justify-between">
              <GraduationCap className="h-5 w-5 text-[#d97706] mt-0.5" />
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                u.status === 'In Progress'
                  ? 'border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-900/20 dark:text-amber-400'
                  : u.status === 'Draft'
                  ? 'border-blue-200/60 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'
              }`}>{u.status}</span>
            </div>
            <p className="mt-3 font-semibold text-slate-950 dark:text-white">{u.name}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Deadline: {u.deadline}</p>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Essays</span>
                <span>{u.complete}/{u.essays} complete</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#d97706]"
                  style={{ width: u.essays ? `${(u.complete / u.essays) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[1.5rem] border border-slate-900/10 bg-white dark:border-white/10 dark:bg-slate-900/70 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-[#d97706]" />
          <p className="text-sm font-semibold text-slate-950 dark:text-white">AI essay feedback — University of Tokyo · Personal Statement</p>
        </div>
        <div className="rounded-xl bg-[#f8f5ef] dark:bg-white/5 border border-slate-900/10 dark:border-white/10 p-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
          Your opening paragraph establishes strong motivation but the transition to your research interest in computational chemistry feels abrupt. Consider bridging your early curiosity in high school lab work to your specific interest in molecular simulation — this will make the progression feel earned rather than stated.
          <br /><br />
          <span className="font-medium text-slate-950 dark:text-white">Strength:</span> specific detail on your independent reading is compelling.{' '}
          <span className="font-medium text-slate-950 dark:text-white">Action item:</span> tighten paragraph 3 — it restates paragraph 1.
        </div>
      </div>
    </div>
  )
}

function PlannerTab() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <div className="rounded-[1.5rem] border border-slate-900/10 bg-white dark:border-white/10 dark:bg-slate-900/70 p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-slate-950 dark:text-white">Week of 30 Apr — 6 May</p>
          <span className="text-xs text-slate-500 dark:text-slate-400">4 study days · 3 open slots</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {PLANNER_DAYS.map((d) => (
            <div key={d.day} className="space-y-2">
              <p className="text-xs font-semibold text-center text-slate-500 dark:text-slate-400">{d.day}</p>
              {d.busy ? (
                <div className="rounded-xl border border-dashed border-slate-900/10 dark:border-white/10 p-2 min-h-[80px] flex items-center justify-center">
                  <p className="text-xs text-slate-300 dark:text-slate-600 text-center">Busy</p>
                </div>
              ) : d.slots.length === 0 ? (
                <div className="rounded-xl border border-dashed border-emerald-200 dark:border-emerald-700/40 p-2 min-h-[80px] flex items-center justify-center">
                  <p className="text-xs text-emerald-500 text-center">Free</p>
                </div>
              ) : (
                <div className="space-y-1.5 min-h-[80px]">
                  {d.slots.map((slot) => (
                    <div key={slot} className="rounded-lg bg-[#f2c06d]/20 border border-[#d97706]/20 px-2 py-1.5">
                      <p className="text-xs font-medium text-[#9a5b00] dark:text-[#f5d59f] leading-tight">{slot}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-slate-900/10 bg-white dark:border-white/10 dark:bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-3">Upcoming deadlines</p>
          <div className="space-y-2">
            {[
              { label: 'Chemistry mock exam', date: 'May 3', urgent: true },
              { label: 'UTokyo essay draft', date: 'May 7', urgent: false },
              { label: 'Physics problem set', date: 'May 10', urgent: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-900/10 dark:border-white/10 bg-[#f8f5ef] dark:bg-white/5 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  {item.urgent && <div className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />}
                  <p className="text-sm font-medium text-slate-950 dark:text-white">{item.label}</p>
                </div>
                <span className={`text-xs font-medium shrink-0 ${item.urgent ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-900/10 bg-slate-950 dark:border-white/10 p-5 text-white">
          <Zap className="h-5 w-5 text-[#f2c06d] mb-2" />
          <p className="text-sm font-semibold">Next best action</p>
          <p className="mt-1 text-xs text-white/60">Run SN1/SN2 worksheet before Thursday — aligns with Chemistry mock on May 3.</p>
          <button className="mt-3 w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition-colors">
            Open worksheet
          </button>
        </div>
      </div>
    </div>
  )
}

const TAB_CONTENT: Record<string, () => JSX.Element> = {
  study: StudyTab,
  worksheets: WorksheetsTab,
  progress: ProgressTab,
  admissions: AdmissionsTab,
  planner: PlannerTab,
}

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState('study')
  const ActiveContent = TAB_CONTENT[activeTab]

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f5ef] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[#f2c06d]/25 blur-3xl" />
        <div className="absolute right-[-8rem] top-32 h-80 w-80 rounded-full bg-slate-900/10 blur-3xl dark:bg-[#1f2f54]/40" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-slate-900/5 bg-[#f8f5ef]/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-[#f8f5ef] dark:bg-white dark:text-slate-950">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-lg text-slate-950 dark:text-white">ElevateOS</p>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Product demo</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/" className="hidden rounded-full border border-slate-900/10 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:text-white sm:inline-flex">
              ← Back
            </Link>
            <Link href="/auth/signup" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-[#f8f5ef] transition-transform hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-200 mb-5">
            <Sparkles className="h-4 w-4 text-[#d97706]" />
            Interactive product demo
          </div>
          <h1 className="font-display text-4xl tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            A study and tutoring system that keeps
            <span className="block bg-gradient-to-r from-slate-950 via-slate-700 to-[#d97706] bg-clip-text text-transparent dark:from-white dark:via-slate-200 dark:to-[#f2c06d]">
              the whole workflow visible.
            </span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300">
            Explore each module below — AI study sessions, generated worksheets, progress tracking, admissions support, and weekly planning in one workspace.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 gap-4 mb-10 sm:grid-cols-4">
          {[
            { label: 'Study sessions', value: '2,400+', icon: BookOpen },
            { label: 'Worksheets generated', value: '18,000+', icon: FileText },
            { label: 'Avg score improvement', value: '+22%', icon: TrendingUp },
            { label: 'Students active', value: '340+', icon: Users },
          ].map((s) => (
            <div key={s.label} className="rounded-[1.5rem] border border-slate-900/10 bg-white/80 dark:border-white/10 dark:bg-white/5 p-5 text-center">
              <s.icon className="h-5 w-5 text-[#d97706] mx-auto mb-2" />
              <p className="text-2xl font-semibold text-slate-950 dark:text-white">{s.value}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Mock student profile */}
        <div className="mb-6 rounded-[1.5rem] border border-slate-900/10 bg-white dark:border-white/10 dark:bg-slate-900/70 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-slate-950 dark:bg-white flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-white dark:text-slate-950">YT</span>
            </div>
            <div>
              <p className="font-semibold text-slate-950 dark:text-white">Yuki Tanaka</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">A-Level · Chemistry, Math, Physics · Targeting: UTokyo, Waseda</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Exam prep', 'Admissions', 'Weekly planner'].map((tag) => (
              <span key={tag} className="rounded-full border border-slate-900/10 dark:border-white/10 bg-[#f8f5ef] dark:bg-white/5 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                {tag}
              </span>
            ))}
            <span className="rounded-full bg-[#f2c06d]/20 border border-[#d97706]/20 px-3 py-1 text-xs font-semibold text-[#9a5b00] dark:text-[#f5d59f]">
              Score: 84/100
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-lg'
                  : 'border border-slate-900/10 bg-white/80 text-slate-700 hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="mb-12">
          <ActiveContent />
        </div>

        {/* Value props */}
        <div className="mb-12 grid gap-4 md:grid-cols-3">
          {[
            { title: 'No more rebuilding context', desc: 'Every session, worksheet, and score stays attached. Tutors and students always start with the full picture.', Icon: CheckCircle2 },
            { title: 'AI that knows the curriculum', desc: "Worksheet generation is tied to topic, difficulty level, and the student's recent weak areas — not a blank prompt.", Icon: Brain },
            { title: 'One workflow, not five tools', desc: 'Study, admissions, internships, planning, and progress reporting share a single workspace.', Icon: Zap },
          ].map(({ title, desc, Icon }) => (
            <article key={title} className="rounded-[1.75rem] border border-slate-900/10 bg-white/80 dark:border-white/10 dark:bg-white/5 p-6">
              <Icon className="h-6 w-6 text-[#d97706] mb-3" />
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{desc}</p>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-[2rem] bg-slate-950 px-7 py-8 text-white flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#f2c06d] mb-2">Ready to try it live?</p>
            <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Open the real workspace.</h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/70">
              The live dashboard has all modules active. Sign up free and see your own study workflow in under five minutes.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row shrink-0">
            <Link href="/auth/guest" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5">
              Try live workspace <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/auth/signup" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">
              Create account
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
