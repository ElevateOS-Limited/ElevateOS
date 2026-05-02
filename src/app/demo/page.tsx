'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  FileText,
  GraduationCap,
  MessageSquareText,
  Sparkles,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { demoDashboardProfile } from '@/lib/dashboard/demo-profile'

type TabId = 'assistant' | 'worksheets' | 'progress' | 'admissions' | 'planner'

type TabSpec = {
  id: TabId
  label: string
  icon: LucideIcon
}

const tabs: TabSpec[] = [
  { id: 'assistant', label: 'Study Assistant', icon: MessageSquareText },
  { id: 'worksheets', label: 'Worksheets', icon: FileText },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'admissions', label: 'Admissions', icon: GraduationCap },
  { id: 'planner', label: 'Planner', icon: CalendarClock },
]

const stats = [
  { label: 'Sessions tracked', value: '2,400+' },
  { label: 'Worksheets created', value: '18,000+' },
  { label: 'Average score lift', value: '+22%' },
  { label: 'Target schools managed', value: '3' },
]

const assistantMessages = [
  {
    role: 'Yuki',
    text: 'I keep losing marks when I set up integration problems. Can you tighten the approach for next week?',
  },
  {
    role: 'ElevateOS AI',
    text: 'Yes. Build the setup in three steps: identify the region, write the bounds first, then check the boundary condition before you calculate the final value.',
  },
  {
    role: 'Next step',
    text: 'Generate 5 exam-level questions, review the two weakest answers, and schedule one 20-minute correction block on Thursday.',
  },
]

const worksheetItems = [
  'Math AA HL: integration by parts and area between curves',
  'Physics HL: mechanics free-body diagrams and friction setup',
  'English A SL: evidence selection for a comparative paragraph',
  'Admissions prep: one short reflection on the UTokyo story angle',
]

const progressRows = [
  { label: 'Math AA HL', value: 88, note: 'Strong accuracy, still slow on the setup stage.' },
  { label: 'Physics HL', value: 81, note: 'Good concept recall, needs cleaner equation selection.' },
  { label: 'English A SL', value: 79, note: 'Good structure, more specific evidence needed.' },
]

const admissionsCards = [
  {
    name: 'University of Tokyo',
    fit: 'Reach',
    note: 'Best story if the robotics work and academic track stay aligned.',
  },
  {
    name: 'Waseda University',
    fit: 'Stretch',
    note: 'Strong target if the essay shows clear initiative and discipline.',
  },
  {
    name: 'Keio University',
    fit: 'Stretch',
    note: 'Add one more leadership spike to make the profile cleaner.',
  },
]

const plannerRows = [
  { day: 'Monday', state: 'Open', focus: 'Essay draft and calculus review' },
  { day: 'Tuesday', state: 'Busy', focus: 'School and robotics build session' },
  { day: 'Wednesday', state: 'Open', focus: 'Admissions research block' },
  { day: 'Thursday', state: 'Open', focus: 'Worksheet correction and feedback' },
  { day: 'Friday', state: 'Busy', focus: 'Club rehearsal and commute' },
  { day: 'Saturday', state: 'Open', focus: 'Mock interview and summer plan' },
  { day: 'Sunday', state: 'Busy', focus: 'Family time and reset' },
]

function SectionHeading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string
  title: string
  copy: string
}) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9a5b00]">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">{copy}</p>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  )
}

