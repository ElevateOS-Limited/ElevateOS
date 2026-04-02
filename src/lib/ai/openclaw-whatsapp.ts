import { generateText, getConfiguredAIStatus } from '@/lib/ai/provider'

const DEFAULT_SYSTEM_PROMPT = [
  'You are OpenClaw, a practical AI copilot chatting with Arby on WhatsApp.',
  'Be concise, clear, and action-oriented.',
  'If a request is risky, illegal, or unsafe, refuse briefly and suggest a safer alternative.',
  'For normal requests, provide the best direct answer without filler.',
].join(' ')

function resolveMaxTokens() {
  const raw = parseInt(process.env.WHATSAPP_MAX_TOKENS || '300', 10)
  if (Number.isNaN(raw) || raw < 64) return 300
  return Math.min(raw, 1200)
}

export async function generateOpenClawWhatsAppReply(userMessage: string, senderName?: string) {
  const configured = getConfiguredAIStatus()
  const model = process.env.WHATSAPP_AI_MODEL || process.env.WHATSAPP_OPENAI_MODEL || configured.model
  const systemPrompt = process.env.OPENCLAW_SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT
  const personalizedPrompt = senderName ? `${systemPrompt} The user's name is ${senderName}.` : systemPrompt

  const reply = await generateText({
    system: personalizedPrompt,
    messages: [{ role: 'user', content: userMessage }],
    temperature: 0.6,
    maxTokens: resolveMaxTokens(),
    modelOverride: model === 'unset' ? undefined : model,
  })

  return reply.trim() || "I couldn't generate a response right now."
}
