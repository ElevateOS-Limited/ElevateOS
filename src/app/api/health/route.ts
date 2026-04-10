import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const startedAt = Date.now()
  const databaseUrlConfigured = Boolean(process.env.DATABASE_URL?.trim())
  const status = databaseUrlConfigured ? 'ok' : 'degraded'

  return NextResponse.json(
    {
      status,
      service: 'elevateos',
      timestamp: new Date().toISOString(),
      db: { ok: databaseUrlConfigured },
      responseMs: Date.now() - startedAt,
    },
    { status: databaseUrlConfigured ? 200 : 503 },
  )
}
