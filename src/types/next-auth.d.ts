import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      plan: string
      orgId?: string | null
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
  interface JWT {
    id: string
    role: string
    plan: string
    orgId?: string
  }
}