function Pill({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-slate-900/10 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">{children}</span>
}

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<TabId>('assistant')

  const heroPills = [
    demoDashboardProfile.gradeLevel,
    demoDashboardProfile.curriculum,
    demoDashboardProfile.intendedMajor,
    demoDashboardProfile.location,
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(245,201,111,.18),_transparent_28%),linear-gradient(180deg,#f8f5ef_0%,#ffffff_100%)] text-slate-950 dark:bg-slate-950 dark:text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">ElevateOS</p>
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Pitch demo</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
          <Link href="#demo" className="hover:text-slate-950 dark:hover:text-white">
            Demo
          </Link>
          <Link href="/pricing" className="hover:text-slate-950 dark:hover:text-white">
            Pricing
          </Link>
          <Link href="/dashboard" className="hover:text-slate-950 dark:hover:text-white">
            Workspace
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/pricing" className="rounded-full border border-slate-900/10 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:text-white">
            Pricing
          </Link>
          <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
            Create account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <section className="grid gap-8 py-10 lg:grid-cols-[1.08fr_.92fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <Sparkles className="h-4 w-4 text-[#9a5b00]" />
              Full student workflow in one preview
            </div>

            <h1 className="font-display mt-6 max-w-3xl text-5xl leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
              The student planning workspace, shown end to end.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              This is the public demo for the product reviewers. It shows the study assistant, worksheet generation, progress tracking, admissions planning, and the weekly planner in one flow.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">
                Open workspace <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/80 px-6 py-3 text-slate-700 backdrop-blur transition hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white">
                Create account
              </Link>
              <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/80 px-6 py-3 text-slate-700 backdrop-blur transition hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white">
                View pricing
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {heroPills.map((pill) => (
                <Pill key={pill}>{pill}</Pill>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">Mock student profile</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{demoDashboardProfile.name}</h2>
                </div>
                <div className="rounded-full border border-[#f2c06d]/40 bg-[#f8f0d6] px-3 py-1 text-xs font-semibold text-[#8a5a00]">
                  IB Year 11
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {stats.map((stat) => (
                  <StatCard key={stat.label} label={stat.label} value={stat.value} />
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10 dark:border-white/10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2c06d]">Why this works for the pitch</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-white/75">
                <p>1. The reviewer sees a real student profile instead of a raw spec dump.</p>
                <p>2. Every feature is tied to a visible artifact: chat, worksheet, progress, admissions, planner.</p>
                <p>3. The demo can be opened without an account, then handed off into the real workspace when needed.</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Pill>Yuki Tanaka</Pill>
                <Pill>UTokyo</Pill>
                <Pill>Waseda</Pill>
              </div>
            </div>
          </div>
        </section>

        <section id="demo" className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <SectionHeading
            eyebrow="Interactive demo"
            title="Five tabbed views, one coherent product story."
            copy="Use the tabs to move through the core product surfaces in the order a reviewer naturally expects to see them."
          />

          <div className="mt-6 flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const active = tab.id === activeTab
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-pressed={active}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
                    active
                      ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950'
                      : 'border-slate-900/10 bg-[#f8f5ef] text-slate-700 hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
            {activeTab === 'assistant' ? (
              <>
                <article className="rounded-[1.75rem] border border-slate-900/10 bg-[#f8f5ef] p-5 dark:border-white/10 dark:bg-slate-950/60">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">Study assistant</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">One answer, then one next step.</h3>
                    </div>
                    <MessageSquareText className="h-5 w-5 text-[#9a5b00]" />
                  </div>

                  <div className="mt-5 space-y-3">
                    {assistantMessages.map((message) => (
                      <div key={message.role} className="rounded-[1.25rem] border border-slate-900/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{message.role}</p>
                          <Sparkles className="h-4 w-4 text-[#9a5b00]" />
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-200">{message.text}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <div className="grid gap-5">
                  <article className="rounded-[1.75rem] border border-slate-900/10 bg-slate-950 p-5 text-white dark:border-white/10">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2c06d]">Session summary</p>
                    <h3 className="mt-2 text-xl font-semibold">What the student should do next</h3>
                    <div className="mt-4 space-y-3 text-sm leading-7 text-white/75">
                      <p>• Focus on boundary setup before doing any calculation.</p>
                      <p>• Rework the two missed questions from the last worksheet.</p>
                      <p>• Block one 20-minute correction session on Thursday.</p>
                    </div>
                  </article>

                  <article className="rounded-[1.75rem] border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">Signals used</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {demoDashboardProfile.coursesTaking.map((course) => (
                        <Pill key={course}>{course}</Pill>
                      ))}
                    </div>
                    <div className="mt-5 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <BookOpen className="h-4 w-4 text-[#9a5b00]" />
                      Generates responses from the subject list, goals, and planner state.
                    </div>
                  </article>
                </div>
              </>
            ) : null}

            {activeTab === 'worksheets' ? (
              <>
                <article className="rounded-[1.75rem] border border-slate-900/10 bg-[#f8f5ef] p-5 dark:border-white/10 dark:bg-slate-950/60">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">Worksheets</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Generated from the student profile.</h3>
                    </div>
                    <FileText className="h-5 w-5 text-[#9a5b00]" />
                  </div>

                  <div className="mt-5 space-y-3">
                    {worksheetItems.map((item, index) => (
                      <div key={item} className="rounded-[1.25rem] border border-slate-900/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-950 dark:text-white">{item}</p>
                          <span className="rounded-full border border-[#f2c06d]/40 bg-[#f8f0d6] px-2.5 py-1 text-[11px] font-semibold text-[#8a5a00]">
                            Q{index + 1}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                          Each worksheet is tagged to the target subject, difficulty, and the weak area it is meant to fix.
                        </p>
                      </div>
                    ))}
                  </div>
                </article>

                <div className="grid gap-5">
                  <article className="rounded-[1.75rem] border border-slate-900/10 bg-slate-950 p-5 text-white dark:border-white/10">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2c06d]">Marking snapshot</p>
                    <h3 className="mt-2 text-xl font-semibold">Answer quality before review</h3>
                    <div className="mt-4 space-y-3 text-sm leading-7 text-white/75">
                      <p>• Question 1: clear setup, minor notation cleanup needed.</p>
                      <p>• Question 2: correct method, final line needs stronger explanation.</p>
                      <p>• Question 3: weak on boundary handling, send back for correction.</p>
                    </div>
                  </article>

                  <article className="rounded-[1.75rem] border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">Export options</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Pill>PDF</Pill>
                      <Pill>Print</Pill>
                      <Pill>Share link</Pill>
                    </div>
                    <div className="mt-5 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-[#9a5b00]" />
                      Review-ready output with no extra admin work.
                    </div>
                  </article>
                </div>
              </>
            ) : null}

            {activeTab === 'progress' ? (
              <>
                <article className="rounded-[1.75rem] border border-slate-900/10 bg-[#f8f5ef] p-5 dark:border-white/10 dark:bg-slate-950/60">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">Progress</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Visible trends, not just a raw score.</h3>
                    </div>
                    <BarChart3 className="h-5 w-5 text-[#9a5b00]" />
                  </div>

                  <div className="mt-5 space-y-4">
                    {progressRows.map((row) => (
                      <div key={row.label} className="rounded-[1.25rem] border border-slate-900/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-950 dark:text-white">{row.label}</p>
                          <p className="text-sm font-semibold text-[#9a5b00]">{row.value}%</p>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-white/10">
                          <div className="h-2 rounded-full bg-gradient-to-r from-[#f2c06d] to-[#9a5b00]" style={{ width: `${row.value}%` }} />
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{row.note}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <div className="grid gap-5">
                  <article className="rounded-[1.75rem] border border-slate-900/10 bg-slate-950 p-5 text-white dark:border-white/10">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2c06d]">Weak areas</p>
                    <h3 className="mt-2 text-xl font-semibold">What still needs work</h3>
                    <div className="mt-4 space-y-3 text-sm leading-7 text-white/75">
                      <p>• Boundary conditions in calculus problems.</p>
                      <p>• Evidence selection for long-form writing.</p>
                      <p>• Faster transitions between ideas in physics explanations.</p>
                    </div>
                  </article>

                  <article className="rounded-[1.75rem] border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">Lift since last month</p>
                    <div className="mt-4 flex items-end gap-3">
                      <p className="text-4xl font-semibold text-slate-950 dark:text-white">+22%</p>
                      <p className="pb-1 text-sm text-slate-600 dark:text-slate-300">average improvement across tracked subjects</p>
                    </div>
                  </article>
                </div>
              </>
            ) : null}

            {activeTab === 'admissions' ? (
              <>
                <article className="rounded-[1.75rem] border border-slate-900/10 bg-[#f8f5ef] p-5 dark:border-white/10 dark:bg-slate-950/60">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">Admissions</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Target schools and next steps stay visible.</h3>
                    </div>
                    <GraduationCap className="h-5 w-5 text-[#9a5b00]" />
                  </div>

                  <div className="mt-5 space-y-3">
                    {admissionsCards.map((school) => (
                      <div key={school.name} className="rounded-[1.25rem] border border-slate-900/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-950 dark:text-white">{school.name}</p>
                          <span className="rounded-full border border-[#f2c06d]/40 bg-[#f8f0d6] px-3 py-1 text-[11px] font-semibold text-[#8a5a00]">
                            {school.fit}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{school.note}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <div className="grid gap-5">
                  <article className="rounded-[1.75rem] border border-slate-900/10 bg-slate-950 p-5 text-white dark:border-white/10">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2c06d]">Essay feedback</p>
                    <h3 className="mt-2 text-xl font-semibold">One strong narrative is better than three loose ones.</h3>
                    <div className="mt-4 space-y-3 text-sm leading-7 text-white/75">
                      <p>• Lead with the robotics work, then connect it to discipline and iteration.</p>
                      <p>• Keep the university list tight and purposeful.</p>
                      <p>• Add one concrete summer project before the final submission run.</p>
                    </div>
                  </article>

                  <article className="rounded-[1.75rem] border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">Application state</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Pill>Shortlist ready</Pill>
                      <Pill>Essay draft</Pill>
                      <Pill>Recommendation plan</Pill>
                    </div>
                  </article>
                </div>
              </>
            ) : null}

            {activeTab === 'planner' ? (
              <>
                <article className="rounded-[1.75rem] border border-slate-900/10 bg-[#f8f5ef] p-5 dark:border-white/10 dark:bg-slate-950/60">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">Planner</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Weekly blocks stay visible before they get lost.</h3>
                    </div>
                    <CalendarClock className="h-5 w-5 text-[#9a5b00]" />
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    {plannerRows.map((row) => {
                      const open = row.state === 'Open'
                      return (
                        <div
                          key={row.day}
                          className={cn(
                            'rounded-[1.25rem] border p-4',
                            open ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-slate-900/10 bg-white dark:border-white/10 dark:bg-white/5',
                          )}
                        >
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{row.day}</p>
                          <p className={cn('mt-2 text-sm font-semibold', open ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-950 dark:text-white')}>
                            {row.state}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{row.focus}</p>
                        </div>
                      )
                    })}
                  </div>
                </article>

                <div className="grid gap-5">
                  <article className="rounded-[1.75rem] border border-slate-900/10 bg-slate-950 p-5 text-white dark:border-white/10">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2c06d]">Priority order</p>
                    <h3 className="mt-2 text-xl font-semibold">What should happen this week</h3>
                    <div className="mt-4 space-y-3 text-sm leading-7 text-white/75">
                      <p>1. Finish the essay outline.</p>
                      <p>2. Correct the weakest worksheet answers.</p>
                      <p>3. Protect one admissions research block.</p>
                    </div>
                  </article>

                  <article className="rounded-[1.75rem] border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">Next deadline</p>
                    <div className="mt-4 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <Target className="h-4 w-4 text-[#9a5b00]" />
                      UTokyo application research block due this weekend.
                    </div>
                  </article>
                </div>
              </>
            ) : null}
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.08fr_.92fr]">
          <article className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10 dark:border-white/10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2c06d]">What the reviewer gets</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-white/75">
              <p>• A live product story instead of a static screenshot deck.</p>
              <p>• A student profile that is clearly tied to the feature outputs.</p>
              <p>• A clean handoff from demo to account creation or workspace access.</p>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">Save time</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">The same demo should open the full workspace when needed.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              If the reviewer wants to keep going, open the main dashboard. If they want pricing, send them there next. If they want to start, route them to onboarding.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">
                Open workspace <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 px-4 py-2.5 text-slate-700 transition hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:text-white">
                Pricing
              </Link>
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}
