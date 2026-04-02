import bcrypt from 'bcryptjs'
import { createHash, randomBytes } from 'crypto'
import { getAppUrl } from '@/lib/app-url'
import { prisma } from '@/lib/prisma'

const RESET_LINK_PREFIX = 'reset-link:'
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 60

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function getIdentifier(email: string) {
  return `${RESET_LINK_PREFIX}${normalizeEmail(email)}`
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function getEmailFromIdentifier(identifier: string) {
  return identifier.startsWith(RESET_LINK_PREFIX)
    ? identifier.slice(RESET_LINK_PREFIX.length)
    : null
}

async function getActiveResetToken(rawToken: string) {
  const tokenRecord = await prisma.verificationToken.findUnique({
    where: { token: hashToken(rawToken) },
  })

  if (!tokenRecord) {
    return null
  }

  if (!tokenRecord.identifier.startsWith(PASSWORD_RESET_PREFIX)) {
    return null
  }

  if (tokenRecord.expires.getTime() <= Date.now()) {
    await prisma.verificationToken.delete({ where: { token: tokenRecord.token } }).catch(() => {})
    return null
  }

  return tokenRecord
}

export async function createPasswordResetToken(email: string) {
  const normalizedEmail = normalizeEmail(email)
  const identifier = getIdentifier(normalizedEmail)
  const rawToken = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS)

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  })

  await prisma.verificationToken.create({
    data: {
      identifier,
      token: hashToken(rawToken),
      expires: expiresAt,
    },
  })

  return { rawToken, expiresAt }
}

export async function isPasswordResetTokenValid(rawToken: string) {
  const tokenRecord = await getActiveResetToken(rawToken)
  return Boolean(tokenRecord)
}

export async function resetPasswordWithToken(rawToken: string, nextPassword: string) {
  const tokenRecord = await getActiveResetToken(rawToken)
  if (!tokenRecord) {
    return { ok: false as const, reason: 'invalid-token' as const }
  }

  const email = getEmailFromIdentifier(tokenRecord.identifier)
  if (!email) {
    await prisma.verificationToken.delete({ where: { token: tokenRecord.token } }).catch(() => {})
    return { ok: false as const, reason: 'invalid-token' as const }
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (!user) {
    await prisma.verificationToken.deleteMany({ where: { identifier: tokenRecord.identifier } })
    return { ok: false as const, reason: 'invalid-token' as const }
  }

  const password = await bcrypt.hash(nextPassword, 12)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password },
    }),
    prisma.verificationToken.deleteMany({
      where: { identifier: tokenRecord.identifier },
    }),
  ])

  return { ok: true as const }
}

export function getPasswordResetUrl(rawToken: string, fallbackOrigin?: string) {
  const origin = fallbackOrigin || getAppUrl()
  return `${origin}/auth/reset-password/${rawToken}`
}
