import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateStudyNotes } from '@/lib/ai'
import { getSessionOrDemo } from '@/lib/auth/session'
import { AIConfigError } from '@/lib/ai/errors'
import { enforceAIDemoGuard, useStaticDemoResponses, demoStudyPack } from '@/lib/demo-ai'
import { aiErrorResponse } from '@/lib/ai/http'

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrDemo()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const guard = await enforceAIDemoGuard(session, 'study.generate')
    if (guard) return guard

    const formData = await request.formData()
    const title = formData.get('title') as string
    const subject = formData.get('subject') as string
    const curriculum = formData.get('curriculum') as string
    const content = formData.get('content') as string
    const url = formData.get('url') as string
    const file = formData.get('file') as File | null

    // Combine content sources
    let combinedContent = content || ''

    if (file) {
      // For PDF parsing in production, use pdf-parse
      const text = await file.text()
      combinedContent += '\n\n' + text
    }

    if (url) {
      // Simple URL content note - in production fetch and parse the URL
      combinedContent += `\n\nURL referenced: ${url}`
    }

    if (!combinedContent.trim() && !url) {
      return NextResponse.json({ error: 'Please provide some content to study' }, { status: 400 })
    }

    // Generate study materials with AI (or static demo output)
    const materials = useStaticDemoResponses()
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
        title: title || `${subject} Study Session`,
        subject,
        curriculum,
        content: combinedContent.slice(0, 10000),
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

