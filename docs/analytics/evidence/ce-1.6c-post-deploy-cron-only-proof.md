# CE-1.6C — Post-deploy cron-only dispatch proof

```text
Charter-version: 1.0.0
Roadmap: CE-1.6C (CE-1.6 production gate)
Affected invariants: INV-006, INV-007, INV-008, INV-018, INV-019, INV-020
Goal: prove request acceptance, later cron dispatch and provider result without duplicate sending
Non-goals: purchase/refund creation, provider/GTM/schema/env mutation, replay/backfill, fase 2
Primary role: canonical-event-evidence-auditor
Conclusion: PHASE_1_ACCEPTED_WITH_NONBLOCKING_OBSERVATIONS
```

## Governance snapshot

| Field                      | Value                                                                                               |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| Owner authorization        | ACCEPTED CE-1.6B; CE-1.6C started 2026-07-21 with one controlled non-transactional production event |
| Worktree                   | `.worktrees/ce-1.6c-cron-proof`                                                                     |
| Worktree HEAD / Deploy SHA | `0a800b1ae169eab8af12c21b3595fe99a667d54c` (MATCH)                                                  |
| Production deploy ID       | `dpl_ETtmNLjSG4vjUSj1owVEUmhScEw1`                                                                  |
| Production aliases         | `utekos.no`, `www.utekos.no`, `feed.utekos.no`                                                      |
| Rollback SHA               | `ee781aed52474eb6bdecee63e43ffabec9d0cea2`                                                          |
| Audit timezone             | Europe/Oslo (CEST, UTC+2)                                                                           |
| Mutations performed        | one controlled `view_item` acceptance POST; evidence file write/commit only                         |
| Secrets / PII printed      | none                                                                                                |

---

## 1. Controlled event record (pre-action)

**Captured:** 2026-07-21T08:52:57+02:00 (local) /
2026-07-21T06:52:57.000Z (`event_time`)

| Field                     | Value                                                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| event ID                  | `60058a37-571b-4eb2-a59e-418a6d77689b`                                                                                                     |
| event name                | `view_item`                                                                                                                                |
| page URL                  | `https://utekos.no/produkter/utekos-techdown`                                                                                              |
| page_view_id              | `52bec8f6-b894-4b3f-9e7a-704067580dd2`                                                                                                     |
| consent state             | analytics=`granted`, marketing=`granted`, preferences=`denied`, source=`cookiebot`, version=`1`                                            |
| request timestamp (local) | 2026-07-21T08:52:57+02:00                                                                                                                  |
| event_time (UTC)          | 2026-07-21T06:52:57.000Z                                                                                                                   |
| deployment SHA            | `0a800b1ae169eab8af12c21b3595fe99a667d54c`                                                                                                 |
| transport                 | same-origin `POST https://utekos.no/api/events/view-item` with `Origin: https://utekos.no` (collector-equivalent; no purchase/refund/lead) |

No raw PII, provider payloads, or secret values are retained in
this file.

---

## 2. Request acceptance and isolation

### 2.1 HTTP acceptance

**Source/tool:** `curl` →
`https://utekos.no/api/events/view-item`  
**Timestamp:** 2026-07-21T06:52:58Z (response `Date`)

| Check                  | Result                                                                    |
| ---------------------- | ------------------------------------------------------------------------- |
| HTTP status            | **202**                                                                   |
| Body                   | `{"event_id":"60058a37-571b-4eb2-a59e-418a6d77689b","status":"accepted"}` |
| `cache-control`        | `no-store, max-age=0`                                                     |
| `x-vercel-cache`       | `MISS`                                                                    |
| `x-matched-path`       | `/api/events/view-item`                                                   |
| Region (`x-vercel-id`) | `arn1`                                                                    |

### 2.2 Vercel runtime (request path)

**Source/tool:** plugin-vercel `get_runtime_logs`  
**Deployment:** `dpl_ETtmNLjSG4vjUSj1owVEUmhScEw1`  
**Window:** ~06:27Z–06:57Z

