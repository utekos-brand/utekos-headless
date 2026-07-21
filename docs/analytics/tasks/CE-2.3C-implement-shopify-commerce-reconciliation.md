# CE-2.3C — Implement bounded Shopify commerce reconciliation

```text
Charter-version: 1.0.0
Roadmap: CE-2.3
Affected invariants: INV-002, INV-003, INV-006, INV-008, INV-010, INV-014, INV-018, INV-019, INV-022
Goal: implement duplicate-safe recovery of missed purchase/refund source events
Non-goals: change event semantics, provider mappings, historical replay, execute production reconciliation, push/deploy
Primary role: canonical-event-implementer
Status: AUTHORIZED
Authorized parent tip: see current-handoff after CE-2.3B acceptance
Evidence contract:
  docs/analytics/evidence/ce-2.3b-shopify-commerce-reconciliation-design.md
  @ 3071e57320b084800764f4529f225233abf354df
```

## Preconditions

- CE-2.3B is independently verified and owner-accepted.
- Its exact file allowlist and GraphQL contract are present.
- CE-2.3A is accepted or `NOT_APPLICABLE`.
- No schema change is required, or a separate approved migration
  task exists.
- Start in a clean worktree at the accepted parent SHA (CE-2.3B
  acceptance status tip).

## Allowed files

The allowlist is exactly the paths recorded under:

```text
CE-2.3B evidence → Final implementation allowlist
```

No other file may change.

If the evidence section is missing, ambiguous or contains globs,
stop.

## TDD sequence

### Red gate 1 — repeated window

Prove that two identical reconciliation runs produce:

```text
first run: accepted
second run: duplicate
```

with the same purchase/refund event IDs and no extra
provider-attempt plan.

### Red gate 2 — overlapping window

Prove that overlapping pages/windows do not create new semantic
events.

### Red gate 3 — mixed order page

One page containing:

```text
paid purchase candidate
already accepted purchase
one new refund
one duplicate refund
non-paid order
```

must return exact summary counts.

### Red gate 4 — lease overlap

Two runners must not process concurrently. The second returns
`lease_blocked` without fetching Shopify data.

### Red gate 5 — partial failure

A page/query/mapping failure must be visible and must not be
reported as a successful full run.

### Red gate 6 — no direct provider dispatch

Reconciliation must call only canonical acceptance. It must not
import or call:

```text
runRegisteredProviderOutboxBatch
provider adapters
provider SDK send functions
direct ledger/attempt inserts
```

## Minimal implementation requirements

- Use the CE-2.3B exact GraphQL query and pagination.
- Use the ADR-approved API version.
- Use the current Shopify Admin authentication helper.
- Use current purchase/refund mappers and acceptors.
- Use deterministic purchase/refund event IDs.
- Use one source-level lease.
- Use overlap window and bounded pagination.
- Return the approved PII-free summary.
- Keep provider delivery cron-owned through the existing outbox.
- Default any manually callable runner to dry-run source
  inspection unless canonical acceptance execution is explicitly
  selected by the route/runner contract.

## Cron route

If CE-2.3B approved a Vercel cron route:

- authenticate with the existing fail-closed cron helper;
- use `GET`;
- set `Cache-Control: no-store`;
- use explicit Node runtime only if current project conventions
  require it;
- export an evidence-backed `maxDuration`;
- return 200 for acquired/completed or lease-blocked;
- return non-2xx for actual reconciliation failure;
- never return secrets or resource payloads.

The cron entry in `vercel.json` must match the approved cadence
and path.

No cron is activated in production in this task.

## Verification

Run exact targeted tests from the CE-2.3B allowlist, then:

```bash
find src/lib/analytics src/app/api/cron \
  -name '*.test.ts' -print0 |
  xargs -0 pnpm exec tsx --test

pnpm exec next typegen
pnpm exec tsc --noEmit
pnpm build
git diff --check
```

Static search:

```bash
rg -n \
  "runRegisteredProviderOutboxBatch|dispatchCanonical|send.*Meta|send.*Google|send.*Microsoft" \
  <CE-2.3B implementation allowlist>
```

Every match must be absent or explicitly proven to be a test
assertion.

## Commit

Stage only the accepted allowlist and commit:

```bash
git commit -m "feat(analytics): add Shopify commerce reconciliation"
```

No push, deploy, Shopify mutation or production reconciliation
run. Stop after fresh verifier and owner acceptance.
