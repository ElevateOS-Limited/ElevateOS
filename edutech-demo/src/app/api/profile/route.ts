import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'

export async function GET(req: Request) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, image: true, role: true,
      gradeLevel: true, curriculum: true, subjects: true, gpa: true,
      satScore: true, actScore: true, intendedMajor: true,
      targetUniversities: true, careerInterests: true, location: true,
      bio: true, coursesTaking: true, activitiesDone: true, goals: true,
      customPreferences: true, weeklyAvailability: true,
      subscriptionStatus: true, subscriptionEnds: true, trialEnds: true,
    },
  })

  return NextResponse.json(user)
}

export async function PUT(req: Request) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { name, gradeLevel, curriculum, subjects, gpa, satScore, actScore,
      intendedMajor, targetUniversities, careerInterests, location,
      bio, coursesTaking, activitiesDone, goals, customPreferences, weeklyAvailability } = body

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name, gradeLevel, curriculum, subjects, gpa, satScore, actScore,
        intendedMajor, targetUniversities, careerInterests, location,
        bio: bio?.slice(0, 100) || null,
        coursesTaking: Array.isArray(coursesTaking) ? coursesTaking.filter(Boolean) : [],
        activitiesDone: Array.isArray(activitiesDone) ? activitiesDone : [],
        goals: Array.isArray(goals) ? goals : [],
        customPreferences: customPreferences || null,
        weeklyAvailability: weeklyAvailability && typeof weeklyAvailability === 'object' ? weeklyAvailability : null,
      },
    })

    return NextResponse.json({ message: 'Profile updated', user })
  } catch (e) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
