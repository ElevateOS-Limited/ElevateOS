import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { forbiddenResponse, hasRequiredRole } from '@/lib/auth/roles'

export async function GET() {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR', 'USER'])) return forbiddenResponse()

  const list = await prisma.feedback.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 100 })
  return NextResponse.json(list)
}

export async function POST(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR', 'USER'])) return forbiddenResponse()

  const { email, category, message } = await req.json()
  const normalizedMessage = typeof message === 'string' ? message.trim() : ''
  if (!normalizedMessage) return NextResponse.json({ error: 'message required' }, { status: 400 })

  const row = await prisma.feedback.create({
    data: {
      userId: session?.user?.id || null,
      email: email || null,
      category: category || 'general',
      message: normalizedMessage,
    },
  })
  return NextResponse.json(row)
}
