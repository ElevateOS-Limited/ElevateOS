# ElevateOS Codex Guide

## Mission
Build and refine the ElevateOS MVP for `elevateos.org`.

Prioritize a narrow tutoring-operations product:
- tutor and parent backend workflows
- student records and academic context
- session logging
- homework, notes, and progress capture
- simple summaries and small-business admin flows

Do not optimize for enterprise abstractions, speculative scale, or broad platform redesigns.

## Source Of Truth
- The repository is the source of truth. Existing behavior beats assumptions.
- If this file and the code disagree, inspect the code first.
- Canonical repo/base: `ElevateOS-Limited/elevateos` on `main`.

## Execution Model
- Default executor for reversible local repo work: Codex local.
- Route production runtime, deploy verification, and long-running gateway tasks to Arby unless `TAKEOVER` is explicitly requested.
- State the active executor and current step at each meaningful action.
- Avoid parallel collisions on the same files or services.
- Deliver artifacts first: code, tests, logs, SHAs, runbooks, PRs.
- Use the smallest safe reversible change first.
- Do not repeat the same failed path more than 2 times. After 2 failures, emit:
  - `state`
  - `blocked_by`
  - `options`
  - `recommend`
  - `next_command`
- Never run destructive or high-blast-radius operations without explicit approval.

## Product Scope
- Preserve working auth, demo mode, and ownership boundaries.
- Keep current MVP interpretation narrow: tutors, parents, students or tutees, sessions, progress, notes, homework, summaries, resources.
- Treat admissions, internships, and other starter-kit flows as legacy surface area unless the task clearly targets them.
- Down-scope generic starter behavior gradually. Do not delete broad areas blindly.
- Replace generic branding or hype copy incrementally where it improves trust, but do not relabel unfinished features as if they already serve tutoring operations.

## Non-Negotiables

### Identity And Auth
- Never trust client-supplied `userId`, `orgId`, role, or ownership fields.
- Derive identity on the server.
- Prefer existing helpers, especially `getSessionOrDemo()`.
- Preserve NextAuth behavior unless fixing a real bug.
- Keep demo mode working in `src/lib/auth/demo.ts` and `src/lib/demo-ai.ts`.

### Data Ownership
- Scope every read, write, update, and delete to the current authenticated or demo user.
- Default to deny when ownership is ambiguous.
- Flag any possible cross-user or cross-org leak immediately.
- Be careful with `findUnique` when ownership is not part of the unique key.
- Prefer `updateMany` or `deleteMany` when ownership must be enforced inside the mutation query.

### Change Size And Reliability
- Make the smallest useful change.
- Reuse repository patterns before inventing new abstractions.
- Preserve working routes, demo behavior, and deployment simplicity.
- Keep migrations incremental and reversible.
- Never claim success without code inspection or command evidence.

### UX And Copy
- Reuse existing Next.js and Tailwind patterns.
- Keep forms explicit and low-ceremony.
- Prefer honest, specific tutoring language over generic starter-kit copy.
- Avoid inflated claims such as enterprise, autonomous, or AI-powered everything.

## Stack And Deployment
- Next.js App Router
- TypeScript
- Tailwind
- Prisma plus PostgreSQL
- NextAuth
- DigitalOcean App Platform with managed Postgres

Write code that fits this environment:
- no local disk persistence assumptions
- no hidden server-global state for product data
- env-var based configuration
- production-safe Prisma usage
- graceful handling of missing optional integrations

## Work Loop
For any non-trivial task:
1. Inspect the relevant files first.
2. Summarize the issue in 3 to 6 bullets.
3. Propose the smallest reversible plan.
4. Implement directly.
5. Run the narrowest useful verification.
6. Report changed files, behavior delta, commands run with `PASS` or `FAIL`, remaining risk, and the next smallest follow-up.

Additional rules:
- Use plans for multi-step work and update the plan after progress.
- Ask at most one blocking question when a reasonable assumption would be risky; otherwise proceed.
- Prefer `rg` and `rg --files` for search.

## Verification
- Always report exact commands run and `PASS` or `FAIL`.
- Treat `npm run build` as the primary finalization gate when runnable.
- Run `npm run db:generate` after Prisma schema edits.
- Only claim lint, tests, or typecheck if they were actually run.
- If a check is blocked, say why.

## Hotspots To Inspect First
- `src/lib/auth/session.ts`
- `src/lib/auth/options.ts`
- `src/lib/auth/demo.ts`
- `src/lib/demo-ai.ts`
- `src/lib/prisma.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/profile/route.ts`
- `src/app/api/progress/route.ts`
- `src/app/api/notes/route.ts`
- `src/app/api/worksheets/route.ts`
- `src/app/api/study/route.ts`
- `src/app/api/study/share/route.ts`
- `src/app/api/sidebar-preferences/route.ts`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/settings/page.tsx`
- `src/app/auth/signup/page.tsx`
- `src/app/layout.tsx`
- `prisma/schema.prisma` when present

When changing a route or page, inspect adjacent helpers and schema before editing.

## Evidence And Memory
- Target one net-new artifact every 30 minutes on active work.
- Active backend evidence packets should include:
  - commit SHA or SHAs
  - backend files and behavior delta
  - frontend files and UX delta
  - exact verification commands with `PASS` or `FAIL`
  - blockers
  - next 30 to 60 minute action
- Canonical memory files:
  - `HEARTBEAT.md`
  - `PROGRESS_LOG.md`
  - `POSTMORTEM.md`
  - `USER.md`
  - `docs/memory-state.json`
- Memory sync sequence:
  1. VPS updates heartbeat and progress.
  2. VPS runs `pwsh -NoProfile -File .\\scripts\\memory-sync.ps1 -Mode export`.
  3. VPS commits and pushes memory artifacts.
  4. Local work responds from the latest `docs/memory-state.json`.

## Definition Of Done
A task is done only when:
- the code or docs change is implemented
- auth and ownership boundaries still hold
- demo mode still works or the impact is explicitly stated
- touched flows are verified as much as practical
- the result is small enough to review and roll back cleanly
