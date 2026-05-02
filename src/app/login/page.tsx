'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { getProviders, getSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BookOpen, Loader2 } from 'lucide-react'
import { getRoleHomePath } from '@/lib/auth/routes'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleAvailable, setGoogleAvailable] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    let active = true

    async function loadProviders() {
      const providers = await getProviders()
      if (active) setGoogleAvailable(Boolean(providers?.google))
    }

    async function redirectIfSignedIn() {
      const session = await getSession()
      if (session?.user?.role) {
        router.replace(getRoleHomePath(session.user.role))
      }
    }

    void loadProviders()
    void redirectIfSignedIn()

    return () => {
      active = false
    }
  }, [router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const result = await signIn('credentials', { email, password, redirect: false })
      if (!result?.ok) {
        throw new Error('Invalid email or password')
      }

      const session = await getSession()
      router.replace(getRoleHomePath(session?.user?.role))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(245,201,111,.18),_transparent_28%),linear-gradient(180deg,#f8f5ef_0%,#ffffff_100%)] px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-8 lg:grid-cols-[.9fr_1.1fr]">
        <section className="max-w-xl">
          <Link href="/home" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold">ElevateOS</p>
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Student planning and tutoring dashboard</p>
            </div>
          </Link>

          <h1 className="font-display mt-8 text-5xl leading-[0.95] tracking-tight sm:text-6xl">
            Sign in and go straight to the right dashboard.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600 dark:text-slate-300">
            Students go to planning, tutors go to the tutor area, parents go to the family summary, and admins go to admin tools.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
            {['Student planning', 'Tutor tools', 'Family summaries', 'Admin tools'].map((item) => (
              <span key={item} className="rounded-full border border-slate-900/10 bg-white/80 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-900/10 bg-white/90 p-6 shadow-2xl shadow-slate-950/5 backdrop-blur dark:border-white/10 dark:bg-white/5">
          {googleAvailable ? (
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/login' })}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900/20 hover:text-slate-950 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:text-white"
            >
              Continue with Google
            </button>
          ) : null}

          {googleAvailable ? (
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-900/10 dark:bg-white/10" />
              <span className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Or</span>
              <div className="h-px flex-1 bg-slate-900/10 dark:bg-white/10" />
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Sign in
            </button>

            {message ? (
              <p className="text-sm text-rose-600 dark:text-rose-300">{message}</p>
            ) : null}
          </form>

          <div className="mt-6 rounded-[1.5rem] border border-slate-900/10 bg-[#f8f5ef] p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            New families should start with onboarding so we can capture the right role, contact details, and student context.
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
            <Link href="/onboarding" className="font-semibold text-slate-950 underline-offset-4 hover:underline dark:text-white">
              Start onboarding
            </Link>
            <Link href="/home" className="text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
              Back to home
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
