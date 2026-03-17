import OpenAI from 'openai'
import { AIConfigError } from './errors'
import { runWithAIProtection } from '@/lib/ai/resilience'

function resolveApiKey() {
  const key = (process.env.OPENAI_API_KEY || '').trim()
  if (!key || key.startsWith('sk-test-') || key.includes('your-actual-openai-key')) {
    throw new AIConfigError('OPENAI_API_KEY is missing or invalid')
  }
  return key
}

function getOpenAI() {
  return new OpenAI({ apiKey: resolveApiKey() })
}

export const AI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o'

export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 2000
): Promise<string> {
  const response = await runWithAIProtection('openai', () =>
    getOpenAI().chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    })
  )
  return response.choices[0]?.message?.content || ''
}

export async function generateStructuredOutput<T>(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 3000
): Promise<T> {
  const response = await runWithAIProtection('openai', () =>
    getOpenAI().chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt + '\n\nAlways respond with valid JSON only.' },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.5,
      response_format: { type: 'json_object' },
    })
  )
  const content = response.choices[0]?.message?.content || '{}'
  return JSON.parse(content) as T
}

export { getOpenAI }
