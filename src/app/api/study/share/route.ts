import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { createStudyShareToken } from '@/lib/share'
import { recordEvent } from '@/lib/stats'

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrDemo()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => null)
    const studySessionId = body?.studySessionId as string | undefined
    if (!studySessionId) {
      return NextResponse.json({ error: 'studySessionId is required' }, { status: 400 })
    }

    const studySession = await prisma.studySession.findFirst({
      where: { id: studySessionId, userId: session.user.id },
      select: { id: true, title: true },
    })

    if (!studySession) {
      return NextResponse.json({ error: 'Study session not found' }, { status: 404 })
    }

    const token = createStudyShareToken(session.user.id, studySession.id)
    const shareUrl = `${request.nextUrl.origin}/study/shared/${encodeURIComponent(token)}`

    await recordEvent(prisma, session.user.id, 'study_share_clicked', {
      studySessionId: studySession.id,
      source: 'dashboard_study',
    })

    return NextResponse.json({
      shareUrl,
      title: studySession.title,
      expiresInHours: 168,
    })
  } catch (error) {
    console.error('Study share generation error:', error)
    return NextResponse.json({ error: 'Failed to generate share link' }, { status: 500 })
  }
}
