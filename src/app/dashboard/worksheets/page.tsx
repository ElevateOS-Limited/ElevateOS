'use client'

import { useState } from 'react'
import { BookOpen, Loader, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { CURRICULA, DIFFICULTIES, QUESTION_TYPES, IB_SUBJECTS, AP_SUBJECTS } from '@/lib/utils'

interface Question {
  type: string
  question: string
  options?: string[]
  answer: string
  marks: number
}

export default function WorksheetsPage() {
  const [form, setForm] = useState({
    subject: '',
    curriculum: 'IB',
    topic: '',
    difficulty: 'Medium',
    count: '10',
    questionTypes: ['Multiple Choice', 'Short Answer'],
    content: '',
  })
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [showAnswers, setShowAnswers] = useState<Set<number>>(new Set())
  const [error, setError] = useState('')

  const subjects = form.curriculum === 'IB' ? IB_SUBJECTS : form.curriculum === 'AP' ? AP_SUBJECTS : []

  const toggleQType = (type: string) => {
    setForm(prev => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(type)
        ? prev.questionTypes.filter(t => t !== type)
        : [...prev.questionTypes, type],
    }))
  }

  const toggleAnswer = (i: number) => {
    setShowAnswers(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setQuestions([])

    try {
      const res = await fetch('/api/worksheets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setQuestions(data.questions)
    } catch (err: any) {
      setError(err.message || 'Failed to generate worksheet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          Worksheet Generator
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Generate exam-style practice questions tailored to your curriculum</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Curriculum</label>
            <select
              value={form.curriculum}
              onChange={(e) => setForm({ ...form, curriculum: e.target.value, subject: '' })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CURRICULA.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Subject</label>
            {subjects.length > 0 ? (
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select subject...</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g., Mathematics"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Difficulty</label>
            <select
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Topic *</label>
            <input
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              placeholder="e.g., Organic Chemistry, Calculus Integration..."
              required
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Number of Questions</label>
            <select
              value={form.count}
              onChange={(e) => setForm({ ...form, count: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {['5', '10', '15', '20'].map(n => <option key={n} value={n}>{n} questions</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Question Types</label>
          <div className="flex flex-wrap gap-2">
            {QUESTION_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => toggleQType(type)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  form.questionTypes.includes(type)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Extra context (optional)</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Paste any notes or reference material to base questions on..."
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || !form.topic}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader className="w-4 h-4 animate-spin" /> Generating Worksheet...</>
          ) : (
            <><BookOpen className="w-4 h-4" /> Generate Worksheet</>
          )}
        </button>
      </form>

      {/* Questions */}
      {questions.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{questions.length} Questions Generated</h2>
            <button
              onClick={() => setShowAnswers(new Set(questions.map((_, i) => i)))}
              className="text-sm text-blue-600 hover:underline"
            >
              Reveal all answers
            </button>
          </div>

          {questions.map((q, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-0.5 rounded-md capitalize">
                    {q.type.replace('_', ' ')} · {q.marks} mark{q.marks !== 1 ? 's' : ''}
                  </span>
                </div>
                <button onClick={() => toggleAnswer(i)} className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1">
                  {showAnswers.has(i) ? <><XCircle className="w-4 h-4" /> Hide</> : <><CheckCircle className="w-4 h-4" /> Answer</>}
                </button>
              </div>

              <p className="text-gray-800 dark:text-gray-200 mb-3 font-medium">{q.question}</p>

              {q.options && (
                <div className="space-y-2 mb-3">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="w-6 h-6 border border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center text-xs">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      {opt.replace(/^[A-D]\)\s*/, '')}
                    </div>
                  ))}
                </div>
              )}

              {showAnswers.has(i) && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-sm text-green-800 dark:text-green-400">
                  <strong>Answer:</strong> {q.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
