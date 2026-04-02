import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createPasswordResetToken, getPasswordResetUrl } from '@/lib/auth/password-reset'
import { sendMail, getSupportEmail, isMailConfigured } from '@/lib/mail'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: Request) {
  try {
    const { email } = schema.parse(await req.json())
    const normalizedEmail = email.trim().toLowerCase()
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { email: true, name: true },
    })

    const supportEmail = getSupportEmail()
    const deliveryMode = isMailConfigured() ? 'email' : 'support'

    if (user?.email) {
      const { rawToken, expiresAt } = await createPasswordResetToken(user.email)
      const resetUrl = getPasswordResetUrl(rawToken, new URL(req.url).origin)

      if (deliveryMode === 'email') {
        await sendMail({
          to: user.email,
          subject: 'Reset your ElevateOS password',
          text: [
            `Hi ${user.name || 'there'},`,
            '',
            'We received a request to reset your ElevateOS password.',
            `Use this link to choose a new password: ${resetUrl}`,
            '',
            `This link expires at ${expiresAt.toISOString()}.`,
            '',
            `If you did not request this reset, you can ignore this email or contact ${supportEmail}.`,
          ].join('\n'),
          html: [
            `<p>Hi ${user.name || 'there'},</p>`,
            '<p>We received a request to reset your ElevateOS password.</p>',
            `<p><a href="${resetUrl}">Choose a new password</a></p>`,
            `<p>This link expires at <strong>${expiresAt.toISOString()}</strong>.</p>`,
            `<p>If you did not request this reset, you can ignore this email or contact ${supportEmail}.</p>`,
          ].join(''),
        })
      } else if (process.env.NODE_ENV !== 'production') {
        console.info(`[password-reset] SMTP not configured. Reset link for ${user.email}: ${resetUrl}`)
      }
    }

    const message =
      deliveryMode === 'email'
        ? 'If an account exists for that email, a reset link has been sent.'
        : `If an account exists for that email, contact ${supportEmail} for password reset help while email delivery is being configured.`

    return NextResponse.json({ message, deliveryMode })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Invalid email address' }, { status: 400 })
    }

    console.error(error)
    return NextResponse.json({ error: 'Unable to process reset request' }, { status: 500 })
  }
}
