# CanonicalEvent Current Handoff

**Handoff-versjon:** 1.18.0 **Oppdatert:**
2026-07-22T00:39:06+02:00 **Gyldighet:** Verifiser Git-,
deployment- og livefakta før enhver handling

## 1. Les først

1. `AGENTS.md`
2. `FLOW.md`, `DEPLOYMENT.md`, `PLAN.md`
3. `docs/analytics/program-charter.md`
4. `docs/analytics/roadmap.md`
5. dette dokumentet
6. den konkrete autoritative task-filen

## 2. Git- og produksjonsstatus

- `origin/main`: `0a800b1ae169eab8af12c21b3595fe99a667d54c`
- ACCEPTED CE-2.3C runtime:
  `fde892700b9090a9db9b42ff19d3655444c7b60e`
- ACCEPTED signal-contract runtime:
  `85b552a95d063e227232861bb226658ec653d960`
- tip: se `git rev-parse HEAD` after this status commit
- lokale commits **ikke pushet**
- produksjonsdeploy: `dpl_ETtmNLjSG4vjUSj1owVEUmhScEw1` READY

## 3. CE-2.2B / DEC-012 — ACCEPTED

```text
Purchase:
SHOP_ADMIN_NOTIFICATION_WEBHOOK_PLUS_RECONCILIATION

Refund:
SHOP_ADMIN_NOTIFICATION_WEBHOOK_PLUS_RECONCILIATION

DEC-012: APPROVED (ACCEPTED 2026-07-21)
Commit: b445e9f8c
Verifier: APPROVE
```

Authoritative live sources are Shopify Admin notification
webhooks signed with existing `SHOPIFY_WEBHOOK_SECRET`.

## 4. CE-2.3A / CE-2.3A-F1 — ACCEPTED

```text
CE-2.3A-F1: ACCEPTED
Conclusion: REFUND_2026_04_COMPATIBILITY_FIXED
Accepted runtime SHA: 59c130c2e
STOP_REFUND_2026_04_PAYLOAD_INCOMPATIBLE: CLOSED
STOP_ACTIVE_DOUBLE_COUNT_RISK: fortsatt ACTIVE
```

## 5. CE-2.3B — ACCEPTED

```text
CE-2.3B: ACCEPTED
Conclusion: READY_FOR_CE_2_3C
Evidence: docs/analytics/evidence/ce-2.3b-shopify-commerce-reconciliation-design.md
Evidence commit: 3071e57320b084800764f4529f225233abf354df
Verifier: APPROVE
Owner: ACCEPTED
STOP_ACTIVE_DOUBLE_COUNT_RISK: fortsatt ACTIVE
```

## 6. CE-2.3C — ACCEPTED

```text
CE-2.3C: ACCEPTED
Conclusion: SHOPIFY_COMMERCE_RECONCILIATION_IMPLEMENTED
Accepted runtime SHA: fde892700b9090a9db9b42ff19d3655444c7b60e
Fresh verifier: APPROVE

STOP_ACTIVE_DOUBLE_COUNT_RISK: ACTIVE
Vercel cron schedule: DISABLED
Initial 24h production run: NOT AUTHORIZED
Push/deploy: NOT AUTHORIZED
```

Den repository-wide TypeScript-/buildblokkeringen er en urelatert
signal-contract-baseline utenfor CE-2.3C-allowlisten. Den
blokkerer release readiness, men ikke CE-2.3C-aksepten.

## 7. Prior decisions

- CE-2.2 ACCEPTED (app-specific) — superseded for implementation
- CE-2.2A / DEC-011 — `SUPERSEDED_BY_DEC-012`
- Mode A toml: `NOT_APPLICABLE`
- Mode B GraphQL create: `FORBIDDEN` for these topics

## 8. Interlocks / blockers (still active)

```text
STOP_ACTIVE_DOUBLE_COUNT_RISK
SAFE-001 / DEV-018
SAFE-002
SAFE-003
```

Closed:

