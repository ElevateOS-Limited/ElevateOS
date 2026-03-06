import { NextResponse } from 'next/server'
import { DEMO_MODE } from '@/lib/auth/demo'

type AllowedRole = 'OWNER' | 'ADMIN' | 'TUTOR' | 'PARENT' | 'STUDENT' | 'USER'

type RoleCheckOptions = {
  allowDemoTutorFallback?: boolean
}

function normalizeRole(role: string | null | undefined, options?: RoleCheckOptions): AllowedRole | null {
  if (!role) return null
  const upper = role.toUpperCase() as AllowedRole

  if (upper === 'USER' && options?.allowDemoTutorFallback && DEMO_MODE) {
    return 'TUTOR'
  }

  return upper
}

export function hasRequiredRole(
  role: string | null | undefined,
  allowed: AllowedRole[],
  options?: RoleCheckOptions
) {
  const normalized = normalizeRole(role, options)
  if (!normalized) return false
  return allowed.includes(normalized)
}

export function forbiddenResponse() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
