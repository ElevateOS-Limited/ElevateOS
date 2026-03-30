import { NextRequest, NextResponse } from 'next/server'
import { getSiteVariantFromHost } from '@/lib/site'

const blockedAgents = [
  /HTTrack/i,
  /WebCopier/i,
  /wget/i,
  /curl/i,
  /python-requests/i,
  /scrapy/i,
  /aiohttp/i,
  /Go-http-client/i,
  /libwww-perl/i,
]

const badQuery = /(\.\.|%2e%2e|union\s+select|select\s+.*from|<script|\/etc\/passwd)/i
const healthPaths = new Set(['/healthz', '/api/health'])

export function middleware(req: NextRequest) {
  if (healthPaths.has(req.nextUrl.pathname)) {
    return NextResponse.next()
  }

  const ua = req.headers.get('user-agent') || ''
  const q = req.nextUrl.search || ''

  if (blockedAgents.some((re) => re.test(ua)) || badQuery.test(q)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const host = (req.headers.get('host') || '').toLowerCase()
  const siteVariant = getSiteVariantFromHost(host)
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-site-variant', siteVariant)

  if (
    siteVariant === 'tutoring' &&
    [
      '/admissions',
      '/internships',
      '/dashboard/admissions',
      '/dashboard/internships',
      '/dashboard/extracurriculars',
      '/dashboard/portfolio-insights',
      '/dashboard/scholarships',
    ].some((prefix) => req.nextUrl.pathname === prefix || req.nextUrl.pathname.startsWith(`${prefix}/`))
  ) {
    return NextResponse.redirect(new URL(req.nextUrl.pathname, 'https://elevateos.org'))
  }

  if (host === 'activities.thinkcollegelevel.com') {
    const rewriteUrl = req.nextUrl.clone()
    if (!rewriteUrl.pathname.startsWith('/_next') && rewriteUrl.pathname !== '/favicon.ico') {
      rewriteUrl.pathname = '/activities'
      return NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } })
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|healthz|api/health).*)'],
}
