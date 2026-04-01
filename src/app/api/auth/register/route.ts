import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { recordEvent } from '@/lib/stats'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  isAokTutor: z.boolean().optional().default(false),
  aokInviteCode: z.string().optional(),
  referralSource: z.string().optional(),
  referralStudySessionId: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const publicSignupEnabled = process.env.PUBLIC_SIGNUP_ENABLED === 'true'
    if (!publicSignupEnabled) {
      return NextResponse.json({ error: 'Signup is disabled. Contact admin for account access.' }, { status: 403 })
    }
    const body = await req.json()
    const { name, email, password, isAokTutor, aokInviteCode, referralSource, referralStudySessionId } = schema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 400 })

    const hashed = await bcrypt.hash(password, 12)

    const tutorInvite = process.env.AOK_TUTOR_INVITE_CODE || ''
    const aokTutorApproved = isAokTutor && tutorInvite && aokInviteCode === tutorInvite

    if (isAokTutor && !aokTutorApproved) {
      return NextResponse.json({ error: 'Invalid AoK tutor invite code' }, { status: 400 })
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        plan: aokTutorApproved ? 'PRO' : 'FREE',
      },
    })

    if (referralSource === 'study_share') {
      await recordEvent(prisma, user.id, 'invite_accepted', {
        source: 'study_share',
        studySessionId: referralStudySessionId || null,
      })
    }

    return NextResponse.json({ message: 'Account created', userId: user.id }, { status: 201 })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message || 'Invalid request' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
