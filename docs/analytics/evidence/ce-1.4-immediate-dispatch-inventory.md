# CE-1.4 — Immediate-dispatch wiring inventory

```text
Charter-version: 1.0.0
Roadmap: CE-1.4A (under CE-1.4)
Affected invariants: INV-007, INV-008, INV-020, INV-021, INV-022
Goal: exact, reviewable inventory of obsolete request-path dispatch wiring
Non-goals: runtime edits, dependency cleanup, provider/database/GTM changes, push/deploy
Primary evidence: canonical-event-evidence-auditor (read-only) at
  .superpowers/sdd/ce-1.4a-audit-findings.md
Coordinator: main agent (this committed allowlisted file only)
Start SHA (verified): f9b3fa3a2f3f88e46782e1e451fd7aa441b99d0f
Timestamp (UTC): 2026-07-21T02:09:56Z
Environment: local repository worktree
Preconditions: CE-1.2 verifier APPROVE; CE-1.3 verifier APPROVE (f9b3fa3a2);
  CE-1.1A/B owner ACCEPTED
Conclusion: READY_WITH_BLOCKERS
```

## Preflight

| Check                   | Result                                                                |
| ----------------------- | --------------------------------------------------------------------- |
| `git rev-parse HEAD`    | `f9b3fa3a2f3f88e46782e1e451fd7aa441b99d0f`                            |
| Expected HEAD           | MATCH                                                                 |
| CE-1.3 verifier APPROVE | `.superpowers/sdd/ce-1.3-verifier-report.md`                          |
| CE-1.2 verifier APPROVE | `.superpowers/sdd/ce-1.2-verifier-report.md`                          |
| Branch                  | `main...origin/main [ahead 4]`                                        |
| Allowed write           | `docs/analytics/evidence/ce-1.4-immediate-dispatch-inventory.md` only |

## Method

Commands run from repo root (exact task allowlist):

```bash
git status --short --branch
git rev-parse HEAD

rg -n \
  "runRegisteredProviderOutboxBatch|scheduleAfter|runBatch|createBrowserEventRouteHandler|from 'next/server'|from \"next/server\"" \
  src/lib/analytics/server \
  src/app/api/events \
  src/app/api/cron/provider-outbox-dispatch \
  scripts/generate-phase2-canonical-events.mjs

rg -n \
  "provider-outbox-after|purchase-outbox-after|refund-outbox-after" \
  src \
  scripts
```

Second search returned **zero matches** for
`provider-outbox-after|purchase-outbox-after|refund-outbox-after`.
Active specialized handlers use event-specific labels
(`page-view-outbox-after`, `view-item-outbox-after`,
`add-to-cart-outbox-after`, `begin-checkout-outbox-after`)
instead.

Definitions/callers inspected: `createBrowserEventRouteHandler`,
`handleShopifyOrdersPaidWebhook`,
`handleShopifyRefundsCreateWebhook`,
`runRegisteredProviderOutboxBatch`, plus all 23
`/api/events/*/route.ts` files and `vercel.json` cron path for
provider-outbox-dispatch.

---

## 1. Inventory table

