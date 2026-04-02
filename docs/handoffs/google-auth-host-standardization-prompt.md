# Google Auth And Host Standardization Handoff

Use this handoff with Claude or Antigravity when you have platform access that is not available from local code execution.

## Goal

Standardize ElevateOS across DigitalOcean App Platform and Vercel so both hosts boot the same dashboard, share the same auth assumptions, and support Google sign-in correctly.

## Context

- Repo path: `C:\Users\School\Downloads\Documents\GitHub\elevateos-demo`
- Public DO host: `https://elevateos.org`
- Public Vercel host: `https://elevateos-demo.vercel.app`
- Current code now hides Google sign-in if the provider is not configured, exposes health diagnostics at `/api/health`, and allows a demo dashboard boot on hosts that have `DEMO_MODE=true` but no `DATABASE_URL`.
- Current known mismatch:
  - Vercel previously had no `DATABASE_URL`
  - Vercel Google OAuth envs are not configured
  - Vercel production `NEXTAUTH_URL` should be `https://elevateos-demo.vercel.app`
  - DO runtime is showing a server exception on `elevateos.org` with digest `579361053`
  - Local Vercel deploy verification on March 27, 2026 showed:
    - `/dashboard` now boots on Vercel production
    - `/api/auth/providers` returns `credentials` only
    - `/api/profile`, `/api/study`, `/api/worksheets`, and `/api/sidebar-preferences` now return preview-safe demo payloads
    - `/api/health` still returns `503` because Vercel has no real database configured
  - Vercel CLI env writes for `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` may have introduced trailing whitespace when pulled locally, so verify those values in the Vercel dashboard and re-enter manually if needed.

## Required platform tasks

1. Inspect DO App Platform env vars for the `elevateos` app.
2. Inspect Vercel env vars for the `elevateos-demo` project.
3. Make the env contract match logically across both hosts:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `NEXT_PUBLIC_APP_URL`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - any demo mode flags that are intended to be shared
   - Vertex AI creds on managed hosts:
     - `GOOGLE_GENAI_USE_VERTEXAI=true`
     - `GOOGLE_CLOUD_PROJECT`
     - `GOOGLE_CLOUD_LOCATION`
     - `GOOGLE_APPLICATION_CREDENTIALS_JSON_B64`
4. Set host-specific URL vars:
   - DO: `NEXTAUTH_URL=https://elevateos.org`
   - DO: `NEXT_PUBLIC_APP_URL=https://elevateos.org`
   - Vercel: `NEXTAUTH_URL=https://elevateos-demo.vercel.app`
   - Vercel: `NEXT_PUBLIC_APP_URL=https://elevateos-demo.vercel.app`
5. In Google Cloud Console, ensure the OAuth client includes all required origins and redirect URIs:
   - Authorized JavaScript origins:
     - `https://elevateos.org`
     - `https://elevateos-demo.vercel.app`
   - Authorized redirect URIs:
     - `https://elevateos.org/api/auth/callback/google`
     - `https://elevateos-demo.vercel.app/api/auth/callback/google`
   - Add the DO default app URL callback too if users ever hit that host directly.
6. Pull DO server logs for digest `579361053` and identify the exact failing module or env var.
7. Verify both hosts:
   - `/api/health`
   - `/auth/login`
   - `/dashboard`
   - Google sign-in initiation and callback
8. On Vercel, decide whether to keep the current no-database demo fallback or attach a real hosted Postgres so `/api/health` becomes green and dashboard data persists.

## What local code already changed

- `src/lib/auth/options.ts`: Google provider is now conditional on env presence.
- `src/app/auth/login/page.tsx`: Google button only renders when provider exists.
- `src/app/auth/register/page.tsx`: same behavior.
- `src/app/auth/signup/page.tsx`: same behavior.
- `src/app/api/health/route.ts`: now reports auth/env readiness.
- `src/lib/auth/options.ts`: skips the Prisma adapter when `DATABASE_URL` is absent, so demo mode can still boot on Vercel.
- `src/lib/auth/demo.ts`: falls back to an in-memory demo identity when no database exists.
- `src/app/api/profile/route.ts`: returns demo profile data on no-db demo hosts.
- `src/app/api/study/route.ts`: returns demo study materials and allows no-db preview POST responses.
- `src/app/api/worksheets/route.ts`: returns demo worksheets and allows no-db preview POST responses.
- `src/app/api/chat/route.ts`: returns static chat replies without DB persistence when no database exists.
- `src/app/api/sidebar-preferences/route.ts`: returns and accepts default preferences without DB persistence on demo hosts.
- `src/lib/app-url.ts`: trims host envs and provides a fallback origin.

## Deliver back

Return:

- the exact env diff per host
- the exact DO root cause for digest `579361053`
- whether Google OAuth succeeds on both hosts
- any remaining host-specific mismatch
