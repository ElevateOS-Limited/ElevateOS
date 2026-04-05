import { NextResponse } from 'next/server'
import { getSessionOrDemo } from '@/lib/auth/session'
import { getTutoringWorkspaceSnapshot } from '@/lib/tutoring/workspace'

export async function GET() {
  const session = await getSessionOrDemo()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const snapshot = await getTutoringWorkspaceSnapshot(session)
  return NextResponse.json(snapshot)
}
