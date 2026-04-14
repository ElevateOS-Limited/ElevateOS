'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, BookOpen, Loader2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const roles = [
  {
    value: 'STUDENT',
    label: 'Student',
    description: 'I need tasks, feedback, and a clear view of what to work on next.',
    icon: BookOpen,
  },
  {
    value: 'PARENT',
    label: 'Parent',
    description: 'I want concise session summaries and visibility on my child\'s progress.',
    icon: Users,
  },
  {
    value: 'TUTOR',
    label: 'Tutor',
    description: 'I assign work, review submissions, write session notes, and send parent reports.',
    icon: BookOpen,
  },
] as const

type SelfRole = (typeof roles)[number]['value']

type OnboardingRolePickerProps = {
  className?: string
}

export function OnboardingRolePicker({ className }: OnboardingRolePickerProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<SelfRole>('STUDENT')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/user/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selected }),
      })

      const data = await response.json() as { redirectTo?: string; error?: string }

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save role')
      }

      router.push(data.redirectTo || '/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save role')
      setLoading(false)
    }
  }

  return (
    <div className={cn('rounded-[2rem] border border-slate-900/10 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5', className)}>
      <div className="grid gap-4 sm:grid-cols-3">
        {roles.map(({ value, label, description, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setSelected(value)}
            className={cn(
              'rounded-[1.5rem] border p-5 text-left transition hover:-translate-y-0.5',
              selected === value
                ? 'border-slate-900 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950'
                : 'border-slate-900/10 bg-[#f8f5ef] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200',
            )}
          >
            <Icon className={cn('h-5 w-5', selected === value ? 'text-[#f2c06d]' : 'text-[#9a5b00]')} />
            <h3 className="mt-4 text-lg font-semibold">{label}</h3>
            <p className={cn('mt-2 text-sm leading-6', selected === value ? 'text-white/75 dark:text-slate-700' : 'text-slate-600 dark:text-slate-300')}>
              {description}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          disabled={loading}
          onClick={handleConfirm}
          className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          Continue as {roles.find((r) => r.value === selected)?.label}
        </button>

        {error ? (
          <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p>
        ) : null}
      </div>
    </div>
  )
}
