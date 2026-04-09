import { NextResponse } from 'next/server'
import { getSessionOrDemo } from '@/lib/auth/session'
import { forbiddenResponse, hasRequiredRole } from '@/lib/auth/roles'
import { prisma } from '@/lib/prisma'
import { leadUpdateSchema } from '@/lib/tutoring/contracts'

type RouteParams = {
  params: Promise<{ leadId: string }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRequiredRole(session.user.role, ['OWNER', 'ADMIN'])) return forbiddenResponse()

  const { leadId } = await params

  try {
    const body = leadUpdateSchema.parse(await request.json())
    const existing = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { id: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: body.status,
        notes: body.notes ?? undefined,
      },
      select: {
        id: true,
        email: true,
        roleInterest: true,
        status: true,
        notes: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ lead })
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      const issues = (error as { issues?: Array<{ message?: string }> }).issues
      return NextResponse.json({ error: issues?.[0]?.message || 'Invalid lead payload' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Unable to update lead' }, { status: 500 })
  }
}