```text
STOP_REFUND_2026_04_PAYLOAD_INCOMPATIBLE
STOP_CONCURRENT_RUNTIME_OWNERSHIP
```

## 9. Rekkefølge

```text
CE-2.2B / DEC-012 ACCEPTED ✓
CE-2.3A ACCEPTED_WITH_PAYLOAD_BLOCKER ✓
CE-2.3A-F1 ACCEPTED ✓
CE-2.3B ACCEPTED ✓
CE-2.3C ACCEPTED ✓
Signal-contract integration ACCEPTED ✓
Meta click-ID compatibility ACCEPTED ✓
this docs-only stop commit
→ CE-2.4P1 source evidence — AUTHORIZED; runtime not started
→ fresh verifier + owner acceptance
→ CE-2.4 Purchase cutover — STOPPED
→ release approval + production proof
→ CE-3.3R itemless refund remediation — AUTHORIZED; sequenced
→ fresh verifier + owner acceptance
→ CE-2.5 Refund cutover — STOPPED
```

En kombinert CE-2.4/CE-2.5-runtimepakke er forbudt. CE-2.4P1
starter først i en ny clean worktree fra full SHA for denne
docs-only governance-committen. CE-3.3R følger standardsekvensen
over med mindre en eksplisitt null-overlap-gate godkjennes.

## 10. Ingen autorisasjon uten ny startordre

- push/deploy
- Shopify Admin mutation
- GraphQL webhookSubscriptionCreate/Update for these topics
- production 24h reconciliation run
- vercel.json cron schedule for shopify-commerce-reconciliation
- CE-2.3C production invocation
- `*/10` reconciliation schedule

## 11. P0 provider/Purchase incident — INACTIVE

```text
P0 provider/Purchase incident: INACTIVE
Active P0 writer: NONE
Owned paths: NONE
Allowlist overlap with CE-2.4/2.5: NONE
```

## 12. Signal-contract integration — ACCEPTED

```text
Signal-contract integration: ACCEPTED
Accepted runtime SHA: 85b552a95d063e227232861bb226658ec653d960
Fresh verifier: APPROVE

STOP_CONCURRENT_RUNTIME_OWNERSHIP: CLOSED
STOP_ACTIVE_DOUBLE_COUNT_RISK: ACTIVE
```

Release readiness:

```text
RELEASE_READINESS_PENDING_CLEAN_BASELINE_CHECK: SUPERSEDED
CLEAN_BASELINE_PREREQUISITE: COMPLETED at 3b9937f87
CE-2.4P1_START_GATE: AUTHORIZED after this docs-only commit
CE-2.4_START_GATE: STOPPED pending CE-2.4P1 acceptance
CE-2.5_START_GATE: STOPPED pending CE-2.4 proof + CE-3.3R acceptance
```

Repository-wide TypeScript/build må reproduseres fra clean
worktree før den klassifiseres som committed type-break. Den
registreres ikke som feil i signal-contract-allowlisten uten
denne kontrollen.

## 13. Dokumentasjonsstatus

- CE-2.3C er eiergodkjent (fresh verifier `APPROVE`)
- signal-contract-pakken er eiergodkjent (fresh verifier
  `APPROVE`)
- reconciliation er implementert, men ikke produksjonsaktivert
- CE-2.4P1 er neste autoriserte runtimeoppgave
- CE-3.3R er separat autorisert, men sekvensert etter CE-2.4
  release approval og Purchase production proof
- CE-2.4 og CE-2.5 forblir `STOPPED`
- CE-2.4P1 starter fra denne docs-only governance-committen
- dirty `program-charter.md` og `roadmap.md` håndteres separat og
  skal ikke kopieres inn i runtime-worktree-en
- `STOP_ACTIVE_DOUBLE_COUNT_RISK` forblir ACTIVE

## 14. Clean-baseline prerequisite — COMPLETED

