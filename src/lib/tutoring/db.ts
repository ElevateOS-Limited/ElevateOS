import type { TutoringTaskStatus } from './contracts'

export function toDbTaskStatus(value: TutoringTaskStatus | string) {
  switch ((value || '').toLowerCase()) {
    case 'submitted':
      return 'SUBMITTED'
    case 'reviewed':
      return 'REVIEWED'
    case 'overdue':
      return 'OVERDUE'
    case 'completed':
      return 'COMPLETED'
    default:
      return 'ASSIGNED'
  }
}

export function fromDbTaskStatus(value: string | null | undefined) {
  switch ((value || '').toUpperCase()) {
    case 'SUBMITTED':
      return 'submitted'
    case 'REVIEWED':
      return 'reviewed'
    case 'OVERDUE':
      return 'overdue'
    case 'COMPLETED':
      return 'completed'
    default:
      return 'assigned'
  }
}

export function parseDateOrNull(value?: string | null) {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function normalizePriority(value?: string | null) {
  const normalized = (value || 'medium').toLowerCase()
  return normalized === 'low' || normalized === 'high' ? normalized : 'medium'
}

export function normalizeStringList(values?: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      (values || [])
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter((value): value is string => Boolean(value)),
    ),
  )
}

export function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function average(values: number[]) {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}
