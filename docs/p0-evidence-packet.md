# P0 Evidence Packet

Generated: 2026-03-17 (Asia/Tokyo)

## Scope

- Cross-user mutation protection for high-risk write routes
- Write audit logs (`actorUserId`, `resourceType`, `resourceId`, `action`, `result`)
- Stripe webhook idempotency + persisted processing status
- Stripe reconciliation route + profile-load refresh
- AI timeout/circuit protection and provider error classification

## Acceptance checks run

1. `npm run test:ci -- tests/p0-routes.spec.ts`
- Result: PASS
- Log file: `docs/p0-test-command.log`
- Verifies:
  - exploit attempts for cross-user `PATCH/DELETE` mutations return `404`
  - route handlers query by `id + userId`
  - Stripe webhook replay short-circuits duplicate processing
  - chat route returns classified `429 RATE_LIMIT` with mocked OpenAI failure

2. `node --experimental-strip-types scripts/p0-tests.ts`
- Result: PASS
- Log file: `docs/p0-script-test-command.log`
- Verifies:
  - ownership guard patterns in patched mutation routes
  - persisted Stripe webhook status transitions
  - AI timeout classification and circuit-open behavior

3. Endpoint verification scan:
- Command log: `docs/p0-endpoint-scan.log`
- Confirms `updateMany/deleteMany/writeAuditLog` placement in patched routes.

## Patched endpoints inventory

See: `docs/patched-endpoints-manifest.md`

## Command log excerpts

### `npm run test:ci -- tests/p0-routes.spec.ts`

```text
✓ tests/p0-routes.spec.ts (6 tests)
Test Files 1 passed (1)
Tests 6 passed (6)
```

### `node --experimental-strip-types scripts/p0-tests.ts`

```text
P0 tests passed
metric ai_provider failure TIMEOUT
metric ai_provider circuit_opened
```

## Screenshots

- No GUI/browser screenshot was required to validate these P0 controls.
- Evidence is command-output based and stored in the log files above.