| ID  | File                                                                 | Line/symbol                                                                 | Classification              | Runtime effect                                                     | Removal task                                          |
| --- | -------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------- |
| A01 | `src/app/api/cron/provider-outbox-dispatch/route.ts`                 | L2–4, L22, L41 `runRegisteredProviderOutboxBatch` / `dependencies.runBatch` | CRON_OWNER_VALID            | Authorized cron drains registered provider workers (`maxItems: 1`) | Keep; CE-1.4G prove sole owner                        |
| A02 | `vercel.json`                                                        | L4 path `/api/cron/provider-outbox-dispatch` schedule `*/5 * * * *`         | CRON_OWNER_VALID            | Schedules cron GET to dispatch route                               | Keep                                                  |
| A03 | `src/lib/analytics/server/runRegisteredProviderOutboxBatch.ts`       | L21 `runRegisteredProviderOutboxBatch`                                      | CRON_OWNER_VALID            | Shared registry batch implementation                               | Keep definition; restrict callers                     |
| A04 | `src/lib/analytics/server/runRegisteredProviderOutboxBatch.test.ts`  | import + invoke                                                             | FALSE_POSITIVE              | Unit test of batch helper                                          | Keep                                                  |
| A05 | `src/lib/analytics/server/createBrowserEventRouteHandler.ts`         | L3–13 required `runBatch`/`scheduleAfter`; body only `collect`              | OBSOLETE_DEPENDENCY_TYPE    | No dispatch; deps required by type only                            | CE-1.4B then CE-1.4E                                  |
| A06 | `src/lib/analytics/server/createBrowserEventRouteHandler.test.ts`    | L23–24, L57–83 spy/assert never called                                      | TEST_SPY_COMPATIBILITY      | Proves factory isolation                                           | CE-1.4B/E update with optional/removed fields         |
| A07 | `src/app/api/events/page-view/route.ts`                              | L2, L6, L35–38 `after` + `runRegisteredProviderOutboxBatch`                 | ACTIVE_RUNTIME_CALL         | Feeds active specialized handler                                   | **NOT CE-1.4C obsolete cleanup** — new isolation task |
| A08 | `src/lib/analytics/server/handleCanonicalPageViewRoute.ts`           | L19–35 `scheduleAfter` + `runBatch`                                         | ACTIVE_RUNTIME_CALL         | Global registry drain on 200/202                                   | New isolation task (INV-007)                          |
| A09 | `src/app/api/events/view-item/route.ts`                              | L2, L6, L35–38                                                              | ACTIVE_RUNTIME_CALL         | Feeds active specialized handler                                   | New isolation task                                    |
| A10 | `src/lib/analytics/server/handleCanonicalViewItemRoute.ts`           | L23–36 `scheduleAfter` + `runBatch`                                         | ACTIVE_RUNTIME_CALL         | Global registry drain on 200/202                                   | New isolation task                                    |
| A11 | `src/app/api/events/add-to-cart/route.ts`                            | L2, L6, L35–38                                                              | ACTIVE_RUNTIME_CALL         | Feeds active specialized handler                                   | New isolation task                                    |
| A12 | `src/lib/analytics/server/handleCanonicalAddToCartRoute.ts`          | L21–34 `scheduleAfter` + `runBatch`                                         | ACTIVE_RUNTIME_CALL         | Global registry drain on 200/202                                   | New isolation task                                    |
| A13 | `src/app/api/events/begin-checkout/route.ts`                         | L2, L6, L35–38                                                              | ACTIVE_RUNTIME_CALL         | Feeds active specialized handler                                   | New isolation task                                    |
| A14 | `src/lib/analytics/server/handleCanonicalBeginCheckoutRoute.ts`      | L21–34 `scheduleAfter` + `runBatch`                                         | ACTIVE_RUNTIME_CALL         | Global registry drain on 200/202                                   | New isolation task                                    |
| A15 | `src/lib/analytics/server/recordAcceptedGenerateLead.ts`             | L3 `after`, L21/L119–122 `runRegisteredProviderOutboxBatch`                 | ACTIVE_RUNTIME_CALL         | Lead acceptance path drains registry via `after()`                 | New isolation task (outside browser factory)          |
| A16 | `src/lib/analytics/server/runViewItemOutboxBatch.ts`                 | L26 default calls `runRegisteredProviderOutboxBatch`                        | FALSE_POSITIVE              | No request-path importer in `src/` (tests only)                    | Optional orphan cleanup; not CE-1.4B–F                |
| A17 | `src/app/api/events/filter-apply/route.ts`                           | L2, L6, L35–38                                                              | OBSOLETE_CONSUMER_WIRING    | Passed to factory; ignored                                         | CE-1.4C                                               |
| A18 | `src/app/api/events/scroll-depth/route.ts`                           | L2, L6, L35–38                                                              | OBSOLETE_CONSUMER_WIRING    | Ignored by factory                                                 | CE-1.4C                                               |
| A19 | `src/app/api/events/search/route.ts`                                 | L2, L6, L35–38                                                              | OBSOLETE_CONSUMER_WIRING    | Ignored by factory                                                 | CE-1.4C                                               |
| A20 | `src/app/api/events/select-item/route.ts`                            | L2, L6, L35–38                                                              | OBSOLETE_CONSUMER_WIRING    | Ignored by factory                                                 | CE-1.4C                                               |
| A21 | `src/app/api/events/select-promotion/route.ts`                       | L2, L6, L35–38                                                              | OBSOLETE_CONSUMER_WIRING    | Ignored by factory                                                 | CE-1.4C                                               |
| A22 | `src/app/api/events/size-guide-view/route.ts`                        | L2, L6, L35–38                                                              | OBSOLETE_CONSUMER_WIRING    | Ignored by factory                                                 | CE-1.4C                                               |
| A23 | `src/app/api/events/sort-apply/route.ts`                             | L2, L6, L35–38                                                              | OBSOLETE_CONSUMER_WIRING    | Ignored by factory                                                 | CE-1.4C                                               |
| A24 | `src/app/api/events/variant-select/route.ts`                         | L2, L6, L35–38                                                              | OBSOLETE_CONSUMER_WIRING    | Ignored by factory                                                 | CE-1.4C                                               |
| A25 | `src/app/api/events/video-progress/route.ts`                         | L2, L6, L35–38                                                              | OBSOLETE_CONSUMER_WIRING    | Ignored by factory                                                 | CE-1.4C                                               |
| A26 | `src/app/api/events/view-item-list/route.ts`                         | L2, L6, L35–38                                                              | OBSOLETE_CONSUMER_WIRING    | Ignored by factory                                                 | CE-1.4C                                               |
| A27 | `src/app/api/events/view-promotion/route.ts`                         | L2, L6, L35–38                                                              | OBSOLETE_CONSUMER_WIRING    | Ignored by factory                                                 | CE-1.4C                                               |
| A28 | `src/app/api/events/view-search-results/route.ts`                    | L2, L6, L35–38                                                              | OBSOLETE_CONSUMER_WIRING    | Ignored by factory                                                 | CE-1.4C                                               |
| A29 | `src/app/api/events/add-to-wishlist/route.ts`                        | L2, L6, L35–38                                                              | OBSOLETE_CONSUMER_WIRING    | Ignored by factory                                                 | CE-1.4D                                               |
| A30 | `src/app/api/events/remove-from-cart/route.ts`                       | L2, L6, L35–38                                                              | OBSOLETE_CONSUMER_WIRING    | Ignored by factory                                                 | CE-1.4D                                               |
| A31 | `src/app/api/events/view-cart/route.ts`                              | L2, L6, L35–38                                                              | OBSOLETE_CONSUMER_WIRING    | Ignored by factory                                                 | CE-1.4D                                               |
| A32 | `src/app/api/events/form-error/route.ts`                             | L2, L6, L35–38                                                              | OBSOLETE_CONSUMER_WIRING    | Ignored by factory                                                 | CE-1.4D                                               |
| A33 | `src/app/api/events/form-start/route.ts`                             | L2, L6, L35–38                                                              | OBSOLETE_CONSUMER_WIRING    | Ignored by factory                                                 | CE-1.4D                                               |
| A34 | `src/app/api/events/form-submit/route.ts`                            | L2, L6, L35–38                                                              | OBSOLETE_CONSUMER_WIRING    | Ignored by factory                                                 | CE-1.4D                                               |
| A35 | `src/app/api/events/generate-lead/route.ts`                          | L2, L6, L35–38                                                              | OBSOLETE_CONSUMER_WIRING    | Route wiring ignored; separate active path A15                     | CE-1.4D (route only)                                  |
| A36 | `src/lib/analytics/server/handleCanonicalFilterApplyRoute.ts`        | `createBrowserEventRouteHandler('filter-apply')`                            | FALSE_POSITIVE              | Thin factory export; no dispatch code                              | No dispatch removal needed                            |
| A37 | `src/lib/analytics/server/handleCanonicalScrollDepthRoute.ts`        | factory wrapper                                                             | FALSE_POSITIVE              | Thin factory export                                                | —                                                     |
| A38 | `src/lib/analytics/server/handleCanonicalSearchRoute.ts`             | factory wrapper                                                             | FALSE_POSITIVE              | Thin factory export                                                | —                                                     |
| A39 | `src/lib/analytics/server/handleCanonicalSelectItemRoute.ts`         | factory wrapper                                                             | FALSE_POSITIVE              | Thin factory export                                                | —                                                     |
| A40 | `src/lib/analytics/server/handleCanonicalSelectPromotionRoute.ts`    | factory wrapper                                                             | FALSE_POSITIVE              | Thin factory export                                                | —                                                     |
| A41 | `src/lib/analytics/server/handleCanonicalSizeGuideViewRoute.ts`      | factory wrapper                                                             | FALSE_POSITIVE              | Thin factory export                                                | —                                                     |
| A42 | `src/lib/analytics/server/handleCanonicalSortApplyRoute.ts`          | factory wrapper                                                             | FALSE_POSITIVE              | Thin factory export                                                | —                                                     |
| A43 | `src/lib/analytics/server/handleCanonicalVariantSelectRoute.ts`      | factory wrapper                                                             | FALSE_POSITIVE              | Thin factory export                                                | —                                                     |
| A44 | `src/lib/analytics/server/handleCanonicalVideoProgressRoute.ts`      | factory wrapper                                                             | FALSE_POSITIVE              | Thin factory export                                                | —                                                     |
| A45 | `src/lib/analytics/server/handleCanonicalViewItemListRoute.ts`       | factory wrapper                                                             | FALSE_POSITIVE              | Thin factory export                                                | —                                                     |
| A46 | `src/lib/analytics/server/handleCanonicalViewPromotionRoute.ts`      | factory wrapper                                                             | FALSE_POSITIVE              | Thin factory export                                                | —                                                     |
| A47 | `src/lib/analytics/server/handleCanonicalViewSearchResultsRoute.ts`  | factory wrapper                                                             | FALSE_POSITIVE              | Thin factory export                                                | —                                                     |
| A48 | `src/lib/analytics/server/handleCanonicalAddToWishlistRoute.ts`      | factory wrapper                                                             | FALSE_POSITIVE              | Thin factory export                                                | —                                                     |
| A49 | `src/lib/analytics/server/handleCanonicalRemoveFromCartRoute.ts`     | factory wrapper                                                             | FALSE_POSITIVE              | Thin factory export                                                | —                                                     |
| A50 | `src/lib/analytics/server/handleCanonicalViewCartRoute.ts`           | factory wrapper                                                             | FALSE_POSITIVE              | Thin factory export                                                | —                                                     |
| A51 | `src/lib/analytics/server/handleCanonicalFormErrorRoute.ts`          | factory wrapper                                                             | FALSE_POSITIVE              | Thin factory export                                                | —                                                     |
| A52 | `src/lib/analytics/server/handleCanonicalFormStartRoute.ts`          | factory wrapper                                                             | FALSE_POSITIVE              | Thin factory export                                                | —                                                     |
| A53 | `src/lib/analytics/server/handleCanonicalFormSubmitRoute.ts`         | factory wrapper                                                             | FALSE_POSITIVE              | Thin factory export                                                | —                                                     |
| A54 | `src/lib/analytics/server/handleCanonicalGenerateLeadRoute.ts`       | factory wrapper                                                             | FALSE_POSITIVE              | Thin factory export                                                | —                                                     |
| A55 | `scripts/generate-phase2-canonical-events.mjs`                       | `generateApiRoute` L903–939                                                 | GENERATOR_TEMPLATE_OBSOLETE | Regenerating routes would reintroduce obsolete wiring              | CE-1.4D generator contract                            |
| A56 | `src/lib/analytics/server/handleShopifyOrdersPaidWebhook.ts`         | L19–20 unused `runBatch?`/`scheduleAfter?`                                  | OBSOLETE_DEPENDENCY_TYPE    | Unused after CE-1.2; not invoked                                   | CE-1.4F                                               |
| A57 | `src/lib/analytics/server/handleShopifyOrdersPaidWebhook.test.ts`    | fixtures/spies for unused deps                                              | TEST_SPY_COMPATIBILITY      | Asserts isolation                                                  | CE-1.4F                                               |
| A58 | `src/lib/analytics/server/handleShopifyRefundsCreateWebhook.ts`      | L18–19 unused `runBatch?`/`scheduleAfter?`                                  | OBSOLETE_DEPENDENCY_TYPE    | Unused after CE-1.3; not invoked                                   | CE-1.4F                                               |
| A59 | `src/lib/analytics/server/handleShopifyRefundsCreateWebhook.test.ts` | fixtures/spies for unused deps                                              | TEST_SPY_COMPATIBILITY      | Asserts isolation                                                  | CE-1.4F                                               |
| A60 | `src/app/api/shopify/webhooks/orders-paid/route.ts`                  | POST → handler only                                                         | FALSE_POSITIVE              | Outside event search path; no dispatch wiring                      | —                                                     |
| A61 | `src/app/api/cron/provider-outbox-dispatch/route.test.ts`            | `runBatch` dependency injection                                             | FALSE_POSITIVE              | Cron unit test                                                     | Keep                                                  |
| A62 | `src/lib/analytics/server/handleCanonicalPageViewRoute.test.ts`      | exercises active schedule                                                   | FALSE_POSITIVE              | Documents **active** behavior, not obsolete wiring                 | Tied to A08 isolation                                 |
| A63 | `src/lib/analytics/server/handleCanonicalViewItemRoute.test.ts`      | exercises active schedule                                                   | FALSE_POSITIVE              | Documents **active** behavior                                      | Tied to A10 isolation                                 |

