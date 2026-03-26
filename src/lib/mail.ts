import nodemailer, { type Transporter } from 'nodemailer'

type MailMessage = {
  to: string
  subject: string
  text: string
  html?: string
}

let cachedTransporter: Transporter | null | undefined

function parsePort(value?: string) {
  if (!value) return undefined
  const port = Number.parseInt(value, 10)
  return Number.isFinite(port) ? port : undefined
}

function buildTransporter() {
  if (process.env.SMTP_URL) {
    return nodemailer.createTransport(process.env.SMTP_URL)
  }

  if (!process.env.SMTP_HOST) {
    return null
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parsePort(process.env.SMTP_PORT) ?? 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  })
}

function getTransporter() {
  if (cachedTransporter !== undefined) {
    return cachedTransporter
  }

  cachedTransporter = buildTransporter()
  return cachedTransporter
}

export function isMailConfigured() {
  return getTransporter() !== null
}

export function getSupportEmail() {
  return process.env.SUPPORT_EMAIL || process.env.MAIL_FROM || 'support@elevateos.org'
}

function getFromAddress() {
  return process.env.MAIL_FROM || process.env.SMTP_FROM || getSupportEmail()
}

export async function sendMail(message: MailMessage) {
  const transporter = getTransporter()
  if (!transporter) {
    return { delivered: false as const }
  }

  await transporter.sendMail({
    from: getFromAddress(),
    ...message,
  })

  return { delivered: true as const }
}
