'use client'

import { useState } from 'react'
import { Brain, Upload, Link as LinkIcon, Loader, BookOpen, Lightbulb, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import { CURRICULA, IB_SUBJECTS, AP_SUBJECTS } from '@/lib/utils'

interface StudyResult {
  id: string
  summary: string
  keyConcepts: string[]
  studyPlan: string[]
  flashcards: { front: string; back: string }[]
}

export default function StudyPage() {
  const [form, setForm] = useState({
    title: '',
    subject: '',
    curriculum: 'IB',
    content: '',
    url: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<StudyResult | null>(null)
  const [error, setError] = useState('')
  const [activeFlashcard, setActiveFlashcard] = useState<number | null>(null)
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const [sharing, setSharing] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [shareStatus, setShareStatus] = useState('')

  const subjects = form.curriculum === 'IB' ? IB_SUBJECTS : form.curriculum === 'AP' ? AP_SUBJECTS : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setResult(null)
    setShareUrl('')
    setShareStatus('')

    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => formData.append(k, v))
      if (file) formData.append('file', file)

      const res = await fetch('/api/study/generate', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Failed to generate study materials')
    } finally {
      setLoading(false)
    }
  }

  const toggleFlashcard = (i: number) => {
    setFlippedCards(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const handleShare = async () => {
    if (!result?.id) return
    setSharing(true)
    setShareStatus('')
    try {
      const res = await fetch('/api/study/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studySessionId: result.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate share link')
      setShareUrl(data.shareUrl)
      await navigator.clipboard.writeText(data.shareUrl)
      setShareStatus('Share link copied to clipboard')
    } catch (err: any) {
      setShareStatus(err.message || 'Failed to generate share link')
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Brain className="w-8 h-8 text-violet-600" />
          Study Help
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Upload your study materials and get notes, flashcards, and study plans</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Session Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., IB Chemistry HL - Organic Chemistry"
              required
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Curriculum</label>
            <select
              value={form.curriculum}
              onChange={(e) => setForm({ ...form, curriculum: e.target.value, subject: '' })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {CURRICULA.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {subjects.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1.5">Subject</label>
            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Select subject...</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1.5">
            <Upload className="inline w-4 h-4 mr-1" />
            Upload PDF or Document
          </label>
          <div
            className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-violet-400 transition-colors"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            {file ? (
              <p className="text-sm text-violet-600">{file.name}</p>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click to upload PDF, DOCX, or TXT</p>
              </>
            )}
            <input
              id="file-input"
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            <LinkIcon className="inline w-4 h-4 mr-1" />
            Or paste a URL (YouTube, web page)
          </label>
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://..."
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Or paste your notes / syllabus content</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Paste your notes, syllabus text, or any study material here..."
            rows={5}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || (!form.content && !file && !form.url)}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader className="w-4 h-4 animate-spin" /> Generating Study Materials...</>
          ) : (
            <><Brain className="w-4 h-4" /> Generate Study Materials</>
          )}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-semibold">Share this study pack</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Send a read-only preview link to a friend.</p>
              </div>
              <button
                type="button"
                onClick={handleShare}
                disabled={sharing}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {sharing ? 'Generating...' : 'Copy Share Link'}
              </button>
            </div>
            {shareStatus && (
              <p className={`mt-3 text-sm ${shareStatus.toLowerCase().includes('failed') ? 'text-red-500' : 'text-green-600'}`}>
                {shareStatus}
              </p>
            )}
            {shareUrl && (
              <p className="mt-2 text-xs text-gray-500 break-all">{shareUrl}</p>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-violet-600" /> Summary
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{result.summary}</p>
          </div>

          {/* Key Concepts */}
          {result.keyConcepts.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" /> Key Concepts
              </h2>
              <div className="flex flex-wrap gap-2">
                {result.keyConcepts.map((concept, i) => (
                  <span key={i} className="bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 px-3 py-1.5 rounded-lg text-sm">
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Study Plan */}
          {result.studyPlan.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-500" /> Study Plan
              </h2>
              <ol className="space-y-2">
                {result.studyPlan.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Flashcards */}
          {result.flashcards.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold mb-4">
                Flashcards ({result.flashcards.length})
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {result.flashcards.map((card, i) => (
                  <div
                    key={i}
                    onClick={() => toggleFlashcard(i)}
                    className="cursor-pointer border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-violet-300 dark:hover:border-violet-700 transition-all min-h-[80px] flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{flippedCards.has(i) ? card.back : card.front}</p>
                      {flippedCards.has(i) ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{flippedCards.has(i) ? 'Answer' : 'Question — click to flip'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