Factory wrappers A36–A54 pass a log-label string into
`createBrowserEventRouteHandler(_logLabel)`; the label is unused
in the factory body (`OBSOLETE_DEPENDENCY_TYPE` on the factory
parameter — covered by A05 / CE-1.4E). Wrapper files themselves
need no wiring edit for CE-1.4C/D.

---

## 2. Grouped obsolete allowlists (exact files; no globs)

### 2.1 Navigation / content / engagement handlers (CE-1.4C)

Obsolete **route** wiring only (factory-backed; deps ignored at
runtime):

```text
src/app/api/events/filter-apply/route.ts
src/app/api/events/scroll-depth/route.ts
src/app/api/events/search/route.ts
src/app/api/events/select-item/route.ts
src/app/api/events/select-promotion/route.ts
src/app/api/events/size-guide-view/route.ts
src/app/api/events/sort-apply/route.ts
src/app/api/events/variant-select/route.ts
src/app/api/events/video-progress/route.ts
src/app/api/events/view-item-list/route.ts
src/app/api/events/view-promotion/route.ts
src/app/api/events/view-search-results/route.ts
```

**Excluded from this obsolete group (ACTIVE_RUNTIME_CALL — do not
treat as dead wiring):**

```text
src/app/api/events/page-view/route.ts
src/lib/analytics/server/handleCanonicalPageViewRoute.ts
src/lib/analytics/server/handleCanonicalPageViewRoute.test.ts
src/app/api/events/view-item/route.ts
src/lib/analytics/server/handleCanonicalViewItemRoute.ts
src/lib/analytics/server/handleCanonicalViewItemRoute.test.ts
```

