import { NextResponse } from 'next/server'
import { AIProvider, classifyProviderError } from '@/lib/ai/resilience'

export function aiErrorResponse(provider: AIProvider, error: unknown, fallbackMessage: string) {
  const classified = classifyProviderError(provider, error)
  return NextResponse.json(
    {
      error: fallbackMessage,
      code: classified.code,
      provider: classified.provider,
      retryable: classified.retryable,
    },
    { status: classified.statusCode }
  )
}
