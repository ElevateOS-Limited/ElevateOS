import { normalizeRole } from '@/lib/auth/roles'

export const ROLE_HOME_PATHS = {
  OWNER: '/admin',
  ADMIN: '/admin',
  TUTOR: '/tutor-dashboard',
  PARENT: '/dashboard',
  STUDENT: '/dashboard',
  USER: '/dashboard',
} as const

export type RoleHomePath = (typeof ROLE_HOME_PATHS)[keyof typeof ROLE_HOME_PATHS] | '/home'

export function getRoleHomePath(role?: string | null): RoleHomePath {
  const normalized = normalizeRole(role)
  if (!normalized) return '/home'

  return ROLE_HOME_PATHS[normalized] ?? '/home'
}

export function getLoginCallbackPath(role?: string | null) {
  return getRoleHomePath(role)
}

export function isTutoringStaffRole(role?: string | null) {
  const normalized = normalizeRole(role)
  return normalized === 'TUTOR' || normalized === 'ADMIN' || normalized === 'OWNER'
}

export function isParentRole(role?: string | null) {
  return normalizeRole(role) === 'PARENT'
}

export function isStudentRole(role?: string | null) {
  const normalized = normalizeRole(role)
  return normalized === 'STUDENT' || normalized === 'USER'
}
