'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { tutoringRoleValues } from '@/lib/tutoring/contracts'

type UserRoleFormProps = {
  userId: string
  userName: string
  initialRole: string
  initialPlan?: string | null
}

const planValues = ['FREE', 'AI_PREMIUM', 'TUTORING_PREMIUM', 'TUTOR_ONLY'] as const

export function UserRoleForm({ userId, userName, initialRole, initialPlan = 'FREE' }: UserRoleFormProps) {
  const router = useRouter()
  const [role, setRole] = useState(initialRole)
  const [plan, setPlan] = useState(initialPlan || 'FREE')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          plan,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to update user')
      }

      setMessage(`Updated ${userName}.`)
      router.refresh()
    } catch (userError) {
      setError(userError instanceof Error ? userError.message : 'Unable to update user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl border border-slate-900/10 bg-[#f8f5ef] p-4 dark:border-white/10 dark:bg-white/5">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">User role</p>
        <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{userName}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Role</span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="rounded-xl border border-slate-900/10 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
          >
            {tutoringRoleValues.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Plan</span>
          <select
            value={plan}
            onChange={(event) => setPlan(event.target.value)}
            className="rounded-xl border border-slate-900/10 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
          >
            {planValues.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Update user
        </button>
        {message ? <p className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p> : null}
        {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
      </div>
    </form>
  )
}
