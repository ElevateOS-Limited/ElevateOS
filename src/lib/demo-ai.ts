import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'
import { prisma } from '@/lib/prisma'

const ENABLE_GUARD = process.env.AI_DEMO_GUARD === 'true'
const STATIC_RESPONSES = process.env.DEMO_STATIC_RESPONSES === 'true'

function parseAllowlist() {
  return (process.env.DEMO_ALLOWED_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export function shouldUseStaticDemoResponses() {
  return STATIC_RESPONSES
}

export async function enforceAIDemoGuard(session: Session, feature: string) {
  if (STATIC_RESPONSES) return null
  if (!ENABLE_GUARD || !session?.user?.id) return null

  const allowlist = parseAllowlist()
  const email = (session.user.email || '').toLowerCase()

  if (allowlist.length > 0 && (!email || !allowlist.includes(email))) {
    return NextResponse.json(
      { error: 'Live AI is disabled for this account in demo mode.' },
      { status: 403 }
    )
  }

  const maxUser = parseInt(process.env.DEMO_MAX_AI_CALLS_PER_USER_PER_DAY || '20', 10)
  const maxGlobal = parseInt(process.env.DEMO_MAX_AI_CALLS_GLOBAL_PER_DAY || '120', 10)
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const [userCalls, globalCalls] = await Promise.all([
    prisma.eventLog.count({
      where: {
        userId: session.user.id,
        eventType: 'ai_call',
        createdAt: { gte: startOfDay },
      },
    }),
    prisma.eventLog.count({
      where: {
        eventType: 'ai_call',
        createdAt: { gte: startOfDay },
      },
    }),
  ])

  if (userCalls >= maxUser) {
    return NextResponse.json({ error: 'Daily per-user AI demo quota reached.' }, { status: 429 })
  }

  if (globalCalls >= maxGlobal) {
    return NextResponse.json({ error: 'Daily global AI demo quota reached.' }, { status: 429 })
  }

  await prisma.eventLog.create({
    data: {
      userId: session.user.id,
      eventType: 'ai_call',
      meta: {
        feature,
        email: session.user.email || null,
        at: new Date().toISOString(),
      },
    },
  })

  return null
}

export function demoAdmissionsAnalysis(universities: string[], intendedMajor?: string) {
  return {
    results: universities.map((university) => ({
      university,
      analysis: `### ${university} Admissions Snapshot\n- **Difficulty:** Reach/High Match (depends on profile depth)\n- **Estimated competitiveness:** Strong if GPA stays high and activities show sustained impact\n- **Major fit:** ${intendedMajor || 'Undeclared'} candidates should show clear project-based evidence\n\n**What to improve in the next 90 days**\n1. Build 1 flagship activity with measurable outcomes\n2. Add 1 academic extension (research/summer program)\n3. Strengthen personal narrative for essays\n\n**Practical recommendation:** Focus on consistency and leadership depth over collecting random activities.`
    }))
  }
}

export function demoEssayFeedback(major?: string) {
  return {
    feedback: `### Essay Feedback (Demo)\n**Overall Impression:** Clear motivation and strong potential for ${major || 'your intended major'}.\n\n**Strengths**\n- Authentic personal voice\n- Concrete examples instead of vague claims\n- Good growth arc\n\n**Improvements**\n1. Sharpen the opening hook in first 2-3 lines\n2. Add one high-impact, quantified achievement\n3. Tighten conclusion to connect directly to future contribution\n\n**Score (Demo):** Narrative 8/10 | Structure 7/10 | Authenticity 8/10 | Specificity 7/10`
  }
}

export function demoInternshipRecommendations(major: string, location?: string) {
  return {
    recommendations: `### Recommended Opportunities (Demo)\n1. **Pre-College Research Program** — university lab track relevant to **${major || 'your major'}**\n2. **Summer Innovation Challenge** — build a portfolio project with mentorship\n3. **NGO/Community Impact Fellowship** — leadership + measurable social impact\n4. **Remote Startup Internship** — practical execution and teamwork\n\n**Location preference considered:** ${location || 'Global/Remote'}\n\n**Suggested next step:** Apply to 2 competitive + 2 realistic programs this cycle.`
  }
}

export function demoWorksheet(topic: string) {
  return {
    questions: [
      { type: 'multiple_choice', question: `Which statement best describes ${topic || 'the concept'}?`, options: ['A) Definition 1', 'B) Definition 2', 'C) Definition 3', 'D) Definition 4'], answer: 'B) Definition 2', marks: 1 },
      { type: 'short_answer', question: `Explain one real-world application of ${topic || 'this topic'}.`, answer: 'A concise explanation with one practical example.', marks: 3 },
      { type: 'long_answer', question: `Evaluate the strengths and limitations of ${topic || 'this approach'} in an academic context.`, answer: 'Balanced argument with evidence, structure, and conclusion.', marks: 6 },
    ],
  }
}

export function demoStudyPack(subject: string, curriculum: string) {
  return {
    summary: `This demo summary outlines core ${subject || 'subject'} concepts for ${curriculum || 'IB'} students and highlights exam-relevant understanding over memorization.`,
    keyConcepts: ['Core Principle A', 'Core Principle B', 'Common Misconception C', 'Exam Strategy D', 'Applied Example E'],
    studyPlan: ['Day 1: Concept review + notes', 'Day 2: Practice short questions', 'Day 3: Timed mixed practice', 'Day 4: Error analysis + revision', 'Day 5: Mock mini-test'],
    flashcards: [
      { front: 'What is Principle A?', back: 'Principle A is ...' },
      { front: 'When is Strategy D useful?', back: 'Use it when ...' },
      { front: 'Common trap in this topic?', back: 'Students often confuse ...' },
    ],
  }
}

export function demoExtracurricularScore() {
  return {
    overallScore: 78,
    breakdown: {
      leadership: 75,
      impact: 72,
      consistency: 81,
      distinction: 70,
      majorAlignment: 84,
    },
    tier: 'regional',
    strengths: ['Clear major alignment', 'Good continuity across activities'],
    gaps: ['Need stronger flagship achievement', 'Limited external recognition'],
    recommendedActions: [
      { action: 'Launch one signature project with measurable impact', priority: 'high', why: 'Builds differentiation and narrative depth' },
      { action: 'Target one selective competition or publication', priority: 'medium', why: 'Improves distinction signal' },
    ],
    topUniversityReadiness: { score: 74, comment: 'Promising profile; needs one standout spike for top-tier competitiveness.' },
  }
}

export function demoPaperGrade(answerKey: any) {
  const keys = Array.isArray(answerKey) ? answerKey : []
  const maxMarks = keys.length || 5
  const totalMarks = Math.max(0, Math.floor(maxMarks * 0.8))
  return {
    detectedAnswers: keys.map((k: any, i: number) => ({ question: String(k?.question || i + 1), studentAnswer: k?.answer || 'Sample answer' })),
    grading: keys.map((k: any, i: number) => ({
      question: String(k?.question || i + 1),
      correctAnswer: k?.answer || 'Sample answer',
      studentAnswer: k?.answer || 'Sample answer',
      isCorrect: i % 5 !== 0,
      marksAwarded: i % 5 === 0 ? 0 : 1,
      marksTotal: 1,
      reason: i % 5 === 0 ? 'Needs more precise terminology.' : 'Correct key point identified.',
    })),
    totalMarks,
    maxMarks,
    percentage: Math.round((totalMarks / maxMarks) * 100),
    summary: 'Strong overall performance. Focus on precision for definition-based items.',
  }
}
