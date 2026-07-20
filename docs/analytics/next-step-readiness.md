# Oppgave 1 readiness

## READY WITH BLOCKERS

The repository is ready for a narrowly scoped first code change: remove the global provider registry drain from request-path acceptance and preserve cron dispatch, or replace it with transaction-scoped attempt-ID dispatch. The existing canonical model, atomic store and generic provider workers should be retained.

## Blockers

Updated 2026-07-20:

1. Read-only GTM Admin access is still required before changing event ownership, server tags or destinations. Root cause verified: the Stape GTM MCP OAuth identity has zero GTM accounts; the user must re-authenticate with the Google account that owns `GTM-5TWMJQFP`. The GA4 MCP shares the same identity problem.
2. ~~Read-only Meta Events Manager access~~ **Resolved:** Events Manager evidence obtained via Graph API v23.0 (dataset live, PascalCase-only 7d names, source split, match keys). Numeric EMQ and the paused server-tag question remain open pending blocker 1.
3. ~~Shopify Admin access~~ **Resolved:** app-scoped subscriptions verified **empty** for the app token. New open question: what (if anything) delivers to the webhook routes (DEV-008).
4. A decision is required between:
   - cron-only dispatch; or
   - targeted immediate dispatch by the attempts created in the acceptance transaction.
5. Provider-specific status names must be agreed before migrating existing statuses.
6. Database index changes require explicit schema-mutation approval and a deployment plan.
7. **New:** `AW-18180376403` must be located and reconciled with the Google Ads conversion-exclusion policy before any Google-side change (DEV-017).
8. **New:** the `meta-purchase-replay` dedup risk on branch `fix/meta-fbc-durable-click-ids` must be resolved before that branch merges (DEV-018).

## Missing data

- Exact active server GTM container ID/version/config (pending GTM re-auth).
- Numeric Meta EMQ per event.
- Microsoft live conversion goals/CAPI and `pageLoadId` behavior.
- Delivery source (if any) for the Shopify webhook routes.
- Proven reason for the 47-row dead-letter count reduction.
- Where `AW-18180376403` is configured and which conversion actions it carries.

## Recommended first code change

Stop passing `runRegisteredProviderOutboxBatch` into every browser route and Shopify webhook after-task. Prefer **cron-only dispatch first** because it is the smallest deterministic behavior change and the five-minute cron is verified healthy. If sub-five-minute delivery is a hard requirement, extend the acceptance result to return the exact created attempt IDs and dispatch only those IDs.

Do not:

- build a second outbox;
- create a database RPC merely to obtain atomicity;
- split generic persistence into event-specific stores;
- replay historical rows;
- change destination IDs in the same release.

## Expected files

- `src/lib/analytics/server/createBrowserEventRouteHandler.ts`
- the shared browser-route factory/wiring used by `src/app/api/events/*`
- `src/lib/analytics/server/handleShopifyOrdersPaidWebhook.ts`
- `src/lib/analytics/server/handleShopifyRefundsCreateWebhook.ts`
- focused route/webhook tests
- possibly `canonicalEventStore` result types only if targeted attempt IDs are selected

Avoid editing all event route files independently; centralize the behavior change.

## Required tests

1. Successful acceptance does not invoke unrelated provider workers.
2. Duplicate acceptance creates no attempt and schedules no targeted work.
3. Cron still drains every registered worker with the configured per-worker batch.
4. Purchase/refund webhook acceptance preserves deterministic idempotency.
5. Transaction rollback still covers ledger plus all attempts.
6. Targeted mode, if chosen, cannot claim a different event's attempt.
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

Use the verified targeted `pnpm exec tsx --test <test files>` invocation rather than the unsupported direct all-file Node command recorded in this freeze.

## Rollback prerequisites

- Record pre-change attempt latency/backlog and five-minute cron success.
- Keep schema unchanged for the first release.
- Make the behavior switch in one shared function so rollback is one commit.
- Do not combine with GTM publish, env changes, provider activation or replay.
- Confirm cron authorization and production schedule before deployment.
- Follow `DEPLOYMENT.md`; production deploy requires explicit approval.

## Decision sequence

1. Approve cron-only versus targeted immediate dispatch.
2. Implement and test only dispatch isolation.
3. Verify production queue latency and no backlog.
4. Obtain Meta/GTM/Shopify read-only evidence.
5. Define provider-specific finality.
6. Propose, benchmark and separately approve indexes.
7. Address historical naming/data without blind replay.
