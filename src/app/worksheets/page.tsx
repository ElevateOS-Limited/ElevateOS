'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Loader2, ChevronDown, ChevronUp, Check } from 'lucide-react'
import toast from '@/lib/toast'

const DIFFICULTIES = ['easy', 'medium', 'hard', 'exam']
const QUESTION_TYPES = ['multiple-choice', 'short-answer', 'long-answer', 'mixed']
const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Literature', 'History', 'Economics', 'Psychology', 'Computer Science', 'Other']

export default function WorksheetsPage() {
  const [form, setForm] = useState({ subject: '', curriculum: '', difficulty: 'medium', questionType: 'mixed', topics: '', count: 10 })
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({})
  const queryClient = useQueryClient()

  const { data: worksheets, isLoading } = useQuery({
    queryKey: ['worksheets'],
    queryFn: () => fetch('/api/worksheets').then(r => r.json()),
  })

  const mutation = useMutation({
    mutationFn: (data: typeof form) => fetch('/api/worksheets', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    }).then(r => { if (!r.ok) throw new Error('Failed'); return r.json() }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['worksheets'] }); toast.success('Worksheet generated!') },
    onError: () => toast.error('Failed to generate worksheet'),
  })

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3"><FileText className="w-8 h-8 text-purple-500" /> Worksheet Generator</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Generate AI-powered practice questions tailored to your curriculum</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold mb-4">Generate New Worksheet</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select subject...</option>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {DIFFICULTIES.map(d => <option key={d} className="capitalize">{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Question Type</label>
                  <select value={form.questionType} onChange={e => setForm(f => ({ ...f, questionType: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {QUESTION_TYPES.map(q => <option key={q}>{q}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Number of Questions: {form.count}</label>
                <input type="range" min={5} max={30} value={form.count} onChange={e => setForm(f => ({ ...f, count: +e.target.value }))}
                  className="w-full accent-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Specific Topics (optional)</label>
                <input value={form.topics} onChange={e => setForm(f => ({ ...f, topics: e.target.value }))}
                  placeholder="e.g. Integration, Newton's laws, Organic chemistry..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending || !form.subject}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {mutation.isPending ? 'Generating...' : 'Generate Worksheet'}
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Your Worksheets ({(worksheets as any[])?.length || 0})</h2>
            {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div> : (
              <div className="space-y-3">
                {(worksheets as any[])?.map((w: any) => (
                  <div key={w.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <button onClick={() => setExpanded(expanded === w.id ? null : w.id)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div>
                        <p className="font-medium">{w.title}</p>
                        <p className="text-sm text-gray-500">{w.subject} · {w.difficulty} · {(w.questions as any[]).length} questions</p>
                      </div>
                      {expanded === w.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {expanded === w.id && (
                      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
                        <div className="space-y-4 mb-4">
                          {(w.questions as any[]).map((q: any, i: number) => (
                            <div key={q.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <p className="font-medium text-sm mb-2">{i + 1}. {q.question} ({q.points} pts)</p>
                              {q.options?.map((opt: string, j: number) => (
                                <p key={j} className="text-sm text-gray-600 dark:text-gray-400 ml-2">{opt}</p>
                              ))}
                              {showAnswers[w.id] && (w.answers as any[])?.[i] && (
                                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-2 border-green-500">
                                  <p className="text-xs font-medium text-green-700 dark:text-green-400">Answer: {(w.answers as any[])[i].answer}</p>
                                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">{(w.answers as any[])[i].explanation}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <button onClick={() => setShowAnswers(s => ({ ...s, [w.id]: !s[w.id] }))}
                          className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          {showAnswers[w.id] ? 'Hide' : 'Show'} Answers
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {!(worksheets as any[])?.length && (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No worksheets yet. Generate your first one!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
