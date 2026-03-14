# USER.md - About Your Human

_Learn about the person you're helping. Update this as you go._

- **Name:** Chak Hang (Howard) Chan
- **What to call them:** Howard
- **Pronouns:** _(optional)_
- **Timezone:** Asia/Hong_Kong
- **Notes:**
  - Every new Howard operating instruction must be patched into `.md` immediately in the same cycle.
  - When Howard says “don’t draft, just execute,” execute immediately and report artifacts only.
  - The sole rationale of the 30-minute cron is to ensure actual work output, not reminder chatter; each cycle must produce real execution artifacts.
  - Do not relay cron reminder text back to chat as the primary output; post execution artifacts/status instead.
  - Backend execution runs in continuous auto-transit (no waiting between approved parts).
  - Send 30-minute evidence packets in Technical Stuff with exact appdemo backend deltas (file + behavior).
  - It is unacceptable to have no new backend code change in an active 30-minute backend window; ship a backend delta or a same-window unblock patch with evidence.
  - Keep backend work durable/portable across infra choices (external DB patterns, Fly.io, etc.) unless explicitly asked for platform-specific coupling.
  - Demonstrate frontend changes with a link every 6 hours, and store each demo update in a `.md` file.
  - Git hygiene preference: conventional commits with smallest truthful scope (`<type>(<area>): <specific outcome>`), no overclaiming.
  - PR hygiene preference: truthful/narrow PRs with required sections (lanes, scope, acceptance checks PASS/FAIL, rollback, migration when needed), and explicit auth/RBAC/session-ownership notes when touching auth/data routes.
  - Codex Custom Instructions baseline is stored at `CODEX_CUSTOM_INSTRUCTIONS.md`; keep local Codex settings aligned to this version.
  - Frontend demo evidence must use live app route URLs (e.g., `https://appdemo.thinkcollegelevel.com/dashboard/...`), not PR/commit/blob links.
  - For contingency/legal-sensitive materials: keep preparation private, do not proactively disclose, and only share on explicit Howard instruction.
  - Howard confirms he owns core infra assets (domain, DNS, GitHub org/repo, cloud, DB, email, payments, app stores, analytics); when asked, prepare full contingency material packs immediately.
  - When Howard approves a protection baseline prompt, impose it operationally across VPS project files with non-destructive controls and artifact evidence.
  - When Howard says to enforce protections into the VPS repo, apply them as repository-tracked artifacts/scripts (not only runtime outputs).

## Context

- Primary ops context: Technical Stuff WhatsApp group.
- Prefers direct, artifact-first reporting.
- Strategic reminder preference: business is business; life is life; do not mix friendship with equity/governance decisions.

---

The more you know, the better you can help. But remember — you're learning about a person, not building a dossier. Respect the difference.
