export function getAppUrl(request?: Request) {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.NEXTAUTH_URL?.trim()
  if (envUrl) return envUrl
  if (request) return new URL(request.url).origin
  return 'http://localhost:3000'
}
