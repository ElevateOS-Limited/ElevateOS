import { NextResponse } from 'next/server'
import { withServiceDbContext } from '@/lib/db/rls'

function getGitCommit() {
  return (
    process.env.APP_GIT_COMMIT ||
    process.env.SOURCE_COMMIT ||
    process.env.GITHUB_SHA?.slice(0, 7) ||
    'unknown'
  )
}

function healthAuthOk(req: Request): boolean {
  if (process.env.NODE_ENV !== 'production') return true
  const secret = process.env.HEALTH_CHECK_SECRET?.trim()
  if (!secret) return false
  const auth = req.headers.get('authorization')
  const bearer = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  const header = req.headers.get('x-health-secret')?.trim() ?? ''
  return bearer === secret || header === secret
}

export async function GET(req: Request) {
  const startedAt = Date.now()
  const detailed = healthAuthOk(req)
  const databaseUrlConfigured = Boolean(process.env.DATABASE_URL?.trim())

  const dbOk = databaseUrlConfigured
    ? await withServiceDbContext(async () => {
        try {
          const { prisma } = await import('@/lib/prisma')
          await prisma.$queryRaw`SELECT 1`
          return true
        } catch {
          return false
        }
      })
    : false

  const status = dbOk ? 'ok' : 'degraded'

  if (!detailed) {
    const payload = {
      status,
      service: 'elevateos',
      timestamp: new Date().toISOString(),
      db: { ok: dbOk },
      responseMs: Date.now() - startedAt,
    }
    return NextResponse.json(payload, { status: dbOk ? 200 : 503 })
  }

  const [{ getConfiguredAIStatus }, { GOOGLE_AUTH_CONFIGURED }] = await Promise.all([
    import('@/lib/ai/provider'),
    import('@/lib/auth/options'),
  ])
  const ai = getConfiguredAIStatus()

  const payload = {
    status,
    service: 'elevateos',
    env: process.env.NODE_ENV || 'unknown',
    buildVersion: process.env.APP_VERSION || 'v0.0.0',
    gitCommit: getGitCommit(),
    modelProvider: ai.provider,
    model: ai.model,
    auth: {
      googleConfigured: GOOGLE_AUTH_CONFIGURED,
      nextAuthUrl: process.env.NEXTAUTH_URL || 'unset',
    },
    envChecks: {
      databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
      nextAuthSecretConfigured: Boolean(process.env.NEXTAUTH_SECRET),
    },
    db: { ok: dbOk, message: dbOk ? 'ok' : 'db error' },
    uptimeSeconds: Math.floor(process.uptime()),
    responseMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(payload, { status: dbOk ? 200 : 503 })
}
