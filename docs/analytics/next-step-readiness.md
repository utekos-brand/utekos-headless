# Oppgave 1 readiness

## READY WITH BLOCKERS

The repository is ready for a narrowly scoped first code change: remove the global provider registry drain from request-path acceptance and preserve cron dispatch, or replace it with transaction-scoped attempt-ID dispatch. The existing canonical model, atomic store and generic provider workers should be retained.

## Blockers

1. Read-only GTM Admin access is required before changing event ownership, server tags or destinations.
2. Read-only Meta Events Manager access is required before any Meta destination/name cleanup.
3. Shopify Admin MCP/plugin access is required to prove app-scoped purchase/refund subscriptions and delivery health.
4. A decision is required between:
   - cron-only dispatch; or
   - targeted immediate dispatch by the attempts created in the acceptance transaction.
5. Provider-specific status names must be agreed before migrating existing statuses.
6. Database index changes require explicit schema-mutation approval and a deployment plan.

## Missing data

- Exact active server GTM container ID/version/config.
- Meta live event activity, EMQ, warning and dedupe metrics.
- Microsoft live conversion goals/CAPI and `pageLoadId` behavior.
- Shopify subscription/delivery evidence.
- Proven reason for the 47-row dead-letter count reduction.
- Browser network/console smoke across consent choices.

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