```text
META_CLICK_ID_COMPATIBILITY_FIXED: ACCEPTED
Accepted runtime SHA: 3b9937f87f3d40cfcdeda82a0f60f462302260b7
Start SHA: de6ef96141a8ce6b953d049f45daabc2589e4aeb
Fresh reviewer: APPROVE
Push/deploy: NOT AUTHORIZED
```

Exact prerequisite allowlist:

```text
src/lib/analytics/checkoutAttributionSnapshot.ts
src/lib/analytics/enrichCanonicalEventWithMetaAttribution.ts
src/lib/analytics/enrichCanonicalEventWithMetaAttribution.test.ts
```

Verification on Node `24.14.0`:

```text
focused analytics tests: 19/19 PASS
pnpm exec next typegen: PASS
pnpm exec tsc --noEmit: PASS
pnpm build: PASS with existing ignored local env
production tracking:gateway:smoke: PASS
```

Blocked unrelated repository gates:

```text
npm run mcp:build:
  ERR_MODULE_NOT_FOUND scripts/mcp/build-config.ts
npm run mcp:doctor:
  ERR_MODULE_NOT_FOUND scripts/mcp/doctor.ts
```

The package scripts point at files that are absent from the
clean, versioned worktree. Ignored copies from the dirty parent
checkout were not copied into this runtime worktree.

## 15. CE-2.4/CE-2.5 start gate — STOPPED

```text
Conclusion: PREREQUISITES_SPLIT_AND_AUTHORIZED
Combined runtime package: FORBIDDEN
CE-2.4/CE-2.5 runtime edits: NOT STARTED
STOP_ACTIVE_DOUBLE_COUNT_RISK: ACTIVE
```

Fresh read-only production evidence from canonical Supabase
project `hkoawfbomhnzupcsdggb` at 2026-07-21T23:42:35+02:00:

```text
canonical refund rows: 0
purchase transaction_id groups with multiple event_id values: 3
purchase payload sources observed:
  missing: 14
  ops_backfill: 3
  server: 3
  shopify: 45
  webhook: 15
latest webhook purchase occurred_at: 2026-07-21T16:46:12Z
```

Two contract decisions are owner-approved as separate tasks:

1. CE-2.4P1 — provider-neutral commerce source evidence:
   `AUTHORIZED`; runtime not started.
2. CE-3.3R — legitimate itemless Shopify refunds: `AUTHORIZED`;
   sequenced after CE-2.4 production proof.

Required sequence:

```text
this docs-only stop commit
→ CE-2.4P1 source evidence
→ fresh verifier + owner acceptance
→ CE-2.4 Purchase cutover
→ release approval + production proof
→ CE-3.3R itemless refund remediation
→ fresh verifier + owner acceptance
→ CE-2.5 Refund cutover
```

Before CE-2.4P1 runtime edits:

- create a clean worktree from this docs/governance commit;
- freeze an exact, no-glob runtime allowlist in this handoff;
- prove one writer and no overlap with any active task.

CE-3.3R may run in parallel only after an explicit overlap gate
proves zero shared files and each task has its own writer and
worktree. Default execution is sequential.

No CE-2.6 replay/backfill scripts belong in the CE-2.4/CE-2.5
allowlist. Reconciliation scheduling, the first 24-hour run,
backfill, provider mutation, push and deploy remain unauthorized.

## 16. CE-2.4P1 runtime gate — IMPLEMENTED, VERIFICATION PENDING

```text
Task: CE-2.4P1 — provider-neutral commerce source evidence
Start SHA: fdba6fdc7664279f8aa3b6a6ab21134b826b7eab
Branch: codex/ce-2.4p1-source-evidence
Writer: sole writer in this worktree
Writer overlap: NONE
STOP_ACTIVE_DOUBLE_COUNT_RISK: ACTIVE
```

Exact no-glob allowlist frozen before the first runtime write:

