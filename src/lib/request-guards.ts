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
const healthPaths = new Set(['/healthz'])

export function applyRequestGuards(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/health') {
    const rewriteUrl = request.nextUrl.clone()
    rewriteUrl.pathname = '/api/status'
    return NextResponse.rewrite(rewriteUrl)
  }

  if (healthPaths.has(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  const userAgent = request.headers.get('user-agent') || ''
  const query = request.nextUrl.search || ''

  if (blockedAgents.some((pattern) => pattern.test(userAgent)) || badQuery.test(query)) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return new NextResponse('Forbidden', { status: 403 })
  }

  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.hostname).toLowerCase()

  if (getSiteVariantFromHost(host) === 'tutoring') {
    const rewriteUrl = request.nextUrl.clone()
    if (!rewriteUrl.pathname.startsWith('/_next') && rewriteUrl.pathname !== '/favicon.ico') {
      if (rewriteUrl.pathname === '/dashboard' || rewriteUrl.pathname.startsWith('/dashboard/')) {
        rewriteUrl.pathname = rewriteUrl.pathname.replace(/^\/dashboard/, '/tutor-dashboard')
        return NextResponse.rewrite(rewriteUrl)
      }
    }
  }

  if (host === 'activities.thinkcollegelevel.com') {
    const rewriteUrl = request.nextUrl.clone()
    if (!rewriteUrl.pathname.startsWith('/_next') && rewriteUrl.pathname !== '/favicon.ico') {
      rewriteUrl.pathname = '/activities'
      return NextResponse.rewrite(rewriteUrl)
    }
  }

  return null
}