### 2.2 Commerce / form / lead handlers (CE-1.4D)

Obsolete **route** wiring only:

```text
src/app/api/events/add-to-wishlist/route.ts
src/app/api/events/remove-from-cart/route.ts
src/app/api/events/view-cart/route.ts
src/app/api/events/form-error/route.ts
src/app/api/events/form-start/route.ts
src/app/api/events/form-submit/route.ts
src/app/api/events/generate-lead/route.ts
scripts/generate-phase2-canonical-events.mjs
```

**Excluded (ACTIVE_RUNTIME_CALL):**

```text
src/app/api/events/add-to-cart/route.ts
src/lib/analytics/server/handleCanonicalAddToCartRoute.ts
src/app/api/events/begin-checkout/route.ts
src/lib/analytics/server/handleCanonicalBeginCheckoutRoute.ts
src/lib/analytics/server/recordAcceptedGenerateLead.ts
```

Note: cleaning `generate-lead/route.ts` does **not** remove A15
(`recordAcceptedGenerateLead`), which is a separate
request/server path that still calls
`runRegisteredProviderOutboxBatch`.

### 2.3 Shared factory and generator (CE-1.4B then CE-1.4E; generator in CE-1.4D)

```text
src/lib/analytics/server/createBrowserEventRouteHandler.ts
src/lib/analytics/server/createBrowserEventRouteHandler.test.ts
scripts/generate-phase2-canonical-events.mjs
```

