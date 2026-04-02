'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Brain, Loader2, ChevronDown, ChevronUp, BookOpen, List, Zap, Map } from 'lucide-react'
import toast from '@/lib/toast'

const CURRICULA = ['IB', 'AP', 'SAT', 'ACT', 'A-Level', 'GCSE', 'Other']
const LEVELS = ['HL', 'SL', 'Standard', 'Advanced', 'Honors']
const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Economics', 'Psychology', 'Computer Science', 'Art', 'French', 'Spanish', 'Other']

export default function StudyPage() {
  const [form, setForm] = useState({ title: '', subject: '', level: '', curriculum: '', content: '', contentType: 'text' as const })
  const [expanded, setExpanded] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: materials, isLoading: loadingMaterials } = useQuery({
    queryKey: ['study-materials'],
    queryFn: () => fetch('/api/study').then(r => r.json()),
  })

  const mutation = useMutation({
    mutationFn: (data: typeof form) => fetch('/api/study', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    }).then(r => { if (!r.ok) throw new Error('Failed'); return r.json() }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['study-materials'] }); toast.success('Study material generated!'); setForm(f => ({ ...f, content: '', title: '' })) },
    onError: () => toast.error('Failed to generate. Check your OpenAI API key.'),
  })

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3"><Brain className="w-8 h-8 text-indigo-500" /> Study Assistant</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Paste your study material and get AI-generated notes, flashcards, and study plans</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold mb-4">Add Study Material</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Chapter 5: Thermodynamics"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select...</option>
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Curriculum</label>
                  <select value={form.curriculum} onChange={e => setForm(f => ({ ...f, curriculum: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select...</option>
                    {CURRICULA.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Level (optional)</label>
                <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select...</option>
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Study Content</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  rows={8} placeholder="Paste your textbook excerpt, lecture notes, or any study material here..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
              <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending || !form.content || !form.subject || !form.title}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {mutation.isPending ? 'Generating...' : 'Generate Study Materials'}
              </button>
            </div>
          </div>

          {/* Materials List */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Your Materials ({(materials as any[])?.length || 0})</h2>
            {loadingMaterials ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
            ) : (
              <div className="space-y-3">
                {(materials as any[])?.map((m: any) => (
                  <div key={m.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <button onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div>
                        <p className="font-medium">{m.title}</p>
                        <p className="text-sm text-gray-500">{m.subject} {m.curriculum ? `· ${m.curriculum}` : ''} {m.level ? `· ${m.level}` : ''}</p>
                      </div>
                      {expanded === m.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {expanded === m.id && (
                      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
                        {/* Tabs */}
                        <StudyMaterialTabs material={m} />
                      </div>
                    )}
                  </div>
                ))}
                {!(materials as any[])?.length && (
                  <div className="text-center py-12 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No study materials yet. Add your first one!</p>
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

function StudyMaterialTabs({ material }: { material: any }) {
  const [tab, setTab] = useState<'summary' | 'notes' | 'flashcards' | 'plan'>('summary')
  const tabs = [
    { id: 'summary', label: 'Summary', icon: List },
    { id: 'notes', label: 'Notes', icon: BookOpen },
    { id: 'flashcards', label: 'Flashcards', icon: Zap },
    { id: 'plan', label: 'Study Plan', icon: Map },
  ] as const

  return (
    <div>
      <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-md transition-colors ${tab === t.id ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <t.icon className="w-3 h-3" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'summary' && <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{material.summary || 'No summary available.'}</div>}
      {tab === 'notes' && <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{material.notes || 'No notes available.'}</div>}
      {tab === 'flashcards' && (
        <div className="space-y-2">
          {(material.flashcards as any[])?.map((fc: any, i: number) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <p className="font-medium text-sm mb-1">Q: {fc.front}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">A: {fc.back}</p>
            </div>
          )) || <p className="text-sm text-gray-500">No flashcards available.</p>}
        </div>
      )}
      {tab === 'plan' && <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{material.studyPlan || 'No study plan available.'}</div>}
    </div>
  )
}
