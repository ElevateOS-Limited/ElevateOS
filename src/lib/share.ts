import crypto from 'node:crypto'

type StudySharePayload = {
  uid: string
  sid: string
  exp: number
}

const ONE_HOUR_MS = 60 * 60 * 1000

function getShareSecret() {
  return (
    process.env.STUDY_SHARE_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    (process.env.NODE_ENV !== 'production' ? 'dev-study-share-secret' : '')
  )
}

function encode(payload: StudySharePayload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

function sign(encodedPayload: string) {
  const secret = getShareSecret()
  if (!secret) {
    throw new Error('Study share secret is not configured')
  }

  return crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64url')
}

export function createStudyShareToken(userId: string, studySessionId: string, expiresInHours = 168) {
  const payload: StudySharePayload = {
    uid: userId,
    sid: studySessionId,
    exp: Date.now() + expiresInHours * ONE_HOUR_MS,
  }

  const encodedPayload = encode(payload)
  return `${encodedPayload}.${sign(encodedPayload)}`
}

export function parseStudyShareToken(token: string) {
  const [encodedPayload, providedSignature] = token.split('.')
  if (!encodedPayload || !providedSignature) return null

  const expectedSignature = sign(encodedPayload)
  if (providedSignature.length !== expectedSignature.length) {
    return null
  }

  if (!crypto.timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expectedSignature))) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as StudySharePayload
    if (!payload?.uid || !payload?.sid || typeof payload?.exp !== 'number') return null
    if (payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}
