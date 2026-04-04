import { NextRequest, NextResponse } from 'next/server'
import { applyRequestGuards } from '@/lib/request-guards'

export function proxy(request: NextRequest) {
  return applyRequestGuards(request) ?? NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|healthz|api/health).*)'],
}
