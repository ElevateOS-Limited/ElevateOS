import type { PrismaClient } from '@prisma/client'

export async function recordEvent(
  prisma: PrismaClient,
  userId: string,
  eventType: string,
  meta?: any,
) {
  const now = new Date()
  await prisma.eventLog.create({ data: { userId, eventType, meta: meta || null } })

  const stats = await prisma.userStats.upsert({
    where: { userId },
    create: { userId },
    update: {},
  })

  const last = stats.lastActiveDate ? new Date(stats.lastActiveDate) : null
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lastDay = last ? new Date(last.getFullYear(), last.getMonth(), last.getDate()) : null
  const diffDays = lastDay ? Math.floor((today.getTime() - lastDay.getTime()) / 86400000) : null

  let streak = stats.currentStreakDays
  if (diffDays === null) streak = 1
  else if (diffDays === 0) streak = stats.currentStreakDays
  else if (diffDays === 1) streak = stats.currentStreakDays + 1
  else streak = 1

  const update: any = {
    lastActiveDate: now,
    currentStreakDays: streak,
    longestStreakDays: Math.max(stats.longestStreakDays, streak),
  }

  if (eventType === 'note_created') update.notesCount = { increment: 1 }
  if (eventType === 'flashcard_reviewed') update.flashcardsReviewed = { increment: 1 }
  if (eventType === 'practice_completed') update.practiceSessionsCount = { increment: 1 }

  if (eventType === 'question_answered') {
    update.totalAnswersCount = { increment: 1 }
    if (meta?.isCorrect) update.correctAnswersCount = { increment: 1 }
  }

  await prisma.userStats.update({ where: { userId }, data: update })
}
