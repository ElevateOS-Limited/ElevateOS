type SessionLike = {
  user?: {
    id?: string | null
    email?: string | null
  }
}

function sanitize(input: string) {
  return input.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase()
}

export function deriveOrgIdFromSession(session: SessionLike): string {
  const email = session.user?.email || ''
  const domain = email.includes('@') ? email.split('@')[1] : ''

  if (domain) return `org-${sanitize(domain)}`

  const userId = session.user?.id || 'unknown'
  return `org-user-${sanitize(userId)}`
}