```text
docs/analytics/current-handoff.md
docs/analytics/program-state.json
docs/analytics/tasks/CE-2.4P1-persist-canonical-commerce-source-evidence.md
src/lib/shopify/shopifyAdminGraphql.ts
src/lib/analytics/server/canonicalEventSourceEvidence.ts
src/lib/analytics/server/canonicalEventSourceEvidence.test.ts
src/lib/analytics/server/canonicalEventSourceEvidenceMigration.test.ts
src/lib/analytics/server/shopifyCommerceSourceEvidence.ts
src/lib/analytics/server/shopifyCommerceSourceEvidence.test.ts
src/lib/analytics/server/canonicalEventStore.ts
src/lib/analytics/server/createCanonicalEventStore.ts
src/lib/analytics/server/createCanonicalPageViewStore.test.ts
src/lib/analytics/server/canonicalEventDeliveryContract.test.ts
src/lib/analytics/server/postgresCanonicalPageViewStore.ts
src/lib/analytics/server/acceptCanonicalPurchase.ts
src/lib/analytics/server/acceptCanonicalRefund.ts
src/lib/analytics/server/handleShopifyOrdersPaidWebhook.ts
src/lib/analytics/server/handleShopifyOrdersPaidWebhook.test.ts
src/lib/analytics/server/handleShopifyRefundsCreateWebhook.ts
src/lib/analytics/server/handleShopifyRefundsCreateWebhook.test.ts
src/lib/analytics/server/runShopifyCommerceReconciliation.ts
src/lib/analytics/server/runShopifyCommerceReconciliation.test.ts
src/types/supabase/database.types.ts
supabase/migrations/20260722001500_add_canonical_event_source_evidence.sql
supabase/schemas/20_marketing.sql
supabase/schemas/90_rls.sql
```

No path outside this list may change. CE-3.3R, CE-2.4 and CE-2.5
runtime files remain out of scope. Production migration apply,
remote Supabase mutation, reconciliation execution, backfill,
provider mutation, push and deploy remain unauthorized.

Implementation conclusion:

```text
CANONICAL_COMMERCE_SOURCE_EVIDENCE_IMPLEMENTED
Runtime commit: THIS COMMIT — RESOLVE FULL SHA AFTER CREATION
Fresh verifier: PENDING
Owner acceptance: PENDING
CE-2.4: STOPPED
CE-2.5: STOPPED
STOP_ACTIVE_DOUBLE_COUNT_RISK: ACTIVE
```

Verified behavior:

- provider-neutral source evidence is linked to the existing
  ledger by canonical idempotency key;
- new ledger acceptance, source evidence and outbox planning use
  the same Postgres transaction;
- duplicate webhook/reconciliation observations retain one
  canonical event and create no duplicate provider attempts;
- HMAC verification precedes use of Shopify source headers;
- delivery ID, merchant event ID, API version and source
  timestamps are persisted without body, HMAC, secret or PII;
- webhook and reconciliation evidence preserve the same
  deterministic Purchase-/Refund-ID;
- reconciliation has explicit null delivery/event IDs and no
  fabricated metadata;
- no request-path provider dispatch was introduced.

Verification on Node `24.17.0`:

```text
focused CE-2.4P1 tests: 61/61 PASS
analytics + cron: 425/425 PASS
targeted ESLint for hand-authored TypeScript: PASS
next typegen: PASS
tsc --noEmit: PASS
production build: PASS with existing ignored local env
isolated local migration apply: PASS
Supabase marketing schema lint: PASS, no schema errors
production tracking gateway smoke: PASS
```

Known unrelated gate blockers:

```text
mcp:build: scripts/mcp/build-config.ts is absent
mcp:doctor: scripts/mcp/doctor.ts is absent
full local Supabase start: pre-existing 20260712102148 migration
  references absent marketing.customer_source_meta_2025_raw
```

No production migration, remote Supabase mutation, reconciliation
run, schedule, backfill, replay, provider mutation, push or
deploy was performed. Stop after the required commit and one
fresh read-only verifier; do not begin CE-2.4 automatically.

## 17. CE-2.4 Purchase ownership cutover — FRESH VERIFIED, RELEASE APPROVAL PENDING