### 2.4 Shopify webhook dependency-only compatibility (CE-1.4F)

```text
src/lib/analytics/server/handleShopifyOrdersPaidWebhook.ts
src/lib/analytics/server/handleShopifyOrdersPaidWebhook.test.ts
src/lib/analytics/server/handleShopifyRefundsCreateWebhook.ts
src/lib/analytics/server/handleShopifyRefundsCreateWebhook.test.ts
```

---

## 3. Counts

| Metric                             |              Count | Definition used                                                                                                                                                                                                                             |
| ---------------------------------- | -----------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Active request-path dispatch calls |              **5** | Distinct runtime sites that schedule/invoke `runRegisteredProviderOutboxBatch` (or injected `runBatch` bound to it) from a non-cron request path: page-view, view-item, add-to-cart, begin-checkout handlers + `recordAcceptedGenerateLead` |
| Obsolete imports                   |             **38** | Factory-backed event routes only: 19 routes × (`after` + `runRegisteredProviderOutboxBatch`)                                                                                                                                                |
| Obsolete dependency fields         |              **6** | Type/signature fields unused at runtime: factory `runBatch`+`scheduleAfter` (2) + Shopify orders-paid (2) + Shopify refunds-create (2). (Plus unused `_logLabel` param on factory — counted under factory cleanup, not as a field pair.)    |
| Obsolete consumer pass-sites       |             **38** | 19 factory routes × (`runBatch:` + `scheduleAfter:`) object fields passed but ignored                                                                                                                                                       |
| Test-only compatibility references |        **3 files** | `createBrowserEventRouteHandler.test.ts`, `handleShopifyOrdersPaidWebhook.test.ts`, `handleShopifyRefundsCreateWebhook.test.ts`                                                                                                             |
| CRON_OWNER_VALID owners            | **1 runtime path** | `/api/cron/provider-outbox-dispatch` (+ `vercel.json` schedule)                                                                                                                                                                             |
| Generator obsolete template        |              **1** | `generateApiRoute` in `scripts/generate-phase2-canonical-events.mjs`                                                                                                                                                                        |

