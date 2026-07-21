# CanonicalEvent Current Handoff

**Handoff-versjon:** 1.17.0 **Oppdatert:**
2026-07-21T23:55:14+02:00 **Gyldighet:** Verifiser Git-,
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
