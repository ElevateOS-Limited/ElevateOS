import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { hasRequiredRole } from '@/lib/auth/roles'

export async function GET() {
  let list = await prisma.changelogEntry.findMany({ orderBy: { createdAt: 'desc' }, take: 30 })
  if (!list.length) {
    list = await prisma.$transaction([
      prisma.changelogEntry.create({ data: { version: 'v0.3.0', title: 'Navigation + Command Palette', content: 'Introduced grouped sidebar navigation, command palette, and sidebar preferences.' } }),
      prisma.changelogEntry.create({ data: { version: 'v0.3.1', title: 'Notes + Flashcards + Progress', content: 'Added notes workflow, spaced repetition flashcards, and progress analytics.' } }),
    ])
  }
  return NextResponse.json(list)
}

export async function POST(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id || !hasRequiredRole(session.user.role, ['OWNER', 'ADMIN'])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { version, title, content } = await req.json()
  const row = await prisma.changelogEntry.create({ data: { version, title, content } })
  return NextResponse.json(row)
}
