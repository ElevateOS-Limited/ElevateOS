# ElevateOS

ElevateOS is the merged Next.js codebase behind `elevateos.org` and `tutoring.elevateos.org`.

It focuses on:
- student study planning and practice
- tutoring and parent visibility
- admissions and internships workflows
- progress tracking, dashboards, and shared execution

## Related projects

- Think College Level: portfolio and writing hub
  - https://thinkcollegelevel.com

## Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- NextAuth
- Stripe
- OpenAI / Anthropic integrations

## Local setup

1. Copy `.env.example` to `.env` and fill in the required values.
2. Install dependencies: `npm install`
3. Generate Prisma client: `npm run db:generate`
4. Sync schema to your database: `npm run db:push`
5. Start development: `npm run dev`

Minimum required environment variables:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `OPENAI_API_KEY`

## Demo mode

Set `DEMO_MODE=true` and `NEXT_PUBLIC_DEMO_MODE=true` to boot the app without a live login. The app will sign into the demo account defined by `DEMO_USER_EMAIL` and `DEMO_USER_PASSWORD`.

## Deployment notes

The app supports pluggable AI providers and environment-specific deployment settings. See `SETUP.md` and `docs/digitalocean-app-platform.md` for the host-specific details.

## Verification

- `npm run lint`
- `npm run typecheck`
- `npm run test:ci`
- `npm run build`

## Runtime

- `npm run start` respects `PORT` and binds on `0.0.0.0`
- Health endpoints:
  - `/healthz`
  - `/api/health`

See `SETUP.md` for the complete environment and deployment checklist.
