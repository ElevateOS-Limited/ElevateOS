import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionOrDemo()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const {
      name,
      gradeLevel,
      curriculum,
      intendedMajor,
      gpa,
      satScore,
      actScore,
      bio,
      coursesTaking,
      activitiesDone,
      goals,
      customPreferences,
      weeklyAvailability,
      targetUniversities,
      careerInterests,
    } = await request.json()

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        gradeLevel,
        curriculum,
        intendedMajor,
        gpa: gpa ? parseFloat(gpa) : null,
        satScore: satScore ? parseInt(satScore) : null,
        actScore: actScore ? parseInt(actScore) : null,
        bio: bio?.slice(0, 100) || null,
        coursesTaking: Array.isArray(coursesTaking) ? coursesTaking.filter(Boolean) : [],
        activitiesDone: Array.isArray(activitiesDone) ? activitiesDone : [],
        goals: Array.isArray(goals) ? goals : [],
        customPreferences: customPreferences || null,
        weeklyAvailability: weeklyAvailability && typeof weeklyAvailability === 'object' ? weeklyAvailability : null,
        targetUniversities: Array.isArray(targetUniversities) ? targetUniversities.filter(Boolean) : [],
        careerInterests: Array.isArray(careerInterests) ? careerInterests.filter(Boolean) : [],
      },
    })

    return NextResponse.json({ user: { id: user.id, name: user.name } })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionOrDemo()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        gradeLevel: true,
        curriculum: true,
        intendedMajor: true,
        gpa: true,
        satScore: true,
        actScore: true,
        plan: true,
        bio: true,
        coursesTaking: true,
        activitiesDone: true,
        goals: true,
        customPreferences: true,
        weeklyAvailability: true,
        targetUniversities: true,
        careerInterests: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 })
  }
}