---

## 4. Required answers

### Is cron the sole valid owner of `runRegisteredProviderOutboxBatch`?

**No.** Cron is a valid owner (`CRON_OWNER_VALID`), but **not
sole**. Five active non-cron call paths remain (A07–A15). Shopify
webhooks and the shared factory do **not** call it. Generator is
not a runtime owner.

### Would generator output reintroduce removed wiring?

**Yes.** `generateApiRoute` still emits `after`,
`runRegisteredProviderOutboxBatch`, `runBatch`, and
`scheduleAfter` (A55). Regenerating phase-2 routes without
updating the template would recreate obsolete consumer wiring on
factory-backed events.

### Can CE-1.4B–F proceed without behavioral change?

| Microtask | Without behavioral change?     | Condition                                                                                                   |
| --------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| CE-1.4B   | **Yes**                        | Make factory deps optional; body already collect-only                                                       |
| CE-1.4C   | **Yes only on §2.1 allowlist** | Must **exclude** page-view/view-item active handlers                                                        |
| CE-1.4D   | **Yes only on §2.2 allowlist** | Must **exclude** add-to-cart/begin-checkout and must not claim lead-server isolation via route-only cleanup |
| CE-1.4E   | **Yes**                        | After B+C+D clean factory consumers                                                                         |
| CE-1.4F   | **Yes**                        | Remove unused Shopify dep types/test spies only                                                             |

Treating A07–A15 as “obsolete wiring” and deleting their
`scheduleAfter`/`runBatch` paths **would** change behavior (stop
immediate registry drain) and is **out of scope** for CE-1.4B–F
as written (“remove obsolete”, “do not alter event behavior”).

---

## 5. Conclusion

```text
READY_WITH_BLOCKERS
```

