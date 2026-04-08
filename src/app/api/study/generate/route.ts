import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateStudyNotes } from '@/lib/ai'
import { getSessionOrDemo } from '@/lib/auth/session'
import { AIConfigError } from '@/lib/ai/errors'
import { enforceAIDemoGuard, shouldUseStaticDemoResponses, demoStudyPack } from '@/lib/demo-ai'
import { aiErrorResponse } from '@/lib/ai/http'

const MAX_STUDY_FILE_BYTES = 5 * 1024 * 1024
const MAX_STUDY_CONTENT_CHARS = 12_000
const ALLOWED_STUDY_FILE_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/webp',
])

function normalizeInput(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrDemo()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const guard = await enforceAIDemoGuard(session, 'study.generate')
    if (guard) return guard

    const formData = await request.formData()
    const title = normalizeInput(formData.get('title'))
    const subject = normalizeInput(formData.get('subject'))
    const curriculum = normalizeInput(formData.get('curriculum'))
    const content = normalizeInput(formData.get('content'))
    const url = normalizeInput(formData.get('url'))
    const file = formData.get('file') as File | null

    if (title.length > 160 || subject.length > 120 || curriculum.length > 80 || content.length > MAX_STUDY_CONTENT_CHARS) {
      return NextResponse.json({ error: 'Study upload payload too large' }, { status: 413 })
    }

    // Combine content sources
    let combinedContent = content || ''

    if (file) {
      if (file.size > MAX_STUDY_FILE_BYTES) {
        return NextResponse.json({ error: 'File too large' }, { status: 413 })
      }
      if (file.type && !ALLOWED_STUDY_FILE_TYPES.has(file.type)) {
        return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 })
      }

      const text = (await file.text()).slice(0, MAX_STUDY_CONTENT_CHARS)
      combinedContent += '\n\n' + text
    }

    if (url) {
      let parsedUrl: URL
      try {
        parsedUrl = new URL(url)
      } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
      }

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return NextResponse.json({ error: 'Unsupported URL protocol' }, { status: 400 })
      }

      combinedContent += `\n\nURL referenced: ${parsedUrl.toString()}`
    }

    if (!combinedContent.trim() && !url) {
      return NextResponse.json({ error: 'Please provide some content to study' }, { status: 400 })
    }

    if (combinedContent.length > MAX_STUDY_CONTENT_CHARS) {
      combinedContent = combinedContent.slice(0, MAX_STUDY_CONTENT_CHARS)
    }

    // Generate study materials with AI (or static demo output)
    const materials = shouldUseStaticDemoResponses()
      ? demoStudyPack(subject || 'General', curriculum || 'IB')
      : await generateStudyNotes(
          combinedContent || `Generate comprehensive study notes for ${subject} ${curriculum} curriculum`,
          subject || 'General',
          curriculum || 'IB'
        )

    // Save to database
    const studySession = await prisma.studySession.create({
      data: {
        userId: session.user.id,
        title: title || `${subject || 'Study'} Study Session`,
        subject: subject || 'General',
        curriculum: curriculum || 'IB',
        content: combinedContent.slice(0, MAX_STUDY_CONTENT_CHARS),
        summary: materials.summary,
        flashcards: materials.flashcards as any,
        studyPlan: materials.studyPlan as any,
        keyConcepts: materials.keyConcepts as any,
      },
    })

    return NextResponse.json({
      id: studySession.id,
      summary: materials.summary,
      keyConcepts: materials.keyConcepts,
      studyPlan: materials.studyPlan,
      flashcards: materials.flashcards,
    })
  } catch (error) {
    if (error instanceof AIConfigError) {
      return NextResponse.json(
        { error: 'AI service is not configured. Please set a valid API key.' },
        { status: 503 }
      )
    }
    console.error('Study generation error:', error)
    return aiErrorResponse('anthropic', error, 'Failed to generate study materials')
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionOrDemo()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sessions = await prisma.studySession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, subject: true, curriculum: true, createdAt: true,
      },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

