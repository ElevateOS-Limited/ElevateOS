import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { parseStudyShareToken } from '@/lib/share'
import { recordEvent } from '@/lib/stats'

type SharedStudyPageProps = {
  params: Promise<{ token: string }>
}

export default async function SharedStudyPage({ params }: SharedStudyPageProps) {
  const { token } = await params
  const tokenPayload = parseStudyShareToken(token)

  if (!tokenPayload) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold">This share link has expired</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">Ask your friend to generate a new study-pack share link.</p>
          <Link href="/auth/signup" className="inline-block mt-6 px-4 py-2 rounded-lg bg-indigo-600 text-white">
            Create your account
          </Link>
        </div>
      </main>
    )
  }

  const studySession = await prisma.studySession.findFirst({
    where: { id: tokenPayload.sid, userId: tokenPayload.uid },
    select: {
      id: true,
      title: true,
      subject: true,
      curriculum: true,
      summary: true,
      keyConcepts: true,
      studyPlan: true,
      createdAt: true,
    },
  })

  if (!studySession) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold">Study pack not found</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">This study pack is no longer available.</p>
          <Link href="/auth/signup" className="inline-block mt-6 px-4 py-2 rounded-lg bg-indigo-600 text-white">
            Create your account
          </Link>
        </div>
      </main>
    )
  }

  await recordEvent(prisma, tokenPayload.uid, 'study_share_opened', {
    studySessionId: studySession.id,
    source: 'shared_study_page',
  })

  const keyConcepts: string[] = Array.isArray(studySession.keyConcepts)
    ? studySession.keyConcepts.slice(0, 8).map((v: unknown) => String(v))
    : []
  const studyPlan: string[] = Array.isArray(studySession.studyPlan)
    ? studySession.studyPlan.slice(0, 5).map((v: unknown) => String(v))
    : []
  const signupHref = `/auth/signup?from=study_share&sid=${encodeURIComponent(studySession.id)}`

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <p className="text-xs uppercase tracking-wide text-indigo-500">Shared Study Pack</p>
          <h1 className="text-2xl font-bold mt-2">{studySession.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {studySession.subject || 'General'} {studySession.curriculum ? `· ${studySession.curriculum}` : ''} ·{' '}
            {new Date(studySession.createdAt).toLocaleDateString()}
          </p>
          <p className="mt-4 whitespace-pre-wrap text-gray-700 dark:text-gray-300">{studySession.summary}</p>
        </div>

        {keyConcepts.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Key Concepts</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {keyConcepts.map((concept: string, i: number) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-sm">
                  {String(concept)}
                </span>
              ))}
            </div>
          </div>
        )}

        {studyPlan.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Suggested Plan</h2>
            <ol className="mt-3 space-y-2">
              {studyPlan.map((step: string, i: number) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
                  {i + 1}. {String(step)}
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="bg-indigo-600 text-white rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg">Want your own AI study packs?</h3>
            <p className="text-indigo-100 text-sm">Upload notes, get summaries, flashcards, and plans in minutes.</p>
          </div>
          <Link href={signupHref} className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white text-indigo-700 font-semibold">
            Try it free
          </Link>
        </div>
      </div>
    </main>
  )
}