### Blockers (must be classified before CE-1.4G / sole-owner claims)

1. **INV-007 residual active request-path registry drains** (new
   finding → new roadmap microtasks; do not silently fold into
   CE-1.4C/D):
   - `handleCanonicalPageViewRoute` + route
   - `handleCanonicalViewItemRoute` + route
   - `handleCanonicalAddToCartRoute` + route
   - `handleCanonicalBeginCheckoutRoute` + route
   - `recordAcceptedGenerateLead`
2. **Generator template** still encodes obsolete wiring (in
   CE-1.4D scope if allowlisted; required for CE-1.4G negative
   proof).
3. **CE-1.4G sole-owner gate cannot pass** until blockers in (1)
   are isolated or explicitly re-scoped via decision-log.

### Non-blockers for starting CE-1.4B

- Shared factory already returns only `collect(request)`.
- 19 factory-backed event routes have dead wiring only.
- Shopify purchase/refund handlers already isolated (CE-1.2/1.3);
  remaining fields are dependency-type / test-spy compatibility.
- Cron + `vercel.json` remain valid dispatch owners.

---

## 6. Per-claim evidence blocks

```text
Claim
  Local HEAD equals expected CE-1.3 commit f9b3fa3a2f3f88e46782e1e451fd7aa441b99d0f
Status: VERIFIED
Timestamp and environment: 2026-07-21T02:09:56Z local git
Source/tool/account identifier: git rev-parse HEAD
Exact source path/query/request: git rev-parse HEAD
Sanitized result: f9b3fa3a2f3f88e46782e1e451fd7aa441b99d0f
Limitation: worktree has unrelated dirty/untracked docs; HEAD commit content for analytics runtime was inspected from filesystem at this SHA
Roadmap/deviation impact: none — preflight PASS
```

```text
Claim
  createBrowserEventRouteHandler performs no runBatch/scheduleAfter (CE-1.1 isolation holds)
Status: VERIFIED
Timestamp and environment: 2026-07-21T02:09:56Z local source
Source/tool/account identifier: repository file read
Exact source path/query/request: src/lib/analytics/server/createBrowserEventRouteHandler.ts L3–13
Sanitized result: function returns dependencies.collect(request) only; runBatch/scheduleAfter remain required type fields but unused
Limitation: type-level requirement still forces consumers to pass deps
Roadmap/deviation impact: CE-1.4B can make fields optional without behavior change
```

```text
Claim
  After CE-1.1/1.2/1.3, no browser/webhook request path drains the provider registry
Status: REFUTED
Timestamp and environment: 2026-07-21T02:09:56Z local source
Source/tool/account identifier: rg + file reads
Exact source path/query/request: scheduleAfter( / runRegisteredProviderOutboxBatch( in src/lib/analytics/server (non-test)
Sanitized result: 4 specialized browser handlers still call scheduleAfter→runBatch; recordAcceptedGenerateLead calls after→runRegisteredProviderOutboxBatch; Shopify handlers do not
Limitation: production deploy SHA not re-verified in this audit (local HEAD only)
Roadmap/deviation impact: NEW TASK(S) required under INV-007/INV-021; classify as residual isolation work, not CE-1.4 obsolete cleanup
```

```text
Claim
  Cron (/api/cron/provider-outbox-dispatch) is a valid owner of runRegisteredProviderOutboxBatch
Status: VERIFIED
Timestamp and environment: 2026-07-21T02:09:56Z local source + vercel.json
Source/tool/account identifier: repository read
Exact source path/query/request: src/app/api/cron/provider-outbox-dispatch/route.ts; vercel.json crons[0]
Sanitized result: authorized cron calls runRegisteredProviderOutboxBatch({ maxItems: 1 }); vercel schedules path every 5 minutes
Limitation: live Vercel cron delivery not probed in this audit
Roadmap/deviation impact: keep; CE-1.4G must prove sole remaining owner after residual drains removed
```

