import { NextResponse } from 'next/server'
import { prisma, DATABASE_URL_CONFIGURED } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { DEMO_MODE } from '@/lib/auth/demo'
import { refreshUserStripeState } from '@/lib/stripe/reconcile'

const demoProfile = {
  id: 'demo-user',
  name: 'EduTech Demo Student',
  email: 'demo@thinkcollegelevel.com',
  image: null,
  role: 'USER',
  gradeLevel: 'Grade 11',
  curriculum: 'IB',
  subjects: ['Mathematics', 'Biology', 'English'],
  gpa: 3.92,
  satScore: 1490,
  actScore: null,
  intendedMajor: 'Computer Science',
  targetUniversities: ['Stanford', 'MIT', 'UCL'],
  careerInterests: ['AI', 'Entrepreneurship', 'Community impact'],
  location: 'Remote',
  bio: 'Demo profile for host-standardized preview mode.',
  coursesTaking: ['IB Math AA HL', 'IB Biology HL', 'IB English SL'],
  activitiesDone: ['Robotics club lead', 'Peer tutoring', 'Hackathon finalist'],
  goals: ['Raise timed exam accuracy', 'Finalize summer applications'],
  customPreferences: null,
  weeklyAvailability: {
    weekly: {
      Monday: 'open',
      Tuesday: 'busy',
      Wednesday: 'open',
      Thursday: 'open',
      Friday: 'busy',
      Saturday: 'open',
      Sunday: 'busy',
    },
    blockedDates: [],
  },
  subscriptionStatus: 'demo',
  subscriptionEnds: null,
  trialEnds: null,
}

export async function GET(req: Request) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (DEMO_MODE && !DATABASE_URL_CONFIGURED) {
    return NextResponse.json({
      ...demoProfile,
      id: session.user.id,
      name: session.user.name ?? demoProfile.name,
      email: session.user.email ?? demoProfile.email,
      role: session.user.role ?? demoProfile.role,
    })
  }

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
      id: true, name: true, email: true, image: true, role: true, plan: true,
      gradeLevel: true, curriculum: true, subjects: true, gpa: true,
      satScore: true, actScore: true, intendedMajor: true,
      targetUniversities: true, careerInterests: true, location: true,
      bio: true, coursesTaking: true, activitiesDone: true, goals: true,
      customPreferences: true, weeklyAvailability: true,
      subscriptionStatus: true, subscriptionEnds: true, trialEnds: true,
    },
  })

  if (DEMO_MODE && user) {
    return NextResponse.json({
      ...user,
      gradeLevel: user.gradeLevel ?? 'Grade 11',
      curriculum: user.curriculum ?? 'IB',
      intendedMajor: user.intendedMajor ?? 'Computer Science',
      gpa: user.gpa ?? 3.92,
      satScore: user.satScore ?? 1490,
      targetUniversities: user.targetUniversities?.length ? user.targetUniversities : ['Stanford', 'MIT', 'UCL'],
      careerInterests: user.careerInterests?.length ? user.careerInterests : ['AI', 'Entrepreneurship', 'Community impact'],
    })
  }

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

    if (DEMO_MODE && !DATABASE_URL_CONFIGURED) {
      return NextResponse.json({
        message: 'Profile updated in preview mode',
        user: {
          ...demoProfile,
          id: session.user.id,
          name: name ?? session.user.name ?? demoProfile.name,
          email: session.user.email ?? demoProfile.email,
          role: session.user.role ?? demoProfile.role,
          gradeLevel: gradeLevel ?? demoProfile.gradeLevel,
          curriculum: curriculum ?? demoProfile.curriculum,
          subjects: Array.isArray(subjects) ? subjects : demoProfile.subjects,
          gpa: gpa ?? demoProfile.gpa,
          satScore: satScore ?? demoProfile.satScore,
          actScore: actScore ?? demoProfile.actScore,
          intendedMajor: intendedMajor ?? demoProfile.intendedMajor,
          targetUniversities: Array.isArray(targetUniversities) ? targetUniversities : demoProfile.targetUniversities,
          careerInterests: Array.isArray(careerInterests) ? careerInterests : demoProfile.careerInterests,
          location: location ?? demoProfile.location,
          bio: bio?.slice(0, 100) || demoProfile.bio,
          coursesTaking: Array.isArray(coursesTaking) ? coursesTaking.filter(Boolean) : demoProfile.coursesTaking,
          activitiesDone: Array.isArray(activitiesDone) ? activitiesDone : demoProfile.activitiesDone,
          goals: Array.isArray(goals) ? goals : demoProfile.goals,
          customPreferences: customPreferences || demoProfile.customPreferences,
          weeklyAvailability: weeklyAvailability && typeof weeklyAvailability === 'object' ? weeklyAvailability : demoProfile.weeklyAvailability,
        },
      })
    }

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

export async function PATCH(req: Request) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
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
    } = await req.json()

    if (DEMO_MODE && !DATABASE_URL_CONFIGURED) {
      return NextResponse.json({
        message: 'Profile updated in preview mode',
        user: { id: session.user.id, name: name ?? session.user.name },
      })
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        gradeLevel,
        curriculum,
        intendedMajor,
        gpa: gpa ? parseFloat(String(gpa)) : null,
        satScore: satScore ? parseInt(String(satScore), 10) : null,
        actScore: actScore ? parseInt(String(actScore), 10) : null,
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
  } catch {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