| Observation                            | Result                                                               |
| -------------------------------------- | -------------------------------------------------------------------- |
| Controlled request log                 | `06:52:57 POST /api/events/view-item 202` cache=`MISS` on deploy SHA |
| Concurrent outbox task on same request | **none** — only the view-item POST appears at request time           |
| Next outbox cron after acceptance      | `06:55:37 GET /api/cron/provider-outbox-dispatch 200` cache=`BYPASS` |
| Prior cron (before event)              | `06:50:37` — proves event landed between cron slots                  |

### 2.3 Atomic ledger + qualified attempts (immediate post-accept)

**Source/tool:** read-only SQL via local
`SUPABASE_VERCEL_POSTGRES_URL_NON_POOLING` (pink-lens
`hkoawfbomhnzupcsdggb`)  
**Captured:** 2026-07-21T06:53:42Z (`now()`)

| Surface                          | Sanitized result                                                                                                                                                |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `marketing.event_ledger`         | 1 row; `event_id` match; `event_name=view_item`; `created_at=2026-07-21T06:52:58.042Z`; consent analytics+marketing granted                                     |
| `ops.provider_dispatch_attempts` | **2** rows only (`google`, `meta`); both `status=pending`, `attempt_count=0`, `dispatch_mode=server_retry`, `last_attempt_started_at=null`, `processed_at=null` |
| Created timestamps               | ledger + both attempts share `2026-07-21T06:52:58.042Z` (atomic accept)                                                                                         |
| Microsoft row                    | **absent** (catalog `serverOutbox=blocked_no_worker` for `view_item`)                                                                                           |
| Immediate due after accept       | due=`2` (the controlled attempts only)                                                                                                                          |

**Isolation verdict:** acceptance succeeds without invoking
`provider-outbox-after`, purchase/refund outbox, or a registry
batch on the request path. Attempts remain pending until the
later cron.

### 2.4 Static request-path wiring (deployed SHA)

| File                                                               | Dispatch wiring                                                                                                  |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `src/app/api/events/view-item/route.ts`                            | Collect/store only — no `runBatch` / `scheduleAfter` passed                                                      |
| `handleCanonicalViewItemRoute.ts`                                  | Runtime returns only `dependencies.collect(request)`; optional `runBatch`/`scheduleAfter` types are unused stubs |
| `handleCanonicalViewItemRequest.ts` / `acceptCanonicalViewItem.ts` | Persist + plan only; no outbox worker invocation                                                                 |

---

## 3. Cron claim and provider result

### 3.1 Cron invocation

| Field                | Value                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Schedule             | `*/5 * * * *` → `/api/cron/provider-outbox-dispatch`                                         |
| Claiming invocation  | **2026-07-21T06:55:37Z** HTTP 200, `cache=BYPASS`, deploy `dpl_ETtmNLjSG4vjUSj1owVEUmhScEw1` |
| Overlap              | Single start in slot; prior `06:50:37`, next not attributed to this event                    |
| Gap after acceptance | ~2m 39s pending (06:52:58 → 06:55:37)                                                        |

### 3.2 Controlled attempt outcomes (post-cron)

**Captured:** 2026-07-21T06:56:49Z

| provider | attempt id                             | status                | attempt_count | last_attempt_started_at  | processed_at             | latency_ms | has_request_id | response_semantics             |
| -------- | -------------------------------------- | --------------------- | ------------- | ------------------------ | ------------------------ | ---------- | -------------- | ------------------------------ |
| google   | `aab40ce8-b22f-44bd-8edc-5e5732f865f2` | `accepted_unverified` | 1             | 2026-07-21T06:55:37.426Z | 2026-07-21T06:55:41.544Z | 4105       | true           | `provider_accepted_unverified` |
| meta     | `2545489c-4a48-429f-b0ff-754c865eed98` | `accepted_unverified` | 1             | 2026-07-21T06:55:37.539Z | 2026-07-21T06:55:37.845Z | 288        | true           | `provider_accepted_unverified` |

