'use client'

import { useMemo, useState } from 'react'

type Student = { id: string; name: string }
type ClassItem = { id: string; name: string; students: Student[] }

type WorksheetQuestion = {
  question: string
  type?: string
  marks?: number
}

type GeneratedWorksheet = {
  id?: string
  title?: string
  questions?: WorksheetQuestion[]
}

const seedClasses: ClassItem[] = [
  {
    id: 'c1',
    name: 'IB English HL - Tues/Thu',
    students: [
      { id: 's1', name: 'Junki Okada' },
      { id: 's2', name: 'Mina Park' },
    ],
  },
  {
    id: 'c2',
    name: 'SAT Math - Mon/Wed',
    students: [
      { id: 's3', name: 'Alex Chen' },
      { id: 's4', name: 'Rina Sato' },
    ],
  },
]

export default function QuickstartPage() {
  const [classId, setClassId] = useState(seedClasses[0].id)
  const currentClass = useMemo(() => seedClasses.find(c => c.id === classId) || seedClasses[0], [classId])
  const [studentId, setStudentId] = useState(currentClass.students[0].id)

  const [topic, setTopic] = useState('Textual Analysis')
  const [difficulty, setDifficulty] = useState('Medium')
  const [worksheetReady, setWorksheetReady] = useState(false)
  const [worksheet, setWorksheet] = useState<GeneratedWorksheet | null>(null)
  const [generationBusy, setGenerationBusy] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  const [assigned, setAssigned] = useState(false)
  const [assigning, setAssigning] = useState(false)

  const [score, setScore] = useState('')
  const [scores, setScores] = useState<number[]>([68, 72, 75])
  const [recordingScore, setRecordingScore] = useState(false)

  const [comment, setComment] = useState('')
  const [reportSaved, setReportSaved] = useState(false)
  const [savingReport, setSavingReport] = useState(false)
  const [reportError, setReportError] = useState<string | null>(null)

  const selectedStudent = useMemo(() => currentClass.students.find(s => s.id === studentId) || currentClass.students[0], [currentClass, studentId])

  const generateWorksheet = async () => {
    setGenerationBusy(true)
    setGenerationError(null)
    setWorksheetReady(false)
    setAssigned(false)

    try {
      const res = await fetch('/api/worksheets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentClass.name.includes('English') ? 'English' : 'Math',
          curriculum: currentClass.name.includes('IB') ? 'IB' : 'SAT',
          topic,
          difficulty,
          count: 5,
          questionTypes: ['Mixed'],
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to generate worksheet')

      setWorksheet(data)
      setWorksheetReady(true)
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Failed to generate worksheet')
    } finally {
      setGenerationBusy(false)
    }
  }

  const assignWorksheet = async () => {
    if (!worksheetReady) return

    setAssigning(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'quickstart_assignment',
          message: `Assigned worksheet \"${worksheet?.title || topic}\" to ${selectedStudent.name} (${currentClass.name})`,
          page: '/dashboard/quickstart',
          sentiment: 'positive',
          severity: 'low',
          metadata: {
            classId,
            studentId,
            topic,
            difficulty,
          },
        }),
      })
      setAssigned(true)
    } finally {
      setAssigning(false)
    }
  }

  const recordScore = async () => {
    const n = Number(score)
    if (Number.isNaN(n) || n < 0 || n > 100) return

    setRecordingScore(true)
    try {
      setScores(prev => [...prev, n])
      setScore('')
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'quickstart_score',
          message: `Recorded score ${n} for ${selectedStudent.name} (${topic})`,
          page: '/dashboard/quickstart',
          sentiment: n >= 70 ? 'positive' : 'neutral',
          severity: 'low',
          metadata: { classId, studentId, score: n, topic },
        }),
      })
    } finally {
      setRecordingScore(false)
    }
  }

  const saveReport = async () => {
    if (!comment.trim()) return

    setSavingReport(true)
    setReportError(null)

    try {
      const reportTitle = `Monthly report • ${selectedStudent.name} • ${new Date().toLocaleDateString()}`
      const reportBody = [
        `Class: ${currentClass.name}`,
        `Student: ${selectedStudent.name}`,
        `Latest worksheet topic: ${topic}`,
        `Difficulty: ${difficulty}`,
        `Scores: ${scores.join(', ')}`,
        '',
        `Tutor comment: ${comment.trim()}`,
      ].join('\n')

      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reportTitle,
          content: reportBody,
          tags: ['monthly-report', 'quickstart', selectedStudent.name],
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to save report')

      setReportSaved(true)
    } catch (error) {
      setReportError(error instanceof Error ? error.message : 'Failed to save report')
      setReportSaved(false)
    } finally {
      setSavingReport(false)
    }
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tutor Quickstart (Funnel A MVP)</h1>
        <p className="text-gray-500 mt-2">Now wired to live APIs for worksheet generation + report persistence.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="rounded-2xl border p-4 bg-white dark:bg-gray-900">
          <h2 className="font-semibold">1) Pick Class & Student</h2>
          <div className="space-y-2 mt-3">
            <select value={classId} onChange={e => { setClassId(e.target.value); const cls = seedClasses.find(c => c.id === e.target.value) || seedClasses[0]; setStudentId(cls.students[0].id) }} className="w-full border rounded-lg px-3 py-2 bg-transparent">
              {seedClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={studentId} onChange={e => setStudentId(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-transparent">
              {currentClass.students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </section>

        <section className="rounded-2xl border p-4 bg-white dark:bg-gray-900">
          <h2 className="font-semibold">2) Generate Worksheet</h2>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <input value={topic} onChange={e => setTopic(e.target.value)} className="border rounded-lg px-3 py-2 bg-transparent" placeholder="Topic" />
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="border rounded-lg px-3 py-2 bg-transparent">
              <option>Easy</option><option>Medium</option><option>Hard</option>
            </select>
          </div>
          <button onClick={generateWorksheet} disabled={generationBusy} className="mt-3 rounded-lg bg-indigo-600 text-white px-4 py-2 disabled:opacity-50">
            {generationBusy ? 'Generating…' : 'Generate'}
          </button>
          {generationError && <p className="text-sm text-red-600 mt-2">{generationError}</p>}
          {worksheetReady && <p className="text-sm text-green-600 mt-2">Worksheet ready for {selectedStudent.name}: {topic} ({difficulty})</p>}
          {worksheet?.questions?.length ? (
            <ul className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300 list-disc pl-5">
              {worksheet.questions.slice(0, 3).map((q, idx) => (
                <li key={idx}>{q.question}</li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="rounded-2xl border p-4 bg-white dark:bg-gray-900">
          <h2 className="font-semibold">3) Assign to Student</h2>
          <button onClick={assignWorksheet} disabled={!worksheetReady || assigning} className="mt-3 rounded-lg bg-slate-800 text-white px-4 py-2 disabled:opacity-50">
            {assigning ? 'Assigning…' : 'Assign Worksheet'}
          </button>
          {assigned && <p className="text-sm text-green-600 mt-2">Assigned successfully.</p>}
        </section>

        <section className="rounded-2xl border p-4 bg-white dark:bg-gray-900">
          <h2 className="font-semibold">4) Record Score + Trend</h2>
          <div className="flex gap-2 mt-3">
            <input value={score} onChange={e => setScore(e.target.value)} placeholder="Score 0-100" className="border rounded-lg px-3 py-2 bg-transparent" />
            <button onClick={recordScore} disabled={recordingScore} className="rounded-lg bg-indigo-600 text-white px-4 py-2 disabled:opacity-50">
              {recordingScore ? 'Saving…' : 'Record'}
            </button>
          </div>
          <div className="mt-3 flex items-end gap-2 h-24">
            {scores.map((s, i) => (
              <div key={i} className="w-8 bg-indigo-500/80 rounded-t" style={{ height: `${Math.max(8, s)}%` }} title={`Attempt ${i + 1}: ${s}`} />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">Score trend for {selectedStudent.name}</p>
        </section>
      </div>

      <section className="rounded-2xl border p-4 bg-white dark:bg-gray-900">
        <h2 className="font-semibold">5) Monthly Report (Tutor Comment Required)</h2>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} className="w-full mt-3 border rounded-lg px-3 py-2 bg-transparent" placeholder="Tutor comment on progress, weak areas, and next steps..." />
        <button onClick={saveReport} disabled={savingReport} className="mt-3 rounded-lg bg-indigo-600 text-white px-4 py-2 disabled:opacity-50">
          {savingReport ? 'Saving…' : 'Save Monthly Report'}
        </button>
        {reportError && <p className="text-sm text-red-600 mt-2">{reportError}</p>}
        {reportSaved && (
          <div className="mt-3 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-700">
            Report saved for {selectedStudent.name}. Tutor comment stored in Notes.
          </div>
        )}
      </section>
    </main>
  )
}