Section 16 is the immutable CE-2.4P1 implementation snapshot. Its
pending verifier/owner fields were resolved by the later
docs-only acceptance commit:

```text
CE-2.4P1 runtime SHA: ef1facd38816fc106071672a29d5391b336b8999
Fresh verifier: APPROVE
Owner acceptance: ACCEPTED
CE-2.4P1 acceptance/start SHA: 87f56488f9f5c03e60fe182b622c593f23ba8545
```

CE-2.4 start gate:

```text
Task: CE-2.4 — authoritative Purchase owner cutover
Start SHA: 87f56488f9f5c03e60fe182b622c593f23ba8545
Branch: codex/ce-2.4-purchase-owner
Worktree: /Users/kristofferohnstadhjelmeland/utekos-headless/.worktrees/ce-2.4-purchase-owner
Writer: /root — sole writer
Writer overlap: NONE
Baseline tests: 65/65 PASS on Node 24.17.0
Status: FRESH VERIFIED — PENDING RELEASE APPROVAL
STOP_ACTIVE_DOUBLE_COUNT_RISK: ACTIVE
```

Exact no-glob allowlist frozen before the first runtime write:

```text
docs/analytics/current-handoff.md
docs/analytics/program-state.json
docs/analytics/tasks/CE-2.4-cut-over-authoritative-purchase-owner.md
docs/analytics/event-matrix.md
docs/analytics/provider-matrix.md
src/lib/analytics/eventCatalog.ts
src/lib/analytics/eventCatalog.test.ts
src/lib/analytics/server/assertCanonicalPurchaseIdentity.ts
src/lib/analytics/server/getVerifiedShopifyCustomerContext.test.ts
src/lib/analytics/server/normalizeCanonicalPurchase.ts
src/lib/analytics/server/normalizeCanonicalPurchase.test.ts
scripts/ops/backfill-july16-google-data-manager-purchases.ts
scripts/ops/force-resend-meta-purchases-jul19.ts
scripts/ops/purchaseBackfillExecutionDisabled.test.ts
```

The prior CE-2.4P1 writer is closed. Shared governance files are
reused serially; no runtime file overlaps CE-2.4P1, CE-3.3R or an
active provider/Purchase incident.

The first full analytics/cron run exposed one pre-existing
customer-context test fixture whose arbitrary UUID no longer met
the enforced order-derived Purchase identity. Before changing
that fixture, the exact allowlist was amended with only
`src/lib/analytics/server/getVerifiedShopifyCustomerContext.test.ts`.
The file has no runtime behavior, no active writer and no
overlap; the production identity assertion was not weakened.

The implementation may only:

- enforce the order-derived deterministic Purchase identity
  before canonical acceptance;
- record Shopify Admin notification Order payment as the Purchase
  owner and reconciliation as duplicate-safe recovery;
- disable the two historical direct-dispatch/backfill entrypoints
  before cutover;
- add targeted ownership tests and update bounded owner/catalog
  documentation.

Production migration, push/deploy, reconciliation execution,
backfill/replay, provider mutation and closing
`STOP_ACTIVE_DOUBLE_COUNT_RISK` remain unauthorized.

Local implementation evidence:

```text
TDD red: 7 expected failures
TDD green: 19/19 PASS
Expanded Purchase suite: 101/101 PASS
Full analytics/cron suite: 430/430 PASS
Next typegen: PASS
TypeScript: PASS
Production build: PASS
Tracking gateway smoke: PASS (read-only, https://utekos.no)
MCP build/doctor: BLOCKED — package scripts reference absent files that are also absent at Start SHA
Canonical Purchase owner: shopify_admin_notification_order_payment
Reconciliation: duplicate-safe missed-delivery recovery
Alternative order-derived event_id: FAIL CLOSED
Historical provider resend/backfill scripts: DISABLED_FAIL_CLOSED
Provider plan: at most one attempt per provider/idempotency key
Production activation: NOT PERFORMED
Fresh verifier: APPROVE — 99/99 verifier suite PASS
Candidate commit: THIS COMMIT
```
