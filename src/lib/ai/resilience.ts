export type AIProvider = 'openai' | 'anthropic'
export type AIErrorCode = 'TIMEOUT' | 'RATE_LIMIT' | 'CIRCUIT_OPEN' | 'PROVIDER_ERROR' | 'UNKNOWN'

type ProviderState = {
  failures: number
  openedUntilMs: number
}

const DEFAULT_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 15000)
const CIRCUIT_FAILURE_THRESHOLD = Number(process.env.AI_CIRCUIT_FAILURE_THRESHOLD || 3)
const CIRCUIT_OPEN_MS = Number(process.env.AI_CIRCUIT_OPEN_MS || 30000)

const providerState: Record<AIProvider, ProviderState> = {
  openai: { failures: 0, openedUntilMs: 0 },
  anthropic: { failures: 0, openedUntilMs: 0 },
}

export class AIProviderError extends Error {
  provider: AIProvider
  code: AIErrorCode
  statusCode: number
  retryable: boolean

  constructor(provider: AIProvider, code: AIErrorCode, message: string, statusCode: number, retryable: boolean) {
    super(message)
    this.provider = provider
    this.code = code
    this.statusCode = statusCode
    this.retryable = retryable
  }
}

function currentState(provider: AIProvider) {
  return providerState[provider]
}

export function getAICircuitSnapshot() {
  const now = Date.now()
  return {
    openai: {
      failures: providerState.openai.failures,
      open: providerState.openai.openedUntilMs > now,
      openedUntilMs: providerState.openai.openedUntilMs,
    },
    anthropic: {
      failures: providerState.anthropic.failures,
      open: providerState.anthropic.openedUntilMs > now,
      openedUntilMs: providerState.anthropic.openedUntilMs,
    },
  }
}

export function resetAICircuitState() {
  providerState.openai = { failures: 0, openedUntilMs: 0 }
  providerState.anthropic = { failures: 0, openedUntilMs: 0 }
}

function emitAIMetric(provider: AIProvider, event: string, fields: Record<string, unknown>) {
  console.log(
    JSON.stringify({
      metric: 'ai_provider',
      provider,
      event,
      at: new Date().toISOString(),
      ...fields,
    })
  )
}

function withTimeout<T>(promise: Promise<T>, provider: AIProvider, timeoutMs: number) {
  let timeoutHandle: NodeJS.Timeout | undefined
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new AIProviderError(provider, 'TIMEOUT', `${provider} request timed out`, 504, true))
    }, timeoutMs)
  })
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutHandle) clearTimeout(timeoutHandle)
  })
}

export function classifyProviderError(provider: AIProvider, error: unknown) {
  if (error instanceof AIProviderError) return error

  const anyError = error as any
  const status = Number(anyError?.status ?? anyError?.statusCode ?? 0)
  const message = String(anyError?.message || '').toLowerCase()

  if (status === 429 || message.includes('rate limit')) {
    return new AIProviderError(provider, 'RATE_LIMIT', `${provider} rate limited`, 429, true)
  }
  if (status >= 500) {
    return new AIProviderError(provider, 'PROVIDER_ERROR', `${provider} upstream failed`, 503, true)
  }
  return new AIProviderError(provider, 'UNKNOWN', `${provider} request failed`, 502, false)
}

function ensureCircuitClosed(provider: AIProvider) {
  const state = currentState(provider)
  if (state.openedUntilMs > Date.now()) {
    throw new AIProviderError(provider, 'CIRCUIT_OPEN', `${provider} circuit is open`, 503, true)
  }
}

function markSuccess(provider: AIProvider, durationMs: number) {
  const state = currentState(provider)
  state.failures = 0
  state.openedUntilMs = 0
  emitAIMetric(provider, 'success', { durationMs })
}

function markFailure(provider: AIProvider, error: AIProviderError) {
  const state = currentState(provider)
  state.failures += 1
  if (state.failures >= CIRCUIT_FAILURE_THRESHOLD) {
    state.openedUntilMs = Date.now() + CIRCUIT_OPEN_MS
    emitAIMetric(provider, 'circuit_opened', {
      failures: state.failures,
      openedUntilMs: state.openedUntilMs,
      code: error.code,
    })
  }
  emitAIMetric(provider, 'failure', {
    failures: state.failures,
    code: error.code,
    statusCode: error.statusCode,
    retryable: error.retryable,
  })
}

export async function runWithAIProtection<T>(
  provider: AIProvider,
  operation: () => Promise<T>,
  timeoutMs = DEFAULT_TIMEOUT_MS
) {
  ensureCircuitClosed(provider)
  const startedAt = Date.now()

  try {
    const result = await withTimeout(operation(), provider, timeoutMs)
    markSuccess(provider, Date.now() - startedAt)
    return result
  } catch (error) {
    const classified = classifyProviderError(provider, error)
    markFailure(provider, classified)
    throw classified
  }
}
