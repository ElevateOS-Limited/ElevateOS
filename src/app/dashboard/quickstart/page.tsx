'use client'

import { useEffect, useMemo, useState } from 'react'

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

type ProfileResponse = {
  name?: string | null
  coursesTaking?: string[]
}

type FeedbackEntry = {
  id: string
  category: string
  message: string
  createdAt: string
}

type NoteEntry = {
  id: string
  title: string
  updatedAt: string
}

const QUICKSTART_STATE_KEY = 'funnelA.quickstart.state.v1'

const fallbackClasses: ClassItem[] = [
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
  const [classes, setClasses] = useState<ClassItem[]>(fallbackClasses)
  const [classId, setClassId] = useState(fallbackClasses[0].id)

  const currentClass = useMemo(() => classes.find(c => c.id === classId) || classes[0], [classId, classes])
  const [studentId, setStudentId] = useState(currentClass?.students?.[0]?.id || '')

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

  const [recentFeedback, setRecentFeedback] = useState<FeedbackEntry[]>([])
  const [recentReports, setRecentReports] = useState<NoteEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [lastHistorySyncAt, setLastHistorySyncAt] = useState<string | null>(null)
  const [sourceMode, setSourceMode] = useState<'profile' | 'fallback'>('fallback')

  const selectedStudent = useMemo(
    () => currentClass?.students?.find(s => s.id === studentId) || currentClass?.students?.[0],
    [currentClass, studentId]
  )

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(QUICKSTART_STATE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw) as {
        classId?: string
        studentId?: string
        topic?: string
        difficulty?: string
      }
      if (saved.classId) setClassId(saved.classId)
      if (saved.studentId) setStudentId(saved.studentId)
      if (saved.topic) setTopic(saved.topic)
      if (saved.difficulty) setDifficulty(saved.difficulty)
    } catch {
      // ignore invalid cached state
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(
      QUICKSTART_STATE_KEY,
      JSON.stringify({ classId, studentId, topic, difficulty })
    )
  }, [classId, studentId, topic, difficulty])

  useEffect(() => {
    const loadProfileBackedClassList = async () => {
      try {
        const res = await fetch('/api/user/profile')
        if (!res.ok) return

        const profile: ProfileResponse = await res.json()
        const courseNames = Array.isArray(profile?.coursesTaking) ? profile.coursesTaking.filter(Boolean) : []
        if (!courseNames.length) return

        const tutorLabel = profile?.name?.trim() || 'Tutor'
        const dynamicClasses: ClassItem[] = courseNames.map((course, idx) => ({
          id: `profile-class-${idx + 1}`,
          name: course,
          students: [
            { id: `profile-student-${idx + 1}-a`, name: `${tutorLabel} - Student A` },
            { id: `profile-student-${idx + 1}-b`, name: `${tutorLabel} - Student B` },
          ],
        }))

        setClasses(dynamicClasses)
        setClassId(dynamicClasses[0].id)
        setStudentId(dynamicClasses[0].students[0].id)
        setSourceMode('profile')
      } catch {
        // fallback classes remain
      }
    }

    loadProfileBackedClassList()
  }, [])

  const loadHistory = async () => {
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      const [feedbackRes, notesRes] = await Promise.all([
        fetch('/api/feedback'),
        fetch('/api/notes?q=monthly%20report'),
      ])

      if (!feedbackRes.ok || !notesRes.ok) {
        throw new Error('Unable to refresh quickstart history right now.')
      }

      const feedbackData = (await feedbackRes.json()) as FeedbackEntry[]
      setRecentFeedback(
        feedbackData
          .filter((entry) => entry.category?.includes('quickstart'))
          .slice(0, 5)
      )

      const notesData = (await notesRes.json()) as NoteEntry[]
      setRecentReports(notesData.slice(0, 5))
      setLastHistorySyncAt(new Date().toISOString())
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : 'Unable to refresh history.')
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const generateWorksheet = async () => {
    if (!topic.trim()) {
      setGenerationError('Please enter a topic before generating.')
      return
    }

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
    if (!worksheetReady || !selectedStudent) return

    setAssigning(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'quickstart_assignment',
          message: `Assigned worksheet \"${worksheet?.title || topic}\" to ${selectedStudent.name} (${currentClass.name})`,
        }),
      })
      setAssigned(true)
      await loadHistory()
    } finally {
      setAssigning(false)
    }
  }

  const recordScore = async () => {
    const n = Number(score)
    if (Number.isNaN(n) || n < 0 || n > 100 || !selectedStudent) return

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
        }),
      })
      await loadHistory()
    } finally {
      setRecordingScore(false)
    }
  }

  const saveReport = async () => {
    if (!comment.trim() || !selectedStudent) return

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
      await loadHistory()
    } catch (error) {
      setReportError(error instanceof Error ? error.message : 'Failed to save report')
      setReportSaved(false)
    } finally {
      setSavingReport(false)
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 space-y-6 overflow-x-hidden">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Tutor Quickstart (Funnel A MVP)</h1>
        <p className="text-sm sm:text-base text-gray-500">Live API flow with profile-backed class list + assignment/report history.</p>
        <p className="text-xs text-gray-500">
          Data source: {sourceMode === 'profile' ? 'Profile-backed classes' : 'Fallback demo classes'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="rounded-2xl border p-4 bg-white dark:bg-gray-900 min-w-0">
          <h2 className="font-semibold">1) Pick Class & Student</h2>
          <div className="space-y-2 mt-3">
            <select value={classId} onChange={e => { setClassId(e.target.value); const cls = classes.find(c => c.id === e.target.value) || classes[0]; setStudentId(cls.students[0].id) }} className="w-full border rounded-lg px-3 py-2 bg-transparent">
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={studentId} onChange={e => setStudentId(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-transparent">
              {currentClass?.students?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </section>

        <section className="rounded-2xl border p-4 bg-white dark:bg-gray-900 min-w-0">
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
          {worksheetReady && selectedStudent && <p className="text-sm text-green-600 mt-2">Worksheet ready for {selectedStudent.name}: {topic} ({difficulty})</p>}
          {worksheet?.questions?.length ? (
            <ul className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300 list-disc pl-5">
              {worksheet.questions.slice(0, 3).map((q, idx) => (
                <li key={idx}>{q.question}</li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="rounded-2xl border p-4 bg-white dark:bg-gray-900 min-w-0">
          <h2 className="font-semibold">3) Assign to Student</h2>
          <button onClick={assignWorksheet} disabled={!worksheetReady || assigning} className="mt-3 rounded-lg bg-slate-800 text-white px-4 py-2 disabled:opacity-50">
            {assigning ? 'Assigning…' : 'Assign Worksheet'}
          </button>
          {assigned && <p className="text-sm text-green-600 mt-2">Assigned successfully.</p>}
        </section>

        <section className="rounded-2xl border p-4 bg-white dark:bg-gray-900 min-w-0">
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
          {selectedStudent && <p className="text-xs text-gray-500 mt-1">Score trend for {selectedStudent.name}</p>}
        </section>
      </div>

      <section className="rounded-2xl border p-4 bg-white dark:bg-gray-900">
        <h2 className="font-semibold">5) Monthly Report (Tutor Comment Required)</h2>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} className="w-full mt-3 border rounded-lg px-3 py-2 bg-transparent" placeholder="Tutor comment on progress, weak areas, and next steps..." />
        <button onClick={saveReport} disabled={savingReport} className="mt-3 rounded-lg bg-indigo-600 text-white px-4 py-2 disabled:opacity-50">
          {savingReport ? 'Saving…' : 'Save Monthly Report'}
        </button>
        {reportError && <p className="text-sm text-red-600 mt-2">{reportError}</p>}
        {reportSaved && selectedStudent && (
          <div className="mt-3 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-700">
            Report saved for {selectedStudent.name}. Tutor comment stored in Notes.
          </div>
        )}
      </section>

      <section className="rounded-2xl border p-4 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Quickstart Activity History</h2>
          <button onClick={loadHistory} className="text-sm underline underline-offset-2">Refresh</button>
        </div>
        {lastHistorySyncAt ? (
          <p className="text-xs text-gray-500 mt-1">Last synced: {new Date(lastHistorySyncAt).toLocaleString()}</p>
        ) : null}
        {historyError ? <p className="text-xs text-red-600 mt-1">{historyError}</p> : null}

        <div className="grid md:grid-cols-2 gap-4 mt-3">
          <div>
            <p className="text-sm font-medium mb-2">Recent assignments / score logs</p>
            {historyLoading ? <p className="text-xs text-gray-500">Loading…</p> : null}
            <ul className="space-y-2 text-sm">
              {recentFeedback.length ? recentFeedback.map(item => (
                <li key={item.id} className="border rounded-lg p-2">
                  <p className="break-words">{item.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                </li>
              )) : <li className="text-xs text-gray-500">No activity yet.</li>}
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Recent monthly reports</p>
            <ul className="space-y-2 text-sm">
              {recentReports.length ? recentReports.map(item => (
                <li key={item.id} className="border rounded-lg p-2">
                  <p>{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(item.updatedAt).toLocaleString()}</p>
                </li>
              )) : <li className="text-xs text-gray-500">No report saved yet.</li>}
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}
