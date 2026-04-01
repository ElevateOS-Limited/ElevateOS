import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenAI } from '@google/genai'
import OpenAI from 'openai'
import { AIConfigError } from '@/lib/ai/errors'
import { AIProvider, runWithAIProtection } from '@/lib/ai/resilience'

export interface TextMessage {
  role: 'user' | 'assistant'
  content: string
}

interface TextGenerationOptions {
  messages: TextMessage[]
  system?: string
  maxTokens?: number
  temperature?: number
  modelOverride?: string
  providerOverride?: AIProvider
}

interface VisionJsonGenerationOptions {
  prompt: string
  imageDataUrl: string
  system?: string
  maxTokens?: number
  temperature?: number
  modelOverride?: string
  providerOverride?: AIProvider
}

type AIStatus = {
  provider: AIProvider | 'none'
  model: string
}

function isUnset(value: string | undefined, invalidMarkers: string[] = []) {
  const normalized = (value || '').trim()
  return !normalized || invalidMarkers.some((marker) => normalized.includes(marker))
}

function hasOpenAIConfig() {
  const key = (process.env.OPENAI_API_KEY || '').trim()
  return Boolean(key) && !key.startsWith('sk-test-') && !key.includes('your-actual-openai-key')
}

function hasAnthropicConfig() {
  return !isUnset(process.env.ANTHROPIC_API_KEY, ['your-anthropic-api-key'])
}

function hasGeminiDeveloperConfig() {
  return !isUnset(process.env.GEMINI_API_KEY, ['your-gemini-api-key'])
}

function vertexProject() {
  return (process.env.GOOGLE_CLOUD_PROJECT || '').trim()
}

function vertexLocation() {
  return (process.env.GOOGLE_CLOUD_LOCATION || '').trim()
}

function hasVertexConfig() {
  return Boolean(vertexProject() && vertexLocation())
}

function shouldUseVertexAI() {
  return process.env.GOOGLE_GENAI_USE_VERTEXAI === 'true'
}

function hasGeminiConfig() {
  return hasGeminiDeveloperConfig() || hasVertexConfig()
}

function listConfiguredProviders(): AIProvider[] {
  const configured: AIProvider[] = []
  if (hasGeminiConfig()) configured.push('gemini')
  if (hasOpenAIConfig()) configured.push('openai')
  if (hasAnthropicConfig()) configured.push('anthropic')
  return configured
}

function preferredProviders(): AIProvider[] {
  const configured = listConfiguredProviders()
  if (!configured.length) {
    throw new AIConfigError(
      'No AI provider configured. Set Vertex/Gemini, OpenAI, or Anthropic credentials.'
    )
  }

  const explicit = (process.env.AI_PROVIDER || 'auto').trim().toLowerCase()
  if (!explicit || explicit === 'auto') return configured

  if (!['gemini', 'openai', 'anthropic'].includes(explicit)) {
    throw new AIConfigError(`AI_PROVIDER "${explicit}" is invalid`)
  }

  const preferred = explicit as AIProvider
  if (!configured.includes(preferred)) {
    throw new AIConfigError(`AI_PROVIDER "${preferred}" is selected but not configured`)
  }

  return [preferred, ...configured.filter((provider) => provider !== preferred)]
}

function resolveProvider(providerOverride?: AIProvider, allowed?: AIProvider[]) {
  const ordered = preferredProviders()
  const candidates = providerOverride
    ? [providerOverride, ...ordered.filter((provider) => provider !== providerOverride)]
    : ordered
  const filtered = allowed ? candidates.filter((provider) => allowed.includes(provider)) : candidates

  if (!filtered.length) {
    const label = allowed ? allowed.join(', ') : 'gemini, openai, anthropic'
    throw new AIConfigError(`No compatible AI provider configured. Expected one of: ${label}`)
  }

  return filtered[0]
}

function geminiModel() {
  return (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim()
}

function openAIModel() {
  return (process.env.OPENAI_MODEL || 'gpt-4o').trim()
}

function anthropicModel() {
  return (process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022').trim()
}

function resolveModel(provider: AIProvider, override?: string) {
  if (override?.trim()) return override.trim()
  switch (provider) {
    case 'gemini':
      return geminiModel()
    case 'anthropic':
      return anthropicModel()
    default:
      return openAIModel()
  }
}

function getGemini() {
  if (shouldUseVertexAI() || (hasVertexConfig() && !hasGeminiDeveloperConfig())) {
    const project = vertexProject()
    const location = vertexLocation()
    if (!project || !location) {
      throw new AIConfigError(
        'Vertex AI requires GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION'
      )
    }
    return new GoogleGenAI({
      vertexai: true,
      project,
      location,
    })
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim()
  if (!apiKey) {
    throw new AIConfigError('GEMINI_API_KEY is missing or invalid')
  }

  return new GoogleGenAI({ apiKey })
}

function getOpenAI() {
  const apiKey = (process.env.OPENAI_API_KEY || '').trim()
  if (!hasOpenAIConfig()) {
    throw new AIConfigError('OPENAI_API_KEY is missing or invalid')
  }
  return new OpenAI({ apiKey })
}

function getAnthropic() {
  const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim()
  if (!hasAnthropicConfig()) {
    throw new AIConfigError('ANTHROPIC_API_KEY is missing or invalid')
  }
  return new Anthropic({ apiKey })
}

function stripCodeFences(value: string) {
  return value.replace(/```json\s*|\s*```/gi, '').trim()
}

function parseJson<T>(value: string): T {
  const cleaned = stripCodeFences(value || '{}')
  return JSON.parse(cleaned || '{}') as T
}

function toGeminiContents(messages: TextMessage[]) {
  return messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }))
}

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+?);base64,(.+)$/)
  if (!match) {
    throw new AIConfigError('Expected imageDataUrl to be a base64 data URL')
  }
  return { mimeType: match[1], data: match[2] }
}

