import { NextResponse } from 'next/server'

export type AllowedRole = 'OWNER' | 'ADMIN' | 'TUTOR' | 'PARENT' | 'STUDENT' | 'USER'

const ORG_WIDE_ROLES: AllowedRole[] = ['OWNER', 'ADMIN']

export function normalizeRole(role: string | null | undefined): AllowedRole | null {
  if (!role) return null
  const normalized = role.toUpperCase() as AllowedRole
  return normalized
}

export function hasRequiredRole(role: string | null | undefined, allowed: AllowedRole[]) {
  const normalized = normalizeRole(role)
  return normalized ? allowed.includes(normalized) : false
}

export function canReadOrgWide(role: string | null | undefined) {
  const normalized = normalizeRole(role)
  return normalized ? ORG_WIDE_ROLES.includes(normalized) : false
}

export function forbiddenResponse() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
