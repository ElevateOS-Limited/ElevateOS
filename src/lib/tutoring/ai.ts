import { generateJson } from '@/lib/ai/provider'
import { useStaticDemoResponses } from '@/lib/demo-ai'
import type {
  TutoringParentSummaryDraftInput,
  TutoringSessionSummaryInput,
} from '@/lib/tutoring/contracts'

export type TutoringAiSummaryResult = {
  summary: string
  strengths: string[]
  weaknesses: string[]
  nextSteps: string[]
  weakTopics: string[]
  source: 'ai' | 'fallback'
}

export type TutoringParentReportDraftResult = {
  generatedText: string
  strengths: string[]
  weaknesses: string[]
  homeworkAssigned: string[]
  topicsCovered: string[]
  source: 'ai' | 'fallback'
}

function cleanList(values: string[] = []) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).slice(0, 6)
}

function fallbackSessionSummary(input: TutoringSessionSummaryInput): TutoringAiSummaryResult {
  const topics = cleanList(input.topicsCovered)
  const weakTopics = cleanList(input.weakTopics)
  const homework = cleanList(input.homeworkAssigned)
  const focusTopic = weakTopics[0] || topics[0] || 'the current topic'

  return {
    summary: `${input.studentName} reviewed ${topics.length ? topics.join(', ') : 'the session material'} and should keep focusing on ${focusTopic}. ${homework.length ? `Homework assigned: ${homework.join('; ')}.` : 'No homework was assigned yet.'}`,
    strengths: topics.length ? [`Covered ${topics[0]}`] : ['Stayed engaged through the session'],
    weaknesses: weakTopics.length ? weakTopics : ['No major gaps logged yet'],
    nextSteps: homework.length ? homework : ['Review the session notes and repeat one short practice set'],
    weakTopics,
    source: 'fallback',
  }
}

function fallbackParentSummary(input: TutoringParentSummaryDraftInput): TutoringParentReportDraftResult {
  const topics = cleanList(input.topicsCovered)
  const strengths = cleanList(input.strengths)
  const weaknesses = cleanList(input.weaknesses)
  const homework = cleanList(input.homeworkAssigned)

  return {
    generatedText: `${input.studentName} made ${strengths.length ? 'clear progress' : 'steady progress'} this period. ${input.progressNote} ${homework.length ? `Next homework: ${homework.join('; ')}.` : 'Next homework will be shared after the next session.'}`,
    strengths: strengths.length ? strengths : ['Consistent attendance'],
    weaknesses: weaknesses.length ? weaknesses : ['No major concerns logged yet'],
    homeworkAssigned: homework,
    topicsCovered: topics,
    source: 'fallback',
  }
}

function safeTruncate(value: string | undefined, max = 1200) {
  const text = (value || '').trim()
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max)}...` : text
}

export async function draftSessionSummary(input: TutoringSessionSummaryInput): Promise<TutoringAiSummaryResult> {
  if (useStaticDemoResponses()) return fallbackSessionSummary(input)

  const fallback = fallbackSessionSummary(input)

  try {
    const result = await generateJson<{
      summary: string
      strengths?: string[]
      weaknesses?: string[]
      nextSteps?: string[]
      weakTopics?: string[]
    }>({
      system:
        'You are a tutoring operations assistant. Turn tutor notes into a concise, parent-safe session summary. Do not add sensitive details or marketing language. Return JSON only.',
      messages: [
        {
          role: 'user',
          content: `Student: ${input.studentName}
Grade: ${input.gradeLevel || 'N/A'}
Curriculum: ${input.curriculum || 'N/A'}
Subject: ${input.subject || 'N/A'}
Topics covered: ${cleanList(input.topicsCovered).join(', ') || 'N/A'}
Homework assigned: ${cleanList(input.homeworkAssigned).join(', ') || 'N/A'}
Weak topics: ${cleanList(input.weakTopics).join(', ') || 'N/A'}
Notes: ${safeTruncate(input.rawNotes)}

Return JSON with:
{
  "summary": "One short paragraph for the tutoring record and parent summary.",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "nextSteps": ["..."],
  "weakTopics": ["..."]
}`,
        },
      ],
      maxTokens: 350,
      temperature: 0.2,
    })

    const summary = result.summary?.trim()
    if (!summary) return fallback

    return {
      summary,
      strengths: cleanList(result.strengths || fallback.strengths),
      weaknesses: cleanList(result.weaknesses || fallback.weaknesses),
      nextSteps: cleanList(result.nextSteps || fallback.nextSteps),
      weakTopics: cleanList(result.weakTopics || fallback.weakTopics),
      source: 'ai',
    }
  } catch {
    return fallback
  }
}

export async function draftParentReport(input: TutoringParentSummaryDraftInput): Promise<TutoringParentReportDraftResult> {
  if (useStaticDemoResponses()) return fallbackParentSummary(input)

  const fallback = fallbackParentSummary(input)

  try {
    const result = await generateJson<{
      generatedText: string
      strengths?: string[]
      weaknesses?: string[]
      homeworkAssigned?: string[]
      topicsCovered?: string[]
    }>({
      system:
        'You are a tutoring operations assistant. Rewrite tutoring updates into concise parent-facing progress notes. Avoid jargon and keep the tone calm, specific, and reassuring. Return JSON only.',
      messages: [
        {
          role: 'user',
          content: `Student: ${input.studentName}
Grade: ${input.gradeLevel || 'N/A'}
Curriculum: ${input.curriculum || 'N/A'}
Topics covered: ${cleanList(input.topicsCovered).join(', ') || 'N/A'}
Strengths: ${cleanList(input.strengths).join(', ') || 'N/A'}
Weaknesses: ${cleanList(input.weaknesses).join(', ') || 'N/A'}
Homework assigned: ${cleanList(input.homeworkAssigned).join(', ') || 'N/A'}
Progress note: ${safeTruncate(input.progressNote, 2000)}
Weak topics: ${cleanList(input.weakTopics).join(', ') || 'N/A'}

Return JSON with:
{
  "generatedText": "A parent-friendly summary in 2-4 sentences.",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "homeworkAssigned": ["..."],
  "topicsCovered": ["..."]
}`,
        },
      ],
      maxTokens: 350,
      temperature: 0.2,
    })

    const generatedText = result.generatedText?.trim()
    if (!generatedText) return fallback

    return {
      generatedText,
      strengths: cleanList(result.strengths || fallback.strengths),
      weaknesses: cleanList(result.weaknesses || fallback.weaknesses),
      homeworkAssigned: cleanList(result.homeworkAssigned || fallback.homeworkAssigned),
      topicsCovered: cleanList(result.topicsCovered || fallback.topicsCovered),
      source: 'ai',
    }
  } catch {
    return fallback
  }
}
