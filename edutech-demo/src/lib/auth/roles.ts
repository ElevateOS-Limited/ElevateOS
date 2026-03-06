import { NextResponse } from 'next/server'

type AllowedRole = 'OWNER' | 'ADMIN' | 'TUTOR' | 'PARENT' | 'STUDENT' | 'USER'

export function hasRequiredRole(
  role: string | null | undefined,
  allowed: AllowedRole[]
) {
  if (!role) return false
  const normalized = role.toUpperCase() as AllowedRole
  return allowed.includes(normalized)
}

export function forbiddenResponse() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
