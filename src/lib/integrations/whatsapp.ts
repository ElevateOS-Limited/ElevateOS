import crypto from 'node:crypto'

export type WhatsAppInboundMessage = {
  id: string
  from: string
  fromName?: string
  text: string
}

type WebhookPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        contacts?: Array<{
          wa_id?: string
          profile?: { name?: string }
        }>
        messages?: Array<{
          id?: string
          from?: string
          type?: string
          text?: { body?: string }
          button?: { text?: string }
          interactive?: {
            button_reply?: { title?: string }
            list_reply?: { title?: string }
          }
        }>
      }
    }>
  }>
}

type WebhookMessage = {
  id?: string
  from?: string
  type?: string
  text?: { body?: string }
  button?: { text?: string }
  interactive?: {
    button_reply?: { title?: string }
    list_reply?: { title?: string }
  }
}

type SendTextArgs = {
  accessToken: string
  phoneNumberId: string
  to: string
  text: string
  graphApiVersion: string
}

export function normalizePhoneNumber(raw: string) {
  return (raw || '').replace(/\D/g, '')
}

export function parseAllowlistedPhoneNumbers(raw: string | undefined) {
  return (raw || '')
    .split(',')
    .map((value) => normalizePhoneNumber(value.trim()))
    .filter(Boolean)
}

export function isSenderAllowed(sender: string, allowlist: string[]) {
  if (allowlist.length === 0) return true
  return allowlist.includes(normalizePhoneNumber(sender))
}

export function verifyWhatsAppSignature(rawBody: string, signatureHeader: string | null, appSecret: string) {
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false
  const expected = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex')
  const received = signatureHeader.slice('sha256='.length)
  try {
    const receivedBuffer = Buffer.from(received, 'hex')
    const expectedBuffer = Buffer.from(expected, 'hex')
    if (receivedBuffer.length !== expectedBuffer.length) return false
    return crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  } catch {
    return false
  }
}

function extractMessageText(message: WebhookMessage) {
  if (message.type === 'text') {
    return message.text?.body || ''
  }
  if (message.type === 'button') {
    return message.button?.text || ''
  }
  if (message.type === 'interactive') {
    return message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || ''
  }
  return ''
}

export function extractIncomingMessages(payload: WebhookPayload): WhatsAppInboundMessage[] {
  const parsed: WhatsAppInboundMessage[] = []
  const entries = payload.entry || []

  for (const entry of entries) {
    const changes = entry.changes || []
    for (const change of changes) {
      const value = change.value
      if (!value) continue

      const nameByWaId = new Map<string, string>()
      for (const contact of value.contacts || []) {
        const waId = contact.wa_id || ''
        const name = contact.profile?.name || ''
        if (waId && name) {
          nameByWaId.set(waId, name)
        }
      }

      for (const message of value.messages || []) {
        const id = message.id || ''
        const from = message.from || ''
        const text = extractMessageText(message).trim()

        if (!id || !from || !text) continue

        parsed.push({
          id,
          from,
          fromName: nameByWaId.get(from),
          text,
        })
      }
    }
  }

  return parsed
}

export async function sendWhatsAppTextMessage({
  accessToken,
  phoneNumberId,
  to,
  text,
  graphApiVersion,
}: SendTextArgs) {
  const endpoint = `https://graph.facebook.com/${graphApiVersion}/${phoneNumberId}/messages`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`WhatsApp send failed: ${response.status} ${details}`)
  }
}
