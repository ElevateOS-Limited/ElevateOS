'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Settings, Loader2, Plus, X } from 'lucide-react'
import toast from '@/lib/toast'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<any>({ name: '', gradeLevel: '', curriculum: '', gpa: '', satScore: '', actScore: '', intendedMajor: '', location: '' })
  const [subjects, setSubjects] = useState<string[]>([])
  const [universities, setUniversities] = useState<string[]>([])
  const [interests, setInterests] = useState<string[]>([])
  const [newSubject, setNewSubject] = useState('')
  const [newUni, setNewUni] = useState('')
  const [newInterest, setNewInterest] = useState('')

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => fetch('/api/profile').then(r => r.json()),
  })

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name || '', gradeLevel: profile.gradeLevel || '', curriculum: profile.curriculum || '', gpa: profile.gpa || '', satScore: profile.satScore || '', actScore: profile.actScore || '', intendedMajor: profile.intendedMajor || '', location: profile.location || '' })
      setSubjects(profile.subjects || [])
      setUniversities(profile.targetUniversities || [])
      setInterests(profile.careerInterests || [])
    }
  }, [profile])

  const mutation = useMutation({
    mutationFn: (data: any) => fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['profile'] }); toast.success('Profile saved!') },
    onError: () => toast.error('Failed to save'),
  })

  const handleSave = () => mutation.mutate({ ...form, gpa: form.gpa ? +form.gpa : null, satScore: form.satScore ? +form.satScore : null, actScore: form.actScore ? +form.actScore : null, subjects, targetUniversities: universities, careerInterests: interests })

  const addItem = (arr: string[], setArr: (v: string[]) => void, val: string, setVal: (v: string) => void) => {
    if (val.trim() && !arr.includes(val.trim())) { setArr([...arr, val.trim()]); setVal('') }
  }

  if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin" /></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3"><Settings className="w-8 h-8 text-gray-500" /> Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Keep your profile updated for better AI personalization</p>
        </div>

        <div className="space-y-6">
          <Section title="Personal Info">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name" value={form.name} onChange={v => setForm((f: any) => ({ ...f, name: v }))} />
              <Field label="Location" value={form.location} onChange={v => setForm((f: any) => ({ ...f, location: v }))} placeholder="City, Country" />
            </div>
          </Section>

          <Section title="Academic Profile">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Grade Level</label>
                <select value={form.gradeLevel} onChange={e => setForm((f: any) => ({ ...f, gradeLevel: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select...</option>
                  {['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Gap Year'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Curriculum</label>
                <select value={form.curriculum} onChange={e => setForm((f: any) => ({ ...f, curriculum: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select...</option>
                  {['IB', 'AP', 'SAT', 'A-Level', 'GCSE', 'Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Field label="GPA (e.g. 3.85)" type="number" value={form.gpa} onChange={v => setForm((f: any) => ({ ...f, gpa: v }))} />
              <Field label="SAT Score" type="number" value={form.satScore} onChange={v => setForm((f: any) => ({ ...f, satScore: v }))} />
              <Field label="ACT Score" type="number" value={form.actScore} onChange={v => setForm((f: any) => ({ ...f, actScore: v }))} />
              <Field label="Intended Major" value={form.intendedMajor} onChange={v => setForm((f: any) => ({ ...f, intendedMajor: v }))} />
            </div>
          </Section>

          <Section title="Subjects">
            <TagInput items={subjects} setItems={setSubjects} newVal={newSubject} setNewVal={setNewSubject} placeholder="Add subject (e.g. IB Math HL)" onAdd={() => addItem(subjects, setSubjects, newSubject, setNewSubject)} />
          </Section>

          <Section title="Target Universities">
            <TagInput items={universities} setItems={setUniversities} newVal={newUni} setNewVal={setNewUni} placeholder="Add university (e.g. MIT)" onAdd={() => addItem(universities, setUniversities, newUni, setNewUni)} />
          </Section>

          <Section title="Career Interests">
            <TagInput items={interests} setItems={setInterests} newVal={newInterest} setNewVal={setNewInterest} placeholder="Add interest (e.g. AI Research)" onAdd={() => addItem(interests, setInterests, newInterest, setNewInterest)} />
          </Section>

          <button onClick={handleSave} disabled={mutation.isPending}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Profile
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
      <h2 className="text-base font-semibold mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }: { label: string; value: any; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
  )
}

function TagInput({ items, setItems, newVal, setNewVal, placeholder, onAdd }: any) {
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.map((item: string) => (
          <span key={item} className="flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm">
            {item}
            <button onClick={() => setItems(items.filter((i: string) => i !== item))}><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={newVal} onChange={e => setNewVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && onAdd()} placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
        <button onClick={onAdd} className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"><Plus className="w-4 h-4" /></button>
      </div>
    </div>
  )
}
