import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { execSync } from 'node:child_process'
import { getConfiguredAIStatus } from '@/lib/ai/provider'
import { GOOGLE_AUTH_CONFIGURED } from '@/lib/auth/options'
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

  const dbOk = await withServiceDbContext(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`
      return true
    } catch {
      return false
    }
  })

  const status = dbOk ? 'ok' : 'degraded'

  if (!detailed) {
    const payload = {
      status,
      service: 'elevateos-demo',
      timestamp: new Date().toISOString(),
      db: { ok: dbOk },
      responseMs: Date.now() - startedAt,
    }
    return NextResponse.json(payload, { status: dbOk ? 200 : 503 })
  }

  const ai = getConfiguredAIStatus()

  const payload = {
    status,
    service: 'elevateos-demo',
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