| Duplicate / retention check            | Result                                                      |
| -------------------------------------- | ----------------------------------------------------------- |
| Attempt rows for event_id              | **2** (one per provider)                                    |
| `attempt_count`                        | **1** for both (no retry storm)                             |
| Event ID retained                      | **yes** on both rows                                        |
| Idempotency duplicate groups (global)  | **0**                                                       |
| Stronger terminal `succeeded` claimed? | **no** — Google/Meta recorded as `accepted_unverified` only |

**Cron verdict:** authorized cron claimed the exact pending
attempts and persisted provider request IDs + response semantics
without creating duplicate attempts or duplicate sends for the
controlled event.

---

## 4. Queue health vs CE-1.5 baseline

CE-1.5 baseline captured ~2026-07-21T08:19+02:00 on prior
production `ee781aed…`. CE-1.6C post-proof captured
2026-07-21T06:57:08Z on `0a800b1ae…` /
`dpl_ETtmNLjSG4vjUSj1owVEUmhScEw1`.

| Metric                                   | CE-1.5             | CE-1.6C post-proof    | Explanation                                                              |
| ---------------------------------------- | ------------------ | --------------------- | ------------------------------------------------------------------------ |
| Due pending/retry                        | 0                  | **0**                 | Controlled due rows drained by cron; queue empty again                   |
| Oldest due age                           | n/a                | n/a                   | No due rows                                                              |
| Processing / stale processing            | 0 / 0              | **0 / 0**             | Healthy                                                                  |
| retry_scheduled / dead_lettered attempts | 0 / 0              | **0 / 0**             | Healthy                                                                  |
| Unresolved dead letters                  | 0                  | **0**                 | Unchanged total DL rows 1127, all resolved                               |
| Created last 5m / 15m / 1h               | 0 / 0 / 0          | 2 / 6 / 32            | Live traffic + controlled event; not an isolation failure                |
| Processed last 5m / 15m / 1h             | 0 / 0 / 2          | 7 / 11 / 32           | Cron draining after deploy; includes controlled event                    |
| Google `accepted_unverified`             | 1007               | ~1023                 | Status-reconciliation backlog (companion cron); not dispatch due backlog |
| Attempt latency proxy 24h p50/p95/max    | 1885 / 3050 / 6260 | 1886 / 3049 / 6260    | Stable                                                                   |
| Cron wall-clock duration                 | unavailable        | **still unavailable** | Same tooling limitation as CE-1.5                                        |

**Queue health verdict:** acceptable. Live create/process counts
rose after production traffic resumed on the new deploy;
due/processing/DL remain green. Deltas are explained by the
controlled event plus organic traffic, not by request-path
dispatch regression.

---

## 5. Passive webhook verification

No manufactured order or refund.

### 5.1 Static (deployed SHA)

| Handler                                                | Request-path dispatch                                                                               |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `src/app/api/shopify/webhooks/orders-paid/route.ts`    | Delegates to accept-only handler                                                                    |
| `handleShopifyOrdersPaidWebhook.ts`                    | verify → map → `acceptCanonicalPurchase` only; **no** `runBatch` / `scheduleAfter` / registry batch |
| `src/app/api/shopify/webhooks/refunds-create/route.ts` | Delegates to accept-only handler                                                                    |
| `handleShopifyRefundsCreateWebhook.ts`                 | verify → map → `acceptCanonicalRefund` only; **no** outbox dispatch wiring                          |

### 5.2 Runtime errors

**Source/tool:** plugin-vercel `get_runtime_logs`
level=`error|fatal`  
**Query:** `orders-paid` / `refunds-create`  
**Window:** ~2h ending 2026-07-21T06:57Z

| Route          | New production errors       |
| -------------- | --------------------------- |
| orders-paid    | **none** in filtered window |
| refunds-create | **none** in filtered window |

