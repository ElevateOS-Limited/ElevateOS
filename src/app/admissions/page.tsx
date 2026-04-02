'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useMutation } from '@tanstack/react-query'
import { GraduationCap, Loader2, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import toast from '@/lib/toast'

export default function AdmissionsPage() {
  const [form, setForm] = useState({ university: '', major: '', gpa: '', satScore: '', actScore: '', curriculum: '' })
  const [result, setResult] = useState<any>(null)

  const mutation = useMutation({
    mutationFn: (data: any) => fetch('/api/admissions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, gpa: data.gpa ? +data.gpa : undefined, satScore: data.satScore ? +data.satScore : undefined, actScore: data.actScore ? +data.actScore : undefined }),
    }).then(r => { if (!r.ok) throw new Error('Failed'); return r.json() }),
    onSuccess: (data) => { setResult(data); toast.success('Analysis complete!') },
    onError: () => toast.error('Analysis failed. Check your API key.'),
  })

  const difficultyColor = (d: string) => ({ reach: 'text-red-600 bg-red-50', match: 'text-yellow-600 bg-yellow-50', safety: 'text-green-600 bg-green-50' }[d] || 'text-gray-600 bg-gray-50')

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3"><GraduationCap className="w-8 h-8 text-green-500" /> Admissions Assistant</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">AI-powered university admissions analysis and essay guidance</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold mb-4">Analyze University</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Target University *</label>
                <input value={form.university} onChange={e => setForm(f => ({ ...f, university: e.target.value }))}
                  placeholder="e.g. MIT, Oxford, Harvard..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Intended Major</label>
                <input value={form.major} onChange={e => setForm(f => ({ ...f, major: e.target.value }))}
                  placeholder="e.g. Computer Science, Economics..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">GPA (4.0)</label>
                  <input type="number" min="0" max="4" step="0.01" value={form.gpa} onChange={e => setForm(f => ({ ...f, gpa: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">SAT Score</label>
                  <input type="number" min="400" max="1600" value={form.satScore} onChange={e => setForm(f => ({ ...f, satScore: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ACT Score</label>
                  <input type="number" min="1" max="36" value={form.actScore} onChange={e => setForm(f => ({ ...f, actScore: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending || !form.university}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {mutation.isPending ? 'Analyzing...' : 'Analyze My Chances'}
              </button>
            </div>
          </div>

          <div>
            {result ? (
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{result.university}</h3>
                      <p className="text-gray-500">Acceptance Rate: {result.acceptanceRate}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${difficultyColor(result.difficulty)}`}>
                      {result.difficulty}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[['Typical GPA', result.typicalGPA], ['Typical SAT', result.typicalSAT], ['Typical ACT', result.typicalACT]].map(([label, val]) => (
                      <div key={label as string} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">{label as string}</p>
                        <p className="font-semibold text-sm">{val as string || 'N/A'}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{result.studentAssessment}</p>

                  {result.strengths?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-green-600 mb-2 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Strengths</p>
                      <ul className="space-y-1">{result.strengths?.map((s: string, i: number) => <li key={i} className="text-sm text-gray-600 dark:text-gray-400">• {s}</li>)}</ul>
                    </div>
                  )}

                  {result.improvements?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-orange-600 mb-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Areas to Improve</p>
                      <ul className="space-y-1">{result.improvements?.map((s: string, i: number) => <li key={i} className="text-sm text-gray-600 dark:text-gray-400">• {s}</li>)}</ul>
                    </div>
                  )}

                  {result.recommendations?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-indigo-600 mb-2 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Recommendations</p>
                      <ul className="space-y-1">{result.recommendations?.map((s: string, i: number) => <li key={i} className="text-sm text-gray-600 dark:text-gray-400">• {s}</li>)}</ul>
                    </div>
                  )}
                </div>

                {result.essayTips && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                    <h4 className="font-semibold mb-2">Essay Tips for {result.university}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{result.essayTips}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-64 text-gray-400">
                <GraduationCap className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">Enter a university to analyze</p>
                <p className="text-sm">Get AI-powered admission insights</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
