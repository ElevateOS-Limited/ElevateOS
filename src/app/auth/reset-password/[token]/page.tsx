'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { AlertCircle, Brain, CheckCircle2, Loader2, Lock } from 'lucide-react'

type ResetState = 'checking' | 'ready' | 'invalid' | 'saving' | 'success'

export default function ResetPasswordTokenPage() {
  const params = useParams<{ token: string }>()
  const router = useRouter()
  const token = useMemo(() => {
    const value = params?.token
    return Array.isArray(value) ? value[0] : value
  }, [params])

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [state, setState] = useState<ResetState>('checking')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setState('invalid')
      return
    }

    let active = true

    fetch(`/api/auth/reset-password/${token}`, { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json().catch(() => null)
        if (!active) return
        setState(res.ok && data?.valid ? 'ready' : 'invalid')
      })
      .catch(() => {
        if (active) setState('invalid')
      })

    return () => {
      active = false
    }
  }, [token])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token || state === 'saving') return

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setError('')
    setState('saving')

    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Unable to reset password')
      }

      setState('success')
      setTimeout(() => {
        router.push('/auth/login')
      }, 1500)
    } catch (submitError: any) {
      setState('ready')
      setError(submitError.message || 'Unable to reset password')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">ElevateOS</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Choose a new password</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Reset links are single-use and expire after one hour.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
          {state === 'checking' && (
            <div className="flex items-center justify-center gap-2 py-8 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Validating reset link...
            </div>
          )}

          {state === 'invalid' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200 flex gap-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>This reset link is invalid or has expired. Request a new password reset to continue.</p>
              </div>
              <Link href="/auth/reset-password" className="block text-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                Request a new link
              </Link>
            </div>
          )}

          {state === 'success' && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200 flex gap-3">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <p>Password updated. Redirecting you to login...</p>
            </div>
          )}

          {(state === 'ready' || state === 'saving') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5">New password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={8}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    minLength={8}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={state === 'saving'}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {state === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
                Save new password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
