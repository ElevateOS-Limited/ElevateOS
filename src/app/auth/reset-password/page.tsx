'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Brain, Loader2, Mail, ShieldCheck } from 'lucide-react'

export default function ResetPasswordRequestPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Unable to request reset link')
      }

      setMessage(data.message)
    } catch (requestError: any) {
      setError(requestError.message || 'Unable to request reset link')
    } finally {
      setLoading(false)
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
          <h1 className="text-3xl font-bold mb-2">Reset your password</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter the email tied to your account and we&apos;ll send the next step.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
          {message ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200">
                {message}
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 mt-0.5 text-violet-600" />
                  <p>
                    For security, the response is the same whether or not that email exists in the system.
                  </p>
                </div>
              </div>
              <Link href="/auth/login" className="block text-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Send reset link
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Remembered your password?{' '}
          <Link href="/auth/login" className="text-violet-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
