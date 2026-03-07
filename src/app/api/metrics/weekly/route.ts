import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  try {
    const [activationEvents, weeklyActiveUsers, outcomes, paidSignals] = await Promise.all([
      prisma.eventLog.count({
        where: {
          createdAt: { gte: weekAgo },
          eventType: { in: ['note_created', 'practice_completed', 'flashcard_reviewed'] },
        },
      }),
      prisma.eventLog.findMany({
        where: { createdAt: { gte: weekAgo } },
        select: { userId: true },
        distinct: ['userId'],
      }),
      prisma.practiceSession.aggregate({
        _avg: { score: true },
        where: { completedAt: { gte: weekAgo } },
      }),
      prisma.eventLog.count({
        where: {
          createdAt: { gte: weekAgo },
          eventType: { in: ['pricing_viewed', 'upgrade_clicked', 'checkout_started', 'checkout_completed'] },
        },
      }),
    ])

    return NextResponse.json({
      window: { from: weekAgo.toISOString(), to: now.toISOString() },
      metrics: {
        activationCount: activationEvents,
        weeklyActiveUsers: weeklyActiveUsers.length,
        outcomeProxyAvgScore: outcomes._avg.score ?? 0,
        monetizationSignals: paidSignals,
      },
    })
  } catch {
    return NextResponse.json({
      window: { from: weekAgo.toISOString(), to: now.toISOString() },
      metrics: {
        activationCount: 0,
        weeklyActiveUsers: 0,
        outcomeProxyAvgScore: 0,
        monetizationSignals: 0,
      },
      degraded: true,
    })
  }
}
