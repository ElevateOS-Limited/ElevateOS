import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";
import { withServiceDbContext } from "@/lib/db/rls";

const handler = NextAuth(authOptions);
type AuthRouteContext = { params: Promise<{ nextauth: string[] }> }
const nextAuthHandler = handler as (request: Request, context: unknown) => ReturnType<typeof handler>

async function authHandler(request: NextRequest, context: AuthRouteContext) {
  try {
    return await withServiceDbContext(() => nextAuthHandler(request, context))
  } catch (error) {
    console.error('Auth route failed', error)
    return NextResponse.json({ error: "Authentication unavailable" }, { status: 500 })
  }
}

export { authHandler as GET, authHandler as POST }
