# POSTMORTEM

(Entries are appended only when a 60-minute commit window is missed.)

Timestamp: 2026-03-07T09:35:34+09:00
Task: Funnel A cadence stall and automation correction
Failure Cause: Long inactivity gap on active PR with repeated watchdog breaches and no autonomous follow-through
Files Affected: .github/workflows/pr-governance-gate.yml, .github/workflows/funnel-a-watchdog.yml, .github/workflows/funnel-a-autopilot-supervisor.yml, scripts/review-pr.ps1
Fix Strategy: Simplify gate criteria to production-code blockers, add command-triggered reruns, add supervisor loop, and add automatic next-task handoff
Retry Task: Keep single active Funnel A PR moving via implement -> push -> gate -> patch loop until APPROVE, then auto-start next PR

Timestamp: 2026-03-07T11:03:14+09:00
Task: Approved PR stuck in active queue with stale/false status echoes
Failure Cause: PR #7 stayed active after approval due unmergeable/conflicting state, allowing repeated non-progress updates and status drift
Files Affected: .github/workflows/funnel-a-autopilot-supervisor.yml
Fix Strategy: Add claim-mismatch enforcement, log-only breach enforcement, approved-but-unmergeable retirement, and no-active PR auto-assignment/escalation
Retry Task: Require replacement active PR and resume autonomous code patch loop with verifiable commit/gate artifacts only