```text
Claim
  Cron is the sole runtime owner of runRegisteredProviderOutboxBatch
Status: REFUTED
Timestamp and environment: 2026-07-21T02:09:56Z local source
Source/tool/account identifier: rg import/call sites
Exact source path/query/request: import.*runRegisteredProviderOutboxBatch across allowlisted trees
Sanitized result: 23 event routes import it; 19 obsolete + 4 active; plus recordAcceptedGenerateLead + runViewItemOutboxBatch helper + cron
Limitation: runViewItemOutboxBatch has no non-test caller (orphaned helper)
Roadmap/deviation impact: blocks CE-1.4G APPROVE_CE_1_4 until active callers isolated
```

```text
Claim
  Nineteen factory-backed /api/events routes pass obsolete immediate-dispatch wiring that has no runtime effect
Status: VERIFIED
Timestamp and environment: 2026-07-21T02:09:56Z local source
Source/tool/account identifier: route→handler mapping + factory body
Exact source path/query/request: list of 19 factory handleCanonical*Route.ts files using createBrowserEventRouteHandler; matching route.ts files
Sanitized result: each of 19 routes imports after + runRegisteredProviderOutboxBatch and passes runBatch/scheduleAfter; factory ignores them
Limitation: none material for inventory
Roadmap/deviation impact: CE-1.4C/D allowlists as §2.1/§2.2
```

```text
Claim
  Shopify orders-paid and refunds-create retain only unused runBatch/scheduleAfter dependency fields (no runtime call)
Status: VERIFIED
Timestamp and environment: 2026-07-21T02:09:56Z local source
Source/tool/account identifier: file read of webhook handlers + thin API routes
Exact source path/query/request: handleShopifyOrdersPaidWebhook.ts; handleShopifyRefundsCreateWebhook.ts; api/shopify/webhooks/*/route.ts
Sanitized result: optional runBatch/scheduleAfter on deps type; never read/called; routes call handlers with request only
Limitation: production webhook subscription ownership still SAFE-002 (out of CE-1.4A scope)
Roadmap/deviation impact: CE-1.4F cleanup only
```

```text
Claim
  Generator generateApiRoute would reintroduce obsolete dispatch wiring if run
Status: VERIFIED
Timestamp and environment: 2026-07-21T02:09:56Z local source
Source/tool/account identifier: scripts/generate-phase2-canonical-events.mjs L898–942
Exact source path/query/request: generateApiRoute template body
Sanitized result: template emits after import, runRegisteredProviderOutboxBatch import, runBatch and scheduleAfter wiring
Limitation: generator was not executed in this audit
Roadmap/deviation impact: include in CE-1.4D; required for CE-1.4G negative proof
```

```text
Claim
  Strings provider-outbox-after|purchase-outbox-after|refund-outbox-after remain in src/scripts
Status: REFUTED
Timestamp and environment: 2026-07-21T02:09:56Z local source
Source/tool/account identifier: rg
Exact source path/query/request: rg -n "provider-outbox-after|purchase-outbox-after|refund-outbox-after" src scripts
Sanitized result: zero matches; specialized handlers use event-specific *-outbox-after labels
Limitation: does not prove absence of all after()-based drains
Roadmap/deviation impact: update CE-1.4G search patterns to include active labels / scheduleAfter(
```

---

## 7. Finding classification (INV-021)

| Finding                                                           | Classification                                                  |
| ----------------------------------------------------------------- | --------------------------------------------------------------- |
| 19 factory routes have dead immediate-dispatch wiring             | evidence update (this inventory)                                |
| Factory still requires unused deps / logLabel                     | evidence update → CE-1.4B/E                                     |
| Generator emits obsolete wiring                                   | evidence update → CE-1.4D                                       |
| Shopify unused dep fields                                         | evidence update → CE-1.4F                                       |
| 4 specialized browser handlers still drain registry               | **new task** (request isolation residual; not obsolete cleanup) |
| recordAcceptedGenerateLead still drains registry                  | **new task**                                                    |
| runViewItemOutboxBatch orphaned default path                      | evidence update / optional cleanup (not CE-1.4B–F)              |
| Handoff still lists CE-1.1 as IMPLEMENTED_UNVERIFIED and old SHAs | documentation drift (INV-020) — out of auditor write scope      |

No charter change proposed. No automatic start of next microtask
beyond returning this conclusion to the controller.
