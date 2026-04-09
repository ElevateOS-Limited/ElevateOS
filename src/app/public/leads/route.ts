import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth/options'
import { withServiceDbContext } from '@/lib/db/rls'
import { prisma } from '@/lib/prisma'
import { leadCreateSchema } from '@/lib/tutoring/contracts'

export async function POST(request: Request) {
  try {
    const body = leadCreateSchema.parse(await request.json())
    const session = await withServiceDbContext(() => getServerSession(authOptions))

    const lead = await withServiceDbContext(async () =>
      prisma.lead.create({
        data: {
          email: body.email.toLowerCase(),
          roleInterest: body.roleInterest,
          source: body.source || null,
          campaign: body.campaign || null,
          message: body.message || null,
          createdByUserId: session?.user?.id || null,
        },
      }),
    )

    return NextResponse.json(
      {
        success: true,
        lead: {
          id: lead.id,
          email: lead.email,
          roleInterest: lead.roleInterest,
          status: lead.status,
          createdAt: lead.createdAt,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      const issues = (error as { issues?: Array<{ message?: string }> }).issues
      return NextResponse.json({ error: issues?.[0]?.message || 'Invalid lead payload' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Unable to save lead' }, { status: 500 })
  }
}
