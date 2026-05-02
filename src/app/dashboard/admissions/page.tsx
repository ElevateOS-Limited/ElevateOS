'use client'

import { useState } from 'react'
import { GraduationCap, Loader, Plus, X } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function AdmissionsPage() {
  const { data: session } = useSession()
  const [universities, setUniversities] = useState<string[]>([''])
  const [form, setForm] = useState({
    gpa: '',
    satScore: '',
    actScore: '',
    curriculum: 'IB',
    intendedMajor: '',
    essay: '',
  })
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{ university: string; analysis: string }[]>([])
  const [essayFeedback, setEssayFeedback] = useState('')
  const [essayLoading, setEssayLoading] = useState(false)
  const [error, setError] = useState('')

  const addUniversity = () => setUniversities([...universities, ''])
  const removeUniversity = (i: number) => setUniversities(universities.filter((_, idx) => idx !== i))
  const updateUniversity = (i: number, val: string) => {
    const u = [...universities]
    u[i] = val
    setUniversities(u)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setResults([])

    try {
      const validUnis = universities.filter(u => u.trim())
      if (!validUnis.length) throw new Error('Add at least one university')

      const res = await fetch('/api/admissions/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, universities: validUnis }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResults(data.results)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEssayFeedback = async () => {
    if (!form.essay.trim()) return
    setEssayLoading(true)
    try {
      const res = await fetch('/api/admissions/essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essay: form.essay, major: form.intendedMajor }),
      })
      const data = await res.json()
      setEssayFeedback(data.feedback)
    } catch {
      setEssayFeedback('Failed to get feedback. Please try again.')
    } finally {
      setEssayLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-green-600" />
          Admissions Support
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Get admission analysis and essay feedback for your target universities</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
        {/* Target Universities */}
        <div>
          <label className="block text-sm font-medium mb-2">Target Universities</label>
          <div className="space-y-2">
            {universities.map((u, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={u}
                  onChange={(e) => updateUniversity(i, e.target.value)}
                  placeholder="e.g., MIT, Harvard University, Stanford..."
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {universities.length > 1 && (
                  <button type="button" onClick={() => removeUniversity(i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addUniversity} className="mt-2 flex items-center gap-1 text-sm text-green-600 hover:underline">
            <Plus className="w-4 h-4" /> Add another university
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">GPA (out of 4.0 or 7.0)</label>
            <input
              type="number"
              step="0.01"
              value={form.gpa}
              onChange={(e) => setForm({ ...form, gpa: e.target.value })}
              placeholder="e.g., 3.8"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">SAT Score (optional)</label>
            <input
              type="number"
              value={form.satScore}
              onChange={(e) => setForm({ ...form, satScore: e.target.value })}
              placeholder="e.g., 1450"
              min="400" max="1600"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">ACT Score (optional)</label>
            <input
              type="number"
              value={form.actScore}
              onChange={(e) => setForm({ ...form, actScore: e.target.value })}
              placeholder="e.g., 32"
              min="1" max="36"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Curriculum</label>
            <select
              value={form.curriculum}
              onChange={(e) => setForm({ ...form, curriculum: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {['IB', 'AP', 'A-Level', 'SAT', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Intended Major *</label>
            <input
              value={form.intendedMajor}
              onChange={(e) => setForm({ ...form, intendedMajor: e.target.value })}
              placeholder="e.g., Computer Science, Economics..."
              required
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader className="w-4 h-4 animate-spin" /> Analyzing Admissions...</>
          ) : (
            <><GraduationCap className="w-4 h-4" /> Analyze My Chances</>
          )}
        </button>
      </form>

      {/* Results */}
      {results.map((r, i) => (
        <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 animate-fade-in">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-green-600" />
            {r.university}
          </h2>
          <div className="prose dark:prose-invert max-w-none text-sm">
            <div className="whitespace-pre-wrap">{r.analysis}</div>
          </div>
        </div>
      ))}

      {/* Essay Feedback */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold mb-3">Essay Feedback Tool</h2>
        <textarea
          value={form.essay}
          onChange={(e) => setForm({ ...form, essay: e.target.value })}
          placeholder="Paste your college essay or personal statement here..."
          rows={8}
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500 resize-none mb-3"
        />
        <button
          onClick={handleEssayFeedback}
          disabled={essayLoading || !form.essay.trim()}
          className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          {essayLoading ? <><Loader className="w-4 h-4 animate-spin" /> Analyzing...</> : 'Get Essay Feedback'}
        </button>
        {essayFeedback && (
          <div className="mt-4 prose dark:prose-invert max-w-none text-sm bg-green-50 dark:bg-green-900/10 rounded-xl p-4">
            <div className="whitespace-pre-wrap">{essayFeedback}</div>
          </div>
        )}
      </div>
    </div>
  )
}
