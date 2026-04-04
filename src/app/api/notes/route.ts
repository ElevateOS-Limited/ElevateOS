import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { recordEvent } from '@/lib/stats'
import { forbiddenResponse, hasRequiredRole } from '@/lib/auth/roles'
import { writeAuditLog } from '@/lib/audit'

function getSessionOrgId(session: Awaited<ReturnType<typeof getSessionOrDemo>>) {
  const orgId = (session?.user as { orgId?: string | null } | undefined)?.orgId
  if (typeof orgId === 'string' && orgId.trim().length > 0) return orgId
  const userId = session?.user?.id
  return typeof userId === 'string' && userId.trim().length > 0 ? userId : null
}

export async function GET(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR', 'USER'])) return forbiddenResponse()
  const orgId = getSessionOrgId(session)
  if (orgId) {
    // Notes are user-scoped; orgId is still derived server-side for tenant context.
  }

  const q = (req.nextUrl.searchParams.get('q') || '').trim()
  const notes = await prisma.note.findMany({
    where: {
      userId: session.user.id,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { content: { contains: q, mode: 'insensitive' } },
              { tags: { has: q } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  })
  return NextResponse.json(notes)
}

export async function POST(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR', 'USER'])) return forbiddenResponse()
  const orgId = getSessionOrgId(session)

  const { title, content, tags } = await req.json()
  const normalizedTitle = typeof title === 'string' ? title.trim() : ''
  const normalizedContent = typeof content === 'string' ? content.trim() : ''

  const note = await prisma.note.create({
    data: {
      userId: session.user.id,
      title: normalizedTitle || 'Untitled Note',
      content: normalizedContent,
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
    },
  })
  await recordEvent(prisma as any, session.user.id, 'note_created', { noteId: note.id })
  await writeAuditLog({
    actorUserId: session.user.id,
    resourceType: 'note',
    resourceId: note.id,
    action: 'create',
    result: 'success',
  })
  return NextResponse.json(note)
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR', 'USER'])) return forbiddenResponse()
  const orgId = getSessionOrgId(session)
  if (orgId) {
    // Keep org context explicit while writes remain userId-scoped.
  }

  const { id, title, content, tags } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const normalizedTitle = typeof title === 'string' ? title.trim() : undefined
  const normalizedContent = typeof content === 'string' ? content.trim() : undefined

  const result = await prisma.note.updateMany({
    where: { id, userId: session.user.id },
    data: {
      ...(normalizedTitle !== undefined ? { title: normalizedTitle || 'Untitled Note' } : {}),
      ...(normalizedContent !== undefined ? { content: normalizedContent } : {}),
      ...(Array.isArray(tags) ? { tags: tags.filter(Boolean) } : {}),
    },
  })
  if (result.count === 0) {
    await writeAuditLog({
      actorUserId: session.user.id,
      resourceType: 'note',
      resourceId: id,
      action: 'update',
      result: 'forbidden',
    })
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const note = await prisma.note.findFirst({ where: { id, userId: session.user.id } })
  await writeAuditLog({
    actorUserId: session.user.id,
    resourceType: 'note',
    resourceId: id,
    action: 'update',
    result: 'success',
  })
  return NextResponse.json(note)
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN', 'TUTOR', 'USER'])) return forbiddenResponse()
  const orgId = getSessionOrgId(session)
  if (orgId) {
    // Keep org context explicit while deletes remain userId-scoped.
  }
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const result = await prisma.note.deleteMany({ where: { id, userId: session.user.id } })
  if (result.count === 0) {
    await writeAuditLog({
      actorUserId: session.user.id,
      resourceType: 'note',
      resourceId: id,
      action: 'delete',
      result: 'forbidden',
    })
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  await writeAuditLog({
    actorUserId: session.user.id,
    resourceType: 'note',
    resourceId: id,
    action: 'delete',
    result: 'success',
  })
  return NextResponse.json({ ok: true })
}
