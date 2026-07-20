# Oppgave 1 readiness

## READY

Oppgave 0 verification is **COMPLETE** (2026-07-20 evening
refresh). The repository is ready for Oppgave 1 implementation
once the dispatch design decision below is approved. Oppgave 1
itself is **not** started in this docs pass.

Narrow first code change (when approved): remove the global
provider registry drain from request-path acceptance and preserve
cron dispatch, or replace it with transaction-scoped attempt-ID
dispatch. Retain the existing canonical model, atomic store and
generic provider workers.

## Verification status vs implementation decisions

### Verification blockers (resolved or no longer blocking Oppgave 1)

1. ~~Read-only GTM Admin access~~ **Resolved:** project
   `gtm-mcp` + SA inventory; server `GTM-M8GT97CV` version 29.
2. ~~Read-only Meta Events Manager / numeric EMQ~~ **EMQ
   resolved** (Purchase 9.3; upper-funnel 6.1). Meta dedupe
   remains **not proven** (DEV-020) — tracked separately; does
   not block Oppgave 1 dispatch isolation.
3. ~~Shopify Admin access~~ **Resolved:** app-scoped
   subscriptions **empty**. Open question: webhook route delivery
   source (DEV-008) — documentation/ops, not a code blocker for
   cron-only dispatch.
4. ~~Microsoft live conversion goals + UET CAPI purchase~~
   **Resolved:** Ads audit green; purchase journey 2026-07-20
   order `#6ULWCDZT5` → `microsoft_uet` `accepted_unverified`
   (artifact
   `.agent-artifacts/analytics/microsoft-uet-capi-purchase-journey-2026-07-20.json`).

### Implementation decisions (required before / during Oppgave 1)

1. Choose **cron-only** vs **targeted immediate** dispatch by
   attempts created in the acceptance transaction.
2. Agree provider-specific status names before migrating existing
   statuses.
3. Database index changes require explicit schema-mutation
   approval and a deployment plan.
4. Locate/reconcile `AW-18180376403` with Google Ads
   conversion-exclusion policy before any Google-side change
   (DEV-017).
5. Resolve `meta-purchase-replay` dedupe risk on branch
   `fix/meta-fbc-durable-click-ids` before that branch merges
   (DEV-018).

## Missing data (non-blocking for Oppgave 1 start)

- Microsoft `pageLoadId` browser-server dedupe for non-purchase /
  full funnel.
- Meta Deduplication Overlap for `event_id` after ViewContent
  remediation (DEV-020).
- Delivery source (if any) for the Shopify webhook routes.
- Proven reason for the 47-row dead-letter count reduction.
- Where `AW-18180376403` is configured and which conversion
  actions it carries.

## Recommended first code change

Stop passing `runRegisteredProviderOutboxBatch` into every
browser route and Shopify webhook after-task. Prefer **cron-only
dispatch first** because it is the smallest deterministic
behavior change and the five-minute cron is verified healthy. If
sub-five-minute delivery is a hard requirement, extend the
acceptance result to return the exact created attempt IDs and
dispatch only those IDs.

Do not:

- build a second outbox;
- create a database RPC merely to obtain atomicity;
- split generic persistence into event-specific stores;
- replay historical rows;
- change destination IDs in the same release.

## Expected files

- `src/lib/analytics/server/createBrowserEventRouteHandler.ts`
- the shared browser-route factory/wiring used by
  `src/app/api/events/*`
- `src/lib/analytics/server/handleShopifyOrdersPaidWebhook.ts`
- `src/lib/analytics/server/handleShopifyRefundsCreateWebhook.ts`
- focused route/webhook tests
- possibly `canonicalEventStore` result types only if targeted
  attempt IDs are selected

Avoid editing all event route files independently; centralize the
behavior change.

## Required tests

1. Successful acceptance does not invoke unrelated provider
   workers.
2. Duplicate acceptance creates no attempt and schedules no
   targeted work.
3. Cron still drains every registered worker with the configured
   per-worker batch.
4. Purchase/refund webhook acceptance preserves deterministic
   idempotency.
5. Transaction rollback still covers ledger plus all attempts.
6. Targeted mode, if chosen, cannot claim a different event's
   attempt.
7. Retry/reclaim/dead-letter behavior is unchanged.
8. Provider registry contract remains complete.

Required gates:

```bash
pnpm install --frozen-lockfile
pnpm exec next typegen
pnpm exec tsc --noEmit
pnpm build
npm run mcp:build
npm run mcp:doctor
npm run tracking:gateway:smoke
```

Use the verified targeted `pnpm exec tsx --test <test files>`
invocation rather than an unsupported all-file Node runner.

## Rollback prerequisites

- Record pre-change attempt latency/backlog and five-minute cron
  success.
- Keep schema unchanged for the first release.
- Make the behavior switch in one shared function so rollback is
  one commit.
- Do not combine with GTM publish, env changes, provider
  activation or replay.
- Confirm cron authorization and production schedule before
  deployment.
- Follow `DEPLOYMENT.md`; production deploy requires explicit
  approval.

## Decision sequence

1. Approve cron-only versus targeted immediate dispatch.
2. Implement and test only dispatch isolation.
3. Verify production queue latency and no backlog.
4. Define provider-specific finality (separate from dispatch
   isolation).
5. Propose, benchmark and separately approve indexes.
6. Address historical naming/data without blind replay.
7. Continue Meta dedupe (DEV-020) and Shopify webhook delivery
   (DEV-008) as separate tracks.
