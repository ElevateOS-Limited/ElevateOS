'use client'

import { useState, useEffect, useRef } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useMutation } from '@tanstack/react-query'
import { Clock, Play, Square, ChevronRight, Loader2 } from 'lucide-react'
import toast from '@/lib/toast'

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Economics']
const CURRICULA = ['IB', 'AP', 'SAT', 'ACT', 'A-Level']

function calculateScore(exam: any, answers: Record<number, string>) {
  if (!exam?.answers || !Array.isArray(exam.questions)) {
    return null
  }

  let correct = 0
  ;(exam.questions as any[]).forEach((question: any, index: number) => {
    const userAnswer = answers[question.id]?.toLowerCase().trim()
    const correctAnswer = (exam.answers as any[])[index]?.answer?.toLowerCase().trim()
    if (userAnswer && correctAnswer && (userAnswer.includes(correctAnswer) || correctAnswer.includes(userAnswer))) {
      correct += 1
    }
  })

  return Math.round((correct / (exam.questions as any[]).length) * 100)
}

export default function PastPapersPage() {
  const [form, setForm] = useState({ subject: '', curriculum: 'IB', duration: 60, questionCount: 15 })
  const [exam, setExam] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const mutation = useMutation({
    mutationFn: (data: any) => fetch('/api/worksheets', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, questionType: 'mixed', difficulty: 'exam', count: data.questionCount }),
    }).then(r => { if (!r.ok) throw new Error('Failed'); return r.json() }),
    onSuccess: (data) => {
      setExam(data)
      setTimeLeft(form.duration * 60)
      setAnswers({})
      setFinished(false)
      setScore(null)
    },
    onError: () => toast.error('Failed to generate exam'),
  })

  useEffect(() => {
    if (running && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    } else if (timeLeft === 0 && running) {
      setRunning(false)
      setFinished(true)
      setScore(calculateScore(exam, answers))
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [running, timeLeft])

  const handleFinish = () => {
    setFinished(true)
    setRunning(false)
    setScore(calculateScore(exam, answers))
  }

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3"><Clock className="w-8 h-8 text-orange-500" /> Past Paper Simulation</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Timed exam simulations with AI-generated questions</p>
        </div>

        {!exam ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 max-w-lg mx-auto">
            <h2 className="text-xl font-semibold mb-6 text-center">Configure Your Exam</h2>
            <div className="space-y-4">
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
                  {CURRICULA.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration: {form.duration} minutes</label>
                <input type="range" min={15} max={180} step={15} value={form.duration} onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))} className="w-full accent-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Questions: {form.questionCount}</label>
                <input type="range" min={5} max={30} value={form.questionCount} onChange={e => setForm(f => ({ ...f, questionCount: +e.target.value }))} className="w-full accent-orange-500" />
              </div>
              <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending || !form.subject}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {mutation.isPending ? 'Generating Exam...' : 'Generate & Start Exam'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Timer bar */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6 flex items-center justify-between">
              <div className="text-2xl font-mono font-bold text-orange-500">{formatTime(timeLeft)}</div>
              <div className="text-sm text-gray-500">{exam.title}</div>
              <div className="flex gap-2">
                {!running && !finished && (
                  <button onClick={() => setRunning(true)} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium">
                    <Play className="w-4 h-4" /> Start Timer
                  </button>
                )}
                {running && (
                  <button onClick={handleFinish} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium">
                    <Square className="w-4 h-4" /> Submit Exam
                  </button>
                )}
                <button onClick={() => { setExam(null); setFinished(false) }} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm">
                  New Exam
                </button>
              </div>
            </div>

            {score !== null && (
              <div className={`mb-6 p-4 rounded-xl text-center ${score >= 70 ? 'bg-green-50 dark:bg-green-900/30 border border-green-200' : score >= 50 ? 'bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200' : 'bg-red-50 dark:bg-red-900/30 border border-red-200'}`}>
                <p className="text-3xl font-bold mb-1">{score}%</p>
                <p className="text-sm">{score >= 70 ? '🎉 Excellent work!' : score >= 50 ? '📚 Good effort, keep practicing!' : '💪 Keep studying, you\'ll get there!'}</p>
              </div>
            )}

            <div className="space-y-4">
              {(exam.questions as any[]).map((q: any, i: number) => (
                <div key={q.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                  <p className="font-medium mb-3">Q{i + 1}. {q.question} <span className="text-gray-400 font-normal text-sm">({q.points} pts)</span></p>
                  {q.options ? (
                    <div className="space-y-2">{q.options.map((opt: string, j: number) => (
                      <label key={j} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${answers[q.id] === opt ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                        <input type="radio" name={`q-${q.id}`} value={opt} disabled={finished}
                          onChange={() => setAnswers(a => ({ ...a, [q.id]: opt }))} className="accent-indigo-500" />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}</div>
                  ) : (
                    <textarea disabled={finished} value={answers[q.id] || ''} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                      rows={3} placeholder="Your answer..." className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                  )}
                  {finished && (exam.answers as any[])?.[i] && (
                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-2 border-green-500">
                      <p className="text-xs font-medium text-green-700">Model Answer: {(exam.answers as any[])[i].answer}</p>
                      <p className="text-xs text-green-600 mt-1">{(exam.answers as any[])[i].explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
