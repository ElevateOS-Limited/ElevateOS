import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { DEMO_MODE } from '@/lib/auth/demo'
import { refreshUserStripeState } from '@/lib/stripe/reconcile'

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

    try {
      await refreshUserStripeState(session.user.id)
    } catch (error) {
      console.warn('stripe_refresh_failed', {
        userId: session.user.id,
        error: error instanceof Error ? error.message : String(error),
      })
    }

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

    if (!user) return NextResponse.json(user)

    if (DEMO_MODE) {
      return NextResponse.json({
        ...user,
        gradeLevel: user.gradeLevel ?? 'Grade 11',
        curriculum: user.curriculum ?? 'IB',
        intendedMajor: user.intendedMajor ?? 'Computer Science',
        gpa: user.gpa ?? 3.92,
        satScore: user.satScore ?? 1490,
        bio: user.bio ?? 'I build practical AI tools, enjoy community volunteering, and want to study technology + policy to create meaningful impact.',
        coursesTaking: user.coursesTaking?.length ? user.coursesTaking : ['IB Physics HL', 'AP Calculus BC', 'AP Computer Science A'],
        activitiesDone: Array.isArray(user.activitiesDone) && user.activitiesDone.length ? user.activitiesDone : [
          { name: 'Robotics Club Captain', impact: 'Led team to regional finals' },
          { name: 'Community Tutoring', impact: '80+ volunteer hours in math tutoring' },
        ],
        goals: Array.isArray(user.goals) && user.goals.length ? user.goals : [
          { title: 'Top 20 STEM', target: 'Fall 2027 admissions' },
          { title: 'Research portfolio', target: 'Submit paper within 6 months' },
        ],
        customPreferences: user.customPreferences ?? 'Prefer a mix of STEM depth + community impact projects.',
        weeklyAvailability: (user.weeklyAvailability as any) ?? {
          Monday: 'busy', Tuesday: 'open', Wednesday: 'busy', Thursday: 'open', Friday: 'busy', Saturday: 'open', Sunday: 'busy',
        },
        targetUniversities: user.targetUniversities?.length ? user.targetUniversities : ['Stanford', 'MIT', 'UCL'],
        careerInterests: user.careerInterests?.length ? user.careerInterests : ['AI', 'Entrepreneurship', 'Community impact'],
      })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 })
  }
}
