# AGENTS.md — ElevateOS Demo Builder Governance

## Repository Authority
- Canonical GitHub repo: `imjusthoward/elevateos-demo`
- Canonical base branch: `main`
- Builder VPS working path: `/root/.openclaw/workspace/edutech-demo`

## Branch and PR Policy (soft-protection treated as hard)
1. Never develop directly on `main`.
2. Every slice must be implemented on a feature branch.
3. Every completed slice must be pushed and opened as a PR into `main`.
4. PRs must include scope, acceptance tests, rollback note, and board metadata patch note.
5. Merge is reviewer-gated unless explicit override is provided by owner.

## Control Loop Files (must stay truthful)
- `MASTER_TASK_BOARD.md`
- `PROGRESS_LOG.md`
- `HEARTBEAT.md`
- `POSTMORTEM.md`

### Cadence
- Every 30 minutes: heartbeat update.
- Every 60 minutes: commit or postmortem.
- No completion claim unless slice acceptance criteria are end-to-end satisfied.

## Engineering Invariants
1. Tenant-scoped server paths require `orgId` enforcement.
2. Protected writes require server-side RBAC.
3. No placeholder/TODO completion claims in shipped flow.
4. No new surface area before prior slice is stitched.

## Review Blockers (must fail review)
- Missing orgId scoping on tenant paths.
- Missing RBAC guard on protected API writes.
- Control files stale relative to current branch/commit/path.
- PR scope overclaims work not present on branch.
