# AGENTS.md — Codex Review & Execution Rules (ElevateOS Demo)

This repo is a multi-tenant SaaS demo with strict RBAC, org isolation, and an integrated AI Integrity module.
When reviewing PRs, prioritize correctness and invariants over polish.

## Non-negotiable blockers (must request changes)
1) Tenant isolation
- Any Prisma query touching tenant data MUST scope by `orgId`.
- Any API route that reads/writes tenant data MUST derive `orgId` from session and enforce it server-side.
- No client-provided `orgId` is trusted unless it is cross-checked against session/org membership.

2) RBAC
- Every API route MUST enforce roles (owner/admin/tutor/parent/student) with explicit guards.
- UI gating does not replace server enforcement.
- Parents must only access their own child’s data. Tutors must only access assigned classes/students.

3) Funnel A “end-to-end” integrity
- No PR may introduce new surface area (new pages/routes/modules) if earlier Funnel A steps remain partially wired.
- Any “Done” claim must be validated by click-path acceptance steps (see below).

4) AI Integrity module correctness
- Pipeline must persist: upload metadata, extraction output, segments, scores/labels, exports, linkage to student profile.
- Jobs must be idempotent: re-running the same upload does not duplicate segments/reports/artifacts.
- Segment highlights must reflect stored detection results (no “computed only in UI” without persistence).

5) No placeholders shipped
- Block PRs that include `TODO`, `FIXME`, `placeholder`, `lorem`, stub UIs, or hardcoded demo-only bypasses in production paths.
- Demo mode is allowed only behind explicit flags and must not weaken RBAC or tenant scoping.

## Required PR structure
Each PR description must include:
- Scope: which task-board item(s) are being completed
- Acceptance steps: exact click path to validate
- Data impact: schema changes, migrations, seed changes
- Risk & rollback: how to revert safely

## Acceptance tests (reviewer should validate conceptually; author should run locally)
### Funnel A (tutor flow) — minimum click-path
- Login (demo or credentialed)
- Navigate to Funnel A entry point
- Create/assign at least one artifact (worksheet/test/mock or equivalent per task board)
- Verify artifact appears in Library and is linked to class/student
- Verify org isolation: same action in another org does not see data (if multi-org demo exists)
- Verify RBAC: student/parent cannot access tutor-only actions/endpoints

### AI Integrity — minimum click-path
- Open “AI Integrity Check” from sidebar
- Upload PDF/DOCX/TXT
- Confirm extraction succeeded (visible text)
- Confirm segmentation (~150–250 words or paragraph-based)
- Confirm scoring outputs overall % + per-segment % + label + confidence + rationale
- Confirm highlight UI matches flagged segments
- Export PDF report and DOCX report (non-empty, correct headings, includes disclaimer)
- Confirm persistence: report listed under Student Profile → Integrity Reports, and files exist on storage path

## Security & data handling
- Do not log raw student submissions in server logs.
- Do not expose sensitive tokens/keys to client.
- Ensure `.env` and secrets remain ignored and not committed.

## Performance & reliability expectations (demo-appropriate)
- Any worker/queue logic should handle restarts safely.
- File uploads must have size/type checks.
- Background jobs should have status transitions (pending/running/complete/failed) and retry limits.

## Code quality expectations (review focus)
- Prefer small, composable functions and shared utilities over duplicated logic.
- Avoid magic constants: extract to config/constants.
- Ensure consistent error responses and validation (e.g., zod schemas for inputs where applicable).
- Add minimal tests when introducing exports, workers, or tenant/RBAC enforcement paths.

## What “approve” means
Approve only if:
- RBAC + org scoping are correct
- The PR completes a stitched end-to-end increment (not a partial UI slice)
- No placeholders were introduced
- Export and persistence paths are credible and testable

If in doubt, request changes with a specific invariant violation.
