import { NextRequest, NextResponse } from 'next/server'
import { prisma, DATABASE_URL_CONFIGURED } from '@/lib/prisma'
import { getSessionOrDemo } from '@/lib/auth/session'
import { DEMO_MODE } from '@/lib/auth/demo'

const defaultPreferences = { collapsed: false, openGroups: ['dashboard', 'learn', 'plan', 'apply'] }

export async function GET() {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (DEMO_MODE && !DATABASE_URL_CONFIGURED) {
    return NextResponse.json(defaultPreferences)
  }

  const pref = await prisma.sidebarPreference.findUnique({ where: { userId: session.user.id } })
  return NextResponse.json(pref || defaultPreferences)
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionOrDemo()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const collapsed = typeof body.collapsed === 'boolean' ? body.collapsed : undefined
  const openGroups = Array.isArray(body.openGroups) ? body.openGroups.filter((g: any) => typeof g === 'string') : undefined
  const payload = {
    collapsed: collapsed ?? false,
    openGroups: openGroups ?? defaultPreferences.openGroups,
  }

  if (DEMO_MODE && !DATABASE_URL_CONFIGURED) {
    return NextResponse.json(payload)
  }

  const pref = await prisma.sidebarPreference.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      ...payload,
    },
    update: {
      ...(collapsed !== undefined ? { collapsed } : {}),
      ...(openGroups !== undefined ? { openGroups } : {}),
    },
  })

  return NextResponse.json(pref)
}
