import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getGitCommit() {
  return (
    process.env.APP_GIT_COMMIT ||
    process.env.SOURCE_COMMIT ||
    process.env.GITHUB_SHA?.slice(0, 7) ||
    'unknown'
  )
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now()
  const deepCheckRequested = request.nextUrl.searchParams.get('check') === 'db'

  let db: { checked: boolean; ok: boolean | null; message: string } = {
    checked: false,
    ok: null,
    message: 'skipped',
  }

  if (deepCheckRequested && !process.env.DATABASE_URL) {
    db = { checked: true, ok: false, message: 'DATABASE_URL not set' }
  } else if (deepCheckRequested) {
    try {
      const { prisma } = await import('@/lib/prisma')
      await prisma.$queryRaw`SELECT 1`
      db = { checked: true, ok: true, message: 'ok' }
    } catch (e: any) {
      db = { checked: true, ok: false, message: e?.message || 'db error' }
    }
  }

  const payload = {
    status: db.checked && db.ok === false ? 'degraded' : 'ok',
    service: 'edutech-demo',
    env: process.env.NODE_ENV || 'unknown',
    buildVersion: process.env.APP_VERSION || 'v0.0.0',
    gitCommit: getGitCommit(),
    modelProvider: process.env.OPENAI_API_KEY ? 'openai' : 'none',
    model: process.env.OPENAI_MODEL || 'unset',
    db,
    uptimeSeconds: Math.floor(process.uptime()),
    responseMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(payload, { status: 200 })
}
