import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma, DATABASE_URL_CONFIGURED } from "@/lib/prisma";
import { ensureDemoUser, DEMO_MODE, DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/auth/demo";
import { hydrateSessionUser } from "@/lib/auth/canonical";

const googleClientId = (process.env.GOOGLE_CLIENT_ID || '').trim()
const googleClientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim()

export const GOOGLE_AUTH_CONFIGURED = Boolean(googleClientId && googleClientSecret)

export const authOptions: NextAuthOptions = {
  ...(DATABASE_URL_CONFIGURED ? { adapter: PrismaAdapter(prisma) } : {}),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  providers: [
    ...(GOOGLE_AUTH_CONFIGURED
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        if (DEMO_MODE && credentials.email === DEMO_EMAIL && credentials.password === DEMO_PASSWORD) {
          return ensureDemoUser();
        }

        if (!DATABASE_URL_CONFIGURED) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.plan = (user as any).plan ?? token.plan ?? "FREE";
        token.orgId = (user as any).orgId ?? user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.plan = (token.plan as string) || "FREE";
        session.user.orgId = (token.orgId as string) || session.user.id;
      }
      return (await hydrateSessionUser(session)) ?? session;
    },
  },
};