export function getPrimaryAIProvider() {
  return resolveProvider()
}

export function getPrimaryAIModel() {
  return resolveModel(getPrimaryAIProvider())
}

export function getConfiguredAIStatus(): AIStatus {
  try {
    const provider = getPrimaryAIProvider()
    return { provider, model: resolveModel(provider) }
  } catch {
    return { provider: 'none', model: 'unset' }
  }
}

export async function generateText({
  messages,
  system,
  maxTokens = 2000,
  temperature = 0.7,
  modelOverride,
  providerOverride,
}: TextGenerationOptions): Promise<string> {
  const provider = resolveProvider(providerOverride)
  const model = resolveModel(provider, modelOverride)

  switch (provider) {
    case 'gemini': {
      const response = await runWithAIProtection('gemini', () =>
        getGemini().models.generateContent({
          model,
          contents: toGeminiContents(messages),
          config: {
            systemInstruction: system,
            temperature,
            maxOutputTokens: maxTokens,
          },
        })
      )
      return response.text || ''
    }
    case 'anthropic': {
      const response = await runWithAIProtection('anthropic', () =>
        getAnthropic().messages.create({
          model,
          max_tokens: maxTokens,
          temperature,
          system,
          messages: messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        })
      )
      const content = response.content[0]
      return content?.type === 'text' ? content.text : ''
    }
    default: {
      const response = await runWithAIProtection('openai', () =>
        getOpenAI().chat.completions.create({
          model,
          max_tokens: maxTokens,
          temperature,
          messages: [
            ...(system ? [{ role: 'system' as const, content: system }] : []),
            ...messages,
          ],
        })
      )
      return response.choices[0]?.message?.content || ''
    }
  }
}

export async function generateJson<T>({
  messages,
  system,
  maxTokens = 3000,
  temperature = 0.5,
  modelOverride,
  providerOverride,
}: TextGenerationOptions): Promise<T> {
  const provider = resolveProvider(providerOverride)
  const model = resolveModel(provider, modelOverride)

  switch (provider) {
    case 'gemini': {
      const response = await runWithAIProtection('gemini', () =>
        getGemini().models.generateContent({
          model,
          contents: toGeminiContents(messages),
          config: {
            systemInstruction: system,
            temperature,
            maxOutputTokens: maxTokens,
            responseMimeType: 'application/json',
          },
        })
      )
      return parseJson<T>(response.text || '{}')
    }
    case 'anthropic': {
      const text = await generateText({
        messages,
        system: [system, 'Return valid JSON only.'].filter(Boolean).join('\n\n'),
        maxTokens,
        temperature,
        modelOverride,
        providerOverride: 'anthropic',
      })
      return parseJson<T>(text)
    }
    default: {
      const response = await runWithAIProtection('openai', () =>
        getOpenAI().chat.completions.create({
          model,
          max_tokens: maxTokens,
          temperature,
          response_format: { type: 'json_object' },
          messages: [
            ...(system
              ? [{ role: 'system' as const, content: `${system}\n\nAlways respond with valid JSON only.` }]
              : []),
            ...messages,
          ],
        })
      )
      return parseJson<T>(response.choices[0]?.message?.content || '{}')
    }
  }
}

export async function generateVisionJson<T>({
  prompt,
  imageDataUrl,
  system,
  maxTokens = 3000,
  temperature = 0.2,
  modelOverride,
  providerOverride,
}: VisionJsonGenerationOptions): Promise<T> {
  const provider = resolveProvider(providerOverride, ['gemini', 'openai'])
  const model = resolveModel(provider, modelOverride)

  if (provider === 'gemini') {
    const { mimeType, data } = parseDataUrl(imageDataUrl)
    const response = await runWithAIProtection('gemini', () =>
      getGemini().models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }, { inlineData: { mimeType, data } }],
          },
        ],
        config: {
          systemInstruction: system,
          temperature,
          maxOutputTokens: maxTokens,
          responseMimeType: 'application/json',
        },
      })
    )
    return parseJson<T>(response.text || '{}')
  }

  const response = await runWithAIProtection('openai', () =>
    getOpenAI().chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature,
      response_format: { type: 'json_object' },
      messages: [
        ...(system ? [{ role: 'system' as const, content: `${system}\n\nReturn valid JSON only.` }] : []),
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageDataUrl } },
          ],
        },
      ],
    })
  )

  return parseJson<T>(response.choices[0]?.message?.content || '{}')
}
