import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { withServiceDbContext } from "@/lib/db/rls";

const handler = NextAuth(authOptions);

export function GET(request: Request) {
  return withServiceDbContext(() => handler(request))
}

export function POST(request: Request) {
  return withServiceDbContext(() => handler(request))
}
