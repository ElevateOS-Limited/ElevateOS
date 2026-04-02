import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isPasswordResetTokenValid, resetPasswordWithToken } from '@/lib/auth/password-reset'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{ token: string }>
}

const schema = z.object({
  password: z.string().min(8).max(128),
})

export async function GET(_: Request, ctx: RouteContext) {
  const { token } = await ctx.params
  const valid = await isPasswordResetTokenValid(token)
  return NextResponse.json(
    { valid },
    {
      status: valid ? 200 : 404,
      headers: { 'Cache-Control': 'no-store' },
    }
  )
}

export async function POST(req: Request, ctx: RouteContext) {
  try {
    const { token } = await ctx.params
    const { password } = schema.parse(await req.json())
    const result = await resetPasswordWithToken(token, password)

    if (!result.ok) {
      return NextResponse.json({ error: 'This reset link is invalid or has expired.' }, { status: 400 })
    }

    return NextResponse.json({ message: 'Password updated successfully.' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Invalid password' }, { status: 400 })
    }

    console.error(error)
    return NextResponse.json({ error: 'Unable to reset password' }, { status: 500 })
  }
}
