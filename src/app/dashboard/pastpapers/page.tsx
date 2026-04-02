'use client'

import { useState, useEffect, useRef } from 'react'
import { Trophy, Loader, Clock, CheckCircle, XCircle } from 'lucide-react'
import { CURRICULA, IB_SUBJECTS, AP_SUBJECTS } from '@/lib/utils'

interface Question {
  type: string
  question: string
  options?: string[]
  answer: string
  marks: number
}

function calculateScore(exam: Question[] | null, answers: Record<number, string>) {
  let total = 0

  exam?.forEach((question, index) => {
    const userAnswer = answers[index]?.trim().toLowerCase() || ''
    const correctAnswer = question.answer.trim().toLowerCase()
    if (question.type === 'multiple_choice') {
      if (userAnswer && correctAnswer.includes(userAnswer.charAt(0))) total += question.marks
    } else if (userAnswer.length > 10) {
      total += Math.ceil(question.marks * 0.7)
    }
  })

  return total
}

export default function PastPapersPage() {
  const [setup, setSetup] = useState({ curriculum: 'IB', subject: '', duration: '60', questionCount: '20' })
  const [loading, setLoading] = useState(false)
  const [exam, setExam] = useState<Question[] | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [score, setScore] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const subjects = setup.curriculum === 'IB' ? IB_SUBJECTS : setup.curriculum === 'AP' ? AP_SUBJECTS : []

  useEffect(() => {
    if (exam && !submitted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current)
            setSubmitted(true)
            setScore(calculateScore(exam, answers))
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [exam, submitted])

  const startExam = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/worksheets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          curriculum: setup.curriculum,
          subject: setup.subject,
          topic: `Mixed ${setup.subject || setup.curriculum} exam`,
          difficulty: 'Exam-level',
          count: setup.questionCount,
          questionTypes: ['Multiple Choice', 'Short Answer'],
        }),
      })
      const data = await res.json()
      setExam(data.questions)
      setTimeLeft(parseInt(setup.duration) * 60)
      setAnswers({})
      setSubmitted(false)
    } catch {
      alert('Failed to generate exam. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setSubmitted(true)
    setScore(calculateScore(exam, answers))
  }

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
  const totalMarks = exam?.reduce((s, q) => s + q.marks, 0) || 0

  if (!exam) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-orange-500" />
            Past Paper Simulation
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Practice with timed, exam-style simulations</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Curriculum</label>
              <select
                value={setup.curriculum}
                onChange={(e) => setSetup({ ...setup, curriculum: e.target.value, subject: '' })}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {CURRICULA.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Subject</label>
              {subjects.length > 0 ? (
                <select
                  value={setup.subject}
                  onChange={(e) => setSetup({ ...setup, subject: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select subject...</option>
                  {subjects.map(s => <option key={s}>{s}</option>)}
                </select>
              ) : (
                <input
                  value={setup.subject}
                  onChange={(e) => setSetup({ ...setup, subject: e.target.value })}
                  placeholder="e.g., Mathematics"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              )}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Duration (minutes)</label>
              <select
                value={setup.duration}
                onChange={(e) => setSetup({ ...setup, duration: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {['30', '45', '60', '90', '120'].map(d => <option key={d}>{d} minutes</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Questions</label>
              <select
                value={setup.questionCount}
                onChange={(e) => setSetup({ ...setup, questionCount: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {['10', '15', '20', '30'].map(n => <option key={n}>{n} questions</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={startExam}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader className="w-4 h-4 animate-spin" /> Generating Exam...</> : <><Trophy className="w-4 h-4" /> Start Exam Simulation</>}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Exam header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h2 className="font-bold">{setup.subject || setup.curriculum} Exam Simulation</h2>
          <p className="text-sm text-gray-500">{exam.length} questions · {totalMarks} marks</p>
        </div>
        {!submitted ? (
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 font-mono text-lg font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-orange-600'}`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
            <button
              onClick={handleSubmit}
              className="bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-700"
            >
              Submit
            </button>
          </div>
        ) : (
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">{score}/{totalMarks}</p>
            <p className="text-sm text-gray-500">{Math.round((score / totalMarks) * 100)}%</p>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {exam.map((q, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">{i + 1}</span>
              <span className="text-xs text-gray-500 capitalize">{q.type.replace('_', ' ')} · {q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
              {submitted && (
                answers[i] ? <CheckCircle className="w-4 h-4 text-green-500 ml-auto" /> : <XCircle className="w-4 h-4 text-red-500 ml-auto" />
              )}
            </div>
            <p className="font-medium mb-3">{q.question}</p>

            {q.options ? (
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const letter = String.fromCharCode(65 + oi)
                  return (
                    <label key={oi} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                      answers[i] === letter ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    } ${submitted ? 'cursor-default' : ''}`}>
                      <input
                        type="radio"
                        name={`q${i}`}
                        value={letter}
                        checked={answers[i] === letter}
                        onChange={() => !submitted && setAnswers({ ...answers, [i]: letter })}
                        className="text-orange-500"
                        disabled={submitted}
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  )
                })}
              </div>
            ) : (
              <textarea
                value={answers[i] || ''}
                onChange={(e) => !submitted && setAnswers({ ...answers, [i]: e.target.value })}
                placeholder="Type your answer here..."
                rows={3}
                disabled={submitted}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-sm disabled:opacity-60"
              />
            )}

            {submitted && (
              <div className="mt-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-sm text-green-800 dark:text-green-400">
                <strong>Model Answer:</strong> {q.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-3 rounded-xl font-semibold hover:opacity-90"
        >
          Submit Exam
        </button>
      )}

      {submitted && (
        <button
          onClick={() => { setExam(null); setSubmitted(false) }}
          className="w-full border border-gray-200 dark:border-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Start New Exam
        </button>
      )}
    </div>
  )
}
