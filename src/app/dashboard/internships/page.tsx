'use client'

import { useState } from 'react'
import { Briefcase, Loader } from 'lucide-react'

export default function InternshipsPage() {
  const [form, setForm] = useState({ major: '', careerInterests: '', skills: '', location: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setResult('')

    try {
      const res = await fetch('/api/internships/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.recommendations)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-pink-600" />
          Internship Recommender
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Find prestigious internships that strengthen your university application</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Intended Major *</label>
            <input
              value={form.major}
              onChange={(e) => setForm({ ...form, major: e.target.value })}
              placeholder="e.g., Computer Science, Medicine..."
              required
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Location Preference</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g., USA, Remote, Any, Tokyo..."
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Career Interests *</label>
          <input
            value={form.careerInterests}
            onChange={(e) => setForm({ ...form, careerInterests: e.target.value })}
            placeholder="e.g., AI research, healthcare innovation, fintech, environmental policy..."
            required
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Skills & Experiences</label>
          <textarea
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            placeholder="e.g., Python programming, volunteer work, club leadership, languages..."
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader className="w-4 h-4 animate-spin" /> Finding Internships...</>
          ) : (
            <><Briefcase className="w-4 h-4" /> Find My Internships</>
          )}
        </button>
      </form>

      {result && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 animate-fade-in">
          <h2 className="text-lg font-semibold mb-4">Recommended Internships</h2>
          <div className="prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap">{result}</div>
          </div>
        </div>
      )}
    </div>
  )
}
