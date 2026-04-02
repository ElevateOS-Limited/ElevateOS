import { generateJson, generateText, getConfiguredAIStatus } from '@/lib/ai/provider'

export const AI_MODEL = getConfiguredAIStatus().model

export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 2000
): Promise<string> {
  return generateText({
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    maxTokens,
    temperature: 0.7,
  })
}

export async function generateStructuredOutput<T>(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 3000
): Promise<T> {
  return generateJson<T>({
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    maxTokens,
    temperature: 0.5,
  })
}
