# CE-2.4P1 — Persist canonical commerce source evidence

```text
Charter-version: 1.0.0
Roadmap: CE-2.4 prerequisite
Affected invariants: INV-001, INV-002, INV-003, INV-006, INV-008,
  INV-012, INV-016, INV-017, INV-019, INV-021, INV-022
Goal: persist provider-neutral Shopify source evidence without
  creating a second canonical event, ledger or queue
Non-goals: Purchase cutover, Refund cutover, provider changes,
  production schema apply, reconciliation execution, replay,
  push or deploy
Primary role: canonical-event-implementer
Status: IMPLEMENTED — PENDING FRESH VERIFICATION AND OWNER ACCEPTANCE
Authorized start: fdba6fdc7664279f8aa3b6a6ab21134b826b7eab
Implementation branch: codex/ce-2.4p1-source-evidence
Runtime commit: this commit; resolve and report its full SHA after creation
```

## Owner decision

The project owner authorized CE-2.4P1 on 2026-07-21 as a
standalone prerequisite. It must complete, receive a fresh
verifier verdict and be owner-accepted before CE-2.4 starts.

CE-2.4P1 is not part of a combined CE-2.4/CE-2.5 runtime package.
CE-3.3R is a separate task with a separate writer, worktree and
allowlist unless an explicit overlap gate proves zero shared
files.

## Required contract

The contract must be provider-neutral and event-independent. It
must persist at least:

```text
canonical event_id
source_system
source_method
source_object_type
source_object_id
source_topic
source_delivery_id
source_event_id
source_api_version
source_triggered_at
source_observed_at
```

The implementation must prove all of the following:

- no Meta, Google or Microsoft field enters the contract;
- no raw payload, HMAC, secret or customer PII is stored;
- Shopify header values are not trusted before successful HMAC
  verification;
- source evidence never becomes the canonical event ID or a
  provider event ID;
- webhook and reconciliation for the same Shopify object converge
  on the same deterministic canonical event ID;
- a duplicate webhook delivery can update or correlate durable
  evidence without inserting a second canonical event;
- source evidence and a newly inserted canonical event are
  written atomically;
- the existing canonical ledger and generic provider outbox are
  reused without a parallel event store or queue.

`X-Shopify-Webhook-Id` identifies an individual delivery.
`X-Shopify-Event-Id` correlates deliveries caused by the same
merchant action. Neither changes the order-/refund-derived
canonical identity.

## Local schema and store authorization

Allowed after the exact runtime allowlist is frozen:

```text
one local Supabase migration file
one generic source-evidence store/contract
required generated/local database type update
webhook header extraction after HMAC verification
reconciliation source metadata
targeted tests
```

Not authorized:

```text
apply migration to production
Supabase remote mutation
push or deploy
provider change
reconciliation call or schedule
backfill or replay
```

## Exact allowlist gate

Before the first runtime write, the implementer must perform a
read-only dependency inventory and write an exact, no-glob path
allowlist into `docs/analytics/current-handoff.md`.

The allowlist must include only the transaction boundary, generic
source-evidence contract/store, Shopify webhook and
reconciliation producers, one local migration, required database
types and targeted tests. One writer owns every listed file.

Stop if:

- any path overlaps another active writer;
- the design requires a second ledger, outbox, event-specific
  queue or event-specific store;
- source evidence cannot be committed in the existing canonical
  acceptance transaction;
- unverified headers, PII, raw payloads or secrets would be
  persisted;
- a production or provider mutation would be required.

## TDD and verification

Write failing tests first for at least:

1. verified webhook headers produce the required source fields;
2. invalid HMAC prevents header evidence from being trusted;
3. first canonical acceptance persists event, evidence and
   provider plan atomically;
4. duplicate delivery retains one canonical event and records or
   correlates the source observation;
5. webhook and reconciliation converge on the same canonical
   event ID;
6. source evidence contains no raw payload, HMAC, secret or PII;
7. no direct provider send occurs.

Run targeted store, webhook, reconciliation and canonical
delivery tests, then the repository-required typegen, TypeScript
and build gates. A local migration may be linted, but it must not
be applied remotely.

## Official sources

- Shopify, Verify webhook deliveries:
  <https://shopify.dev/docs/apps/build/webhooks/verify-deliveries>
- Shopify, Webhooks delivery structure:
  <https://shopify.dev/docs/apps/build/webhooks/delivery-structure>

## Commit and stop

Commit only the frozen CE-2.4P1 allowlist:

```bash
git commit -m "feat(analytics): persist commerce source evidence"
```

Then stop for fresh verification and owner acceptance. Do not
start CE-2.4 automatically.

## Implementation result

```text
Conclusion: CANONICAL_COMMERCE_SOURCE_EVIDENCE_IMPLEMENTED
Fresh verifier: PENDING
Owner acceptance: PENDING
CE-2.4: STOPPED
CE-2.5: STOPPED
STOP_ACTIVE_DOUBLE_COUNT_RISK: ACTIVE
```

The implementation:

- adds one provider-neutral sidecar table linked by foreign key
  to the existing canonical ledger idempotency key;
- writes a newly accepted event, its source evidence and provider
  plan inside the existing database transaction;
- records or correlates source evidence when the canonical ledger
  reports a duplicate, without creating new provider attempts;
- extracts the Shopify topic, delivery ID, event ID, API version
  and triggered timestamp only after successful raw-body HMAC
  verification;
- emits explicit `null` delivery/event IDs for reconciliation
  rather than fabricating webhook metadata;
- preserves order-/refund-derived deterministic canonical event
  IDs and keeps provider dispatch cron-owned.

Verification on Node `24.17.0`:

```text
focused CE-2.4P1 tests: 61/61 PASS
analytics + cron tests: 425/425 PASS
targeted ESLint for hand-authored TypeScript: PASS
pnpm exec next typegen: PASS
pnpm exec tsc --noEmit: PASS
pnpm build: PASS with existing ignored local env
Supabase migration apply in isolated local Postgres: PASS
Supabase db lint --schema marketing --fail-on warning: PASS
production tracking:gateway:smoke: PASS
```

The repository-wide MCP gates remain blocked by missing versioned
entrypoints that predate this task:

```text
npm run mcp:build:
  ERR_MODULE_NOT_FOUND scripts/mcp/build-config.ts
npm run mcp:doctor:
  ERR_MODULE_NOT_FOUND scripts/mcp/doctor.ts
```

The full local Supabase stack also stops before the new migration
in the pre-existing migration
`20260712102148_meta_high_value_customer_audience.sql`, because
`marketing.customer_source_meta_2025_raw` is absent. The new
migration was therefore applied and linted independently against
an isolated local Postgres 17 instance. No remote database was
contacted.
