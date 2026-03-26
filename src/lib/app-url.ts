const DEFAULT_APP_URL = 'https://elevateos.org'

function normalizeAppUrl(value?: string | null) {
  if (!value) {
    return null
  }

  try {
    return new URL(value).toString()
  } catch {
    return null
  }
}

export function getAppUrl(fallback?: string) {
  return (
    normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL) ||
    normalizeAppUrl(process.env.NEXTAUTH_URL) ||
    normalizeAppUrl(fallback) ||
    DEFAULT_APP_URL
  )
}
