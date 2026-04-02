import { generateJson, generateText, type TextMessage } from '@/lib/ai/provider'

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AICompletionOptions {
  messages: AIMessage[]
  system?: string
  maxTokens?: number
  stream?: boolean
}

export async function aiComplete(options: AICompletionOptions): Promise<string> {
  const { messages, system, maxTokens = 4096 } = options
  return generateText({
    messages: messages as TextMessage[],
    system:
      system ||
      'You are ElevateOS AI, an expert academic assistant helping high school students excel in IB, AP, SAT, ACT, and university admissions. Be precise, educational, and encouraging.',
    maxTokens,
  })
}

export async function* aiStream(options: AICompletionOptions): AsyncGenerator<string> {
  const text = await aiComplete(options)
  if (text) yield text
}

export async function generateStudyNotes(content: string, subject: string, curriculum: string): Promise<{
  summary: string
  keyConcepts: string[]
  studyPlan: string[]
  flashcards: { front: string; back: string }[]
}> {
  const prompt = `You are an expert ${curriculum} ${subject} tutor. Analyze this content and generate structured study materials.

Content:
${content.slice(0, 8000)}

Return a JSON object with these exact keys:
{
  "summary": "comprehensive summary of the material",
  "keyConcepts": ["concept 1", "concept 2", ...],
  "studyPlan": ["Day 1: ...", "Day 2: ...", ...],
  "flashcards": [{"front": "question", "back": "answer"}, ...]
}

Generate at least 10 flashcards and 5 key concepts. Return ONLY valid JSON.`

  try {
    return await generateJson({
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 4000,
      temperature: 0.4,
    })
  } catch {
    const result = await aiComplete({
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 4000,
    })
    return {
      summary: result,
      keyConcepts: [],
      studyPlan: [],
      flashcards: [],
    }
  }
}

export async function generateWorksheet(params: {
  subject: string
  curriculum: string
  topic: string
  difficulty: string
  questionTypes: string[]
  count: number
  content?: string
}): Promise<{ questions: { type: string; question: string; options?: string[]; answer: string; marks: number }[] }> {
  const prompt = `Generate ${params.count} ${params.curriculum} ${params.subject} exam questions on "${params.topic}".
Difficulty: ${params.difficulty}
Question types: ${params.questionTypes.join(', ')}
${params.content ? `Reference material: ${params.content.slice(0, 3000)}` : ''}

Return JSON with this structure:
{
  "questions": [
    {
      "type": "multiple_choice|short_answer|long_answer",
      "question": "the question text",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."] (only for multiple choice),
      "answer": "the correct answer / model answer",
      "marks": 1
    }
  ]
}

Return ONLY valid JSON.`

  try {
    return await generateJson({
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 4000,
      temperature: 0.4,
    })
  } catch {
    return { questions: [] }
  }
}

export async function analyzeUniversityFit(params: {
  university: string
  studentGPA: number
  satScore?: number
  actScore?: number
  curriculum: string
  intendedMajor: string
}): Promise<string> {
  const prompt = `Provide a detailed university admissions analysis for:
University: ${params.university}
Student GPA: ${params.studentGPA}
SAT Score: ${params.satScore || 'Not taken'}
ACT Score: ${params.actScore || 'Not taken'}
Curriculum: ${params.curriculum}
Intended Major: ${params.intendedMajor}

Cover:
1. Admission difficulty (acceptance rate, typical ranges)
2. Student's competitive standing
3. Required GPA/test score ranges for this major
4. Extracurricular recommendations
5. Essay topics and tips specific to this university
6. Actionable improvement steps
7. Overall admission probability estimate

Be specific, realistic, and encouraging.`

  return aiComplete({
    messages: [{ role: 'user', content: prompt }],
    system: 'You are an expert university admissions counselor with deep knowledge of university requirements worldwide.',
    maxTokens: 2000,
  })
}

export async function getInternshipRecommendations(params: {
  major: string
  careerInterests: string
  skills: string
  location: string
}): Promise<string> {
  const prompt = `Recommend relevant internships for a high school student with:
Intended Major: ${params.major}
Career Interests: ${params.careerInterests}
Skills: ${params.skills}
Location Preference: ${params.location}

Provide 8-10 specific internship opportunities including:
- Program name and organization
- Description and what they'll learn
- How it strengthens their university application
- Application timeline and requirements
- Where to find and apply

Focus on competitive, prestigious programs that would stand out on university applications.`

  return aiComplete({
    messages: [{ role: 'user', content: prompt }],
    system: 'You are a career counselor and university admissions expert specializing in helping high school students find prestigious internships.',
    maxTokens: 2000,
  })
}