Authentic future deliveries remain phase-2 event-owner evidence.

---

## 6. Invariant mapping

| Invariant                                 | Evidence                                                                |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| INV-006 (accept without request dispatch) | 202 accept; attempts pending until cron; route collect-only             |
| INV-007 / INV-008 (cron owns drain)       | Cron 06:55:37 claimed both attempts                                     |
| INV-018 (idempotent attempts)             | 2 rows total; unique provider+idempotency; 0 duplicate groups           |
| INV-019 (cron overlap safety)             | Single cron start per observed slot                                     |
| INV-020 (provider result persistence)     | `request_id` present; `response_semantics=provider_accepted_unverified` |

---

## 7. Non-blocking observations

1. Cron invocation wall-clock histograms remain unavailable from
   Vercel MCP / CLI fields (same CE-1.5 limitation).
2. Controlled event used a consented collector-equivalent
   same-origin POST with predetermined `event_id` (not a
   Cookiebot UI click path).
3. `handleCanonicalViewItemRoute` still declares unused optional
   `runBatch`/`scheduleAfter` types; runtime does not call them.
4. Google/Meta terminality is intentionally limited to
   `accepted_unverified` (+ request id); no stronger dashboard
   finality claimed.
5. Microsoft `view_item` server outbox remains catalog-blocked
   (no attempt row) — expected, not a cron failure.
6. plugin-supabase MCP still cannot target pink-lens; SQL used
   local non-pooling URL with project-ref check.

---

## 8. Exact blocked verification

| Surface                                                    | Status                                     |
| ---------------------------------------------------------- | ------------------------------------------ |
| Vercel cron wall-clock p50/p95                             | **blocked** (field absent)                 |
| Cookiebot browser UI consent click path                    | **not used** (collector POST used instead) |
| Authentic Shopify purchase/refund delivery                 | **deferred** to phase 2 (by task)          |
| Provider dashboard UI confirmation beyond warehouse status | **not claimed**                            |

---

## 9. Conclusion

```text
PHASE_1_ACCEPTED_WITH_NONBLOCKING_OBSERVATIONS
```

**Why this enum:** request isolation, later cron claim, provider
receipt/status persistence, no duplicate send, and acceptable
queue health are live-proven on deploy
`dpl_ETtmNLjSG4vjUSj1owVEUmhScEw1` / SHA `0a800b1ae…`. Residual
observations (cron wall-clock tooling gap, unused route type
stubs, collector-equivalent transport, Google status backlog) are
non-blocking and do not justify rollback.

**Why not `ROLLBACK_REQUIRED`:** no request-path dispatch
regression, no duplicate sends, no unresolved dead letters, cron
200s continue.

**Why not `BLOCKED_INSUFFICIENT_EVIDENCE`:** controlled event ID
traced end-to-end through ledger, pending attempts, cron claim,
and provider status.

**Why not plain `PHASE_1_ACCEPTED`:** explicit non-blocking
residuals above remain documented; documentation updates beyond
this evidence file were not required for the proven gate.

---

## 10. Tools and identifiers

| Tool / account                 | Use                                           |
| ------------------------------ | --------------------------------------------- |
| Worktree git                   | HEAD confirm `0a800b1ae…`                     |
| plugin-vercel                  | `get_deployment`, `get_runtime_logs`          |
| Production HTTP                | `POST /api/events/view-item` on `utekos.no`   |
| Pink-lens Postgres (read-only) | ledger + attempt aggregates; no payload dumps |
| Static source at deploy SHA    | view-item + webhook handlers                  |

## 11. Dokumentasjonsstatus

Enough charter/roadmap/handoff/task context, CE-1.5 baseline,
CE-1.6B deploy proof, live Vercel logs, and pink-lens SQL were
available to complete CE-1.6C. Remaining gaps are listed under
blocked verification and do not authorize fase 2.
