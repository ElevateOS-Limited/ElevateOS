import { headers } from 'next/headers'
import { getSessionOrDemo } from '@/lib/auth/session'
import { demoDashboardProfile, type DemoDashboardProfile } from '@/lib/dashboard/demo-profile'
import { DATABASE_URL_CONFIGURED, prisma } from '@/lib/prisma'
import { getSiteVariantFromHeaders } from '@/lib/site'
import MainDashboardPage from '@/components/dashboard/MainDashboardPage'
import TutoringDashboardShell from '@/components/tutoring/TutoringDashboardShell'
import TutoringOverviewPage from '@/components/tutoring/TutoringOverviewPage'

export default async function DashboardPage() {
  const siteVariant = getSiteVariantFromHeaders(await headers())
  if (siteVariant === 'tutoring') {
    return (
      <TutoringDashboardShell>
        <TutoringOverviewPage />
      </TutoringDashboardShell>
    )
  }

  const session = await getSessionOrDemo()
  let initialProfile = demoDashboardProfile

  if (session?.user?.id && DATABASE_URL_CONFIGURED) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        gradeLevel: true,
        curriculum: true,
        subjects: true,
        gpa: true,
        satScore: true,
        actScore: true,
        intendedMajor: true,
        targetUniversities: true,
        careerInterests: true,
        location: true,
        bio: true,
        coursesTaking: true,
        activitiesDone: true,
        goals: true,
        customPreferences: true,
        weeklyAvailability: true,
        subscriptionStatus: true,
        subscriptionEnds: true,
        trialEnds: true,
      },
    })

    if (user) {
      const activitiesDone = Array.isArray(user.activitiesDone)
        ? (user.activitiesDone as DemoDashboardProfile['activitiesDone'])
        : demoDashboardProfile.activitiesDone
      const goals = Array.isArray(user.goals) ? (user.goals as DemoDashboardProfile['goals']) : demoDashboardProfile.goals
      const weeklyAvailability =
        user.weeklyAvailability && typeof user.weeklyAvailability === 'object'
          ? (user.weeklyAvailability as DemoDashboardProfile['weeklyAvailability'])
          : demoDashboardProfile.weeklyAvailability

      initialProfile = {
        id: user.id,
        name: user.name ?? demoDashboardProfile.name,
        email: user.email ?? demoDashboardProfile.email,
        image: user.image ?? demoDashboardProfile.image,
        role: user.role ?? demoDashboardProfile.role,
        gradeLevel: user.gradeLevel ?? demoDashboardProfile.gradeLevel,
        curriculum: user.curriculum ?? demoDashboardProfile.curriculum,
        subjects: user.subjects?.length ? user.subjects : [...demoDashboardProfile.subjects],
        gpa: user.gpa ?? demoDashboardProfile.gpa,
        satScore: user.satScore ?? demoDashboardProfile.satScore,
        actScore: user.actScore ?? demoDashboardProfile.actScore,
        intendedMajor: user.intendedMajor ?? demoDashboardProfile.intendedMajor,
        targetUniversities: user.targetUniversities?.length ? user.targetUniversities : [...demoDashboardProfile.targetUniversities],
        careerInterests: user.careerInterests?.length ? user.careerInterests : [...demoDashboardProfile.careerInterests],
        location: user.location ?? demoDashboardProfile.location,
        bio: user.bio ?? demoDashboardProfile.bio,
        coursesTaking: user.coursesTaking?.length ? user.coursesTaking : [...demoDashboardProfile.coursesTaking],
        activitiesDone,
        goals,
        weeklyAvailability,
        customPreferences: demoDashboardProfile.customPreferences,
        subscriptionStatus: user.subscriptionStatus ?? demoDashboardProfile.subscriptionStatus,
        subscriptionEnds: user.subscriptionEnds ?? demoDashboardProfile.subscriptionEnds,
        trialEnds: user.trialEnds ?? demoDashboardProfile.trialEnds,
      }
    }
  }

  return <MainDashboardPage initialProfile={initialProfile} />
}
