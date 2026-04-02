'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useMutation } from '@tanstack/react-query'
import { Briefcase, Loader2, MapPin, Clock, DollarSign } from 'lucide-react'
import toast from '@/lib/toast'

const MAJORS = ['Computer Science', 'Engineering', 'Biology/Pre-Med', 'Business', 'Economics', 'Psychology', 'Political Science', 'Mathematics', 'Physics', 'Chemistry', 'Environmental Science', 'Art & Design', 'Law', 'Education', 'Other']

export default function InternshipsPage() {
  const [form, setForm] = useState({ major: '', interests: '', skills: '', location: '', gradeLevel: '' })
  const [result, setResult] = useState<any>(null)

  const mutation = useMutation({
    mutationFn: (data: any) => fetch('/api/internships', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, interests: data.interests.split(',').map((s: string) => s.trim()).filter(Boolean), skills: data.skills.split(',').map((s: string) => s.trim()).filter(Boolean) }),
    }).then(r => { if (!r.ok) throw new Error('Failed'); return r.json() }),
    onSuccess: (data) => { setResult(data); toast.success('Found opportunities!') },
    onError: () => toast.error('Failed to get recommendations'),
  })

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3"><Briefcase className="w-8 h-8 text-pink-500" /> Internship Recommender</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Find internships and programs that strengthen your university application</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold mb-4">Your Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Intended Major *</label>
                <select value={form.major} onChange={e => setForm(f => ({ ...f, major: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select...</option>
                  {MAJORS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Interests (comma-separated)</label>
                <input value={form.interests} onChange={e => setForm(f => ({ ...f, interests: e.target.value }))}
                  placeholder="AI, climate, healthcare..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Skills (comma-separated)</label>
                <input value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
                  placeholder="Python, Excel, research..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location Preference</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. USA, London, Remote..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending || !form.major}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {mutation.isPending ? 'Finding...' : 'Find Opportunities'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            {result?.internships ? (
              <div className="space-y-4">
                {result.generalAdvice && (
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
                    <p className="text-sm text-indigo-800 dark:text-indigo-300">{result.generalAdvice}</p>
                  </div>
                )}
                {result.internships.map((intern: any, i: number) => (
                  <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{intern.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{intern.organization}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        intern.type === 'internship' ? 'bg-blue-100 text-blue-700' :
                        intern.type === 'research' ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'
                      }`}>{intern.type}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{intern.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                      {intern.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{intern.location}</span>}
                      {intern.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{intern.duration}</span>}
                      {intern.stipend && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{intern.stipend}</span>}
                      {intern.applicationPeriod && <span>Apply: {intern.applicationPeriod}</span>}
                    </div>
                    {intern.requirements?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium mb-1">Requirements:</p>
                        <div className="flex flex-wrap gap-1">{intern.requirements.map((r: string, j: number) => (
                          <span key={j} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">{r}</span>
                        ))}</div>
                      </div>
                    )}
                    {intern.applicationTips && (
                      <p className="text-xs text-green-600 dark:text-green-400 italic">💡 {intern.applicationTips}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-64 text-gray-400">
                <Briefcase className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">Complete your profile to find internships</p>
                <p className="text-sm">We&apos;ll recommend curated opportunities</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
