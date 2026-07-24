# Evidence: add_to_wishlist UI + store wiring (queue #2)

**Date:** 2026-07-24  
**Start SHA:** `a9b42e1c3cbcb7eb79c5f59364f0a46ab2b13289`  
**Roadmap:** Stale-events design queue #2 (`add_to_wishlist`)  
**Tip at Meta EM investigation:** `bab92a3ef3d54ce808f9c24802fcca74568eee8f`  
**Tip at Meta EM Test Events GO:** `f9e386dfa1275ff9e53e2d6616c8e9262aa3c641`

## Governance preflight

```text
Charter-version: referenced by current-handoff 1.19.0 — program-charter.md / roadmap.md are NOT present on disk in this worktree
Roadmap task: Stale-events queue #2 add_to_wishlist (design 2026-07-24)
Affected invariants: one occurrence → one event_id; emit only after wishlist persist; consent fail-closed; no emit on bare login-dialog click
Goal: minimal localStorage wishlist store + WishlistButton post-mutation emit → dataLayer + /api/events/add-to-wishlist + Meta AddToWishlist Pixel↔CAPI
Non-goals: events 3–11; full customer-account wishlist sync; Checkout UI Extensions; view_cart (#3)
Allowed files: wishlist store, analytics mapper/reporter/helper, WishlistButton + call sites, web-meta-pixel.html, tests, this evidence
Documentation status: design + handoff + existing catalog/API/Meta adapters sufficient; charter/roadmap files missing on disk
```

## What shipped in-repo

- Minimal `localStorage` wishlist store (`utekos_wishlist_v1`) with idempotent per-variant mutations + `wishlist_mutation_id`.
- `mapShopifyAddToWishlist` reuses view_item commerce mapping.
- `reportCanonicalAddToWishlist` accepts Shopify product/variant + mutation id.
- `persistAndReportAddToWishlist` persists first, emits only on new mutation.
- `WishlistButton` no longer treats login-dialog open as the primary action; heart click persists then emits; optional sync dialog does not emit.
- Call sites: `ProductCard`, `HelpChooseCard`, PDP `ProductHeader`/`ProductPageView`.
- GTM template: `add_to_wishlist` → `AddToWishlist` + commerce payload (isoCurrency fail-closed retained; install-race fix retained).
- Catalog/API/Meta CAPI/Google DM adapters were already registered; unchanged.

## Unit verification

```text
pnpm exec tsx --test \
  src/lib/wishlist/wishlistStore.test.ts \
  src/lib/analytics/addToWishlistEvent.test.ts \
  src/lib/analytics/shopifyAddToWishlistCommerce.test.ts \
  src/lib/analytics/persistAndReportAddToWishlist.test.ts
→ pass (includes missing-taxable default)

node --test scripts/tracking/web-meta-pixel-tag.test.mjs
→ pass (includes AddToWishlist + shared eventID; isoCurrency fail-closed retained; no-_fbp install retained)
```

## Live / production gates (2026-07-24)

### App / Vercel

| Gate | Status |
|------|--------|
| Production tip | **READY** — tip includes wishlist wiring; investigated at `bab92a3ef` |
| dataLayer `add_to_wishlist` after WishlistButton click | **PASS** — fresh `95e3da94-55d8-41a2-b996-d00a0e5e2cc1` (earlier `a35b85a9-…`) |
| `POST /api/events/add-to-wishlist` | **PASS** — body shares `event_id` (HTTP 202 on prior smoke) |
| Persist-before-emit | **PASS** — `utekos_wishlist_v1` mutation before emit |

### Web GTM publish (`GTM-5TWMJQFP`)

| Version | Name | Notes |
|---------|------|-------|
| **127** (live) | Meta Pixel add_to_wishlist AddToWishlist - 2026-07-24 | Tag **153** HTML (`add_to_wishlist`→`AddToWishlist` + commerce); trigger **152** regex includes `add_to_wishlist`. Pixel ID `1092362672918571`. Source SHA-256 `712a1faadce07d1e6adf2ee632616d7633f41f4a85b6d63abd1f0cf1397b1668`. |

### Meta standard event spelling (docs)

Meta Pixel reference standard event is exactly **`AddToWishlist`** (not `AddToWishList`).  
Source: https://developers.facebook.com/docs/meta-pixel/reference — Context7 `/websites/developers_facebook_meta-pixel_reference`.

Our Pixel map + CAPI mapper both use `AddToWishlist`. Searching Events Manager for `AddToWishList` will miss the standard event.

### Meta Pixel / OpenBridge browser parity (corrected)

Earlier note that only `/tr` PageView was seen was **incomplete**: `/tr` posts as multipart body (`ev`/`eid` not always in query string).

Fresh smoke on `/produkter/utekos-stapper` with marketing consent (`/tmp/wishlist-meta-smoke.json`):

| Gate | Status |
|------|--------|
| dataLayer | **PASS** — `add_to_wishlist` / `95e3da94-55d8-41a2-b996-d00a0e5e2cc1` |
| Pixel `/tr` | **PASS** — `ev=AddToWishlist`, `eid=95e3da94-…`, `cd[content_ids]=["42903954292984"]`, `currency=NOK`, `value=199`, HTTP 200 |
| OpenBridge | **PASS** — `event_name=AddToWishlist`, same `event_id`, HTTP 200 |
| Shared `event_id` | **PASS** — dataLayer = `/tr` eid = OpenBridge = first-party body |

### Meta CAPI (not Pixel-only)

| Gate | Status |
|------|--------|
| Registry | **PASS** — `meta:add_to_wishlist` → `mapCanonicalAddToWishlistToMeta` → `AddToWishlist` |
| Outbox worker | **PASS** — `providerOutboxWorkerRegistry` includes `meta:add_to_wishlist` |
| Sample accepted | **PASS** — `95e3da94-…` → `accepted_unverified`, `eventsReceived=1`, `fbTraceId=AuARiKqa5-NmDr09uq-_NP0` (after cron drain) |
| Earlier samples | `a35b85a9-…` / `cae7369b-…` / `5e4395c4-…` also `accepted_unverified` with `eventsReceived=1` |

CAPI is **queued** (`server_retry`) until `/api/cron/provider-outbox-dispatch` runs (~5 min). Rows briefly stay `pending` before acceptance — not missing mapper.

### Meta Events Manager visibility — GO (Test Events) + Graph `/stats` GO

Prior rows in this file that said `NO-GO for EM proof` reflected a stats-lag
window plus a wrong Test Events code. They are superseded by the results below.
Keeping the earlier `NO-GO` narrative in the file only as historical context; the
current gate is `EM-VISIBLE (Test Events)` + `Graph /stats > 0`.

| Gate | Status |
|------|--------|
| Meta Events Manager **Test Events UI** (Pixel `1092362672918571`, code **`TEST30107`**) | **PASS** — user captured two `AddToWishlist` rows on `https://utekos.no/`, `action_source=website`, external_id / browser_id / IP / UA present |
| Graph Pixel `/stats` `aggregation=event` (last 24h) rechecked 2026-07-24T00:26Z | **PASS** — bucket `2026-07-23T23:00:00+0000` now returns `AddToWishlist=6`. Earlier `NO-GO` reading at 2026-07-24T00:19Z was a Meta stats-aggregation lag (~30–60 min) window, not a pipeline failure |
| Graph Pixel `/stats` `aggregation=event_source` for `AddToWishlist` (same bucket) | **PASS** — `SERVER=4`, `BROWSER=2`; both channels count |
| Direct Graph Test Events CAPI probe with the RIGHT code (`TEST30107`) | **PASS** — `events_received=3` (`AddToCart`, `AddToWishlist`, `ViewContent`) for `fbtrace_id=A8jbwpW7Aw_5u7lPGLeKPxs` at 2026-07-24T00:25:51Z |
| Payload diff `AddToCart` vs `AddToWishlist` at `mapCanonicalCommerceEventToMeta` | **PASS** — both events derive from the same mapper; only the `event_name` string differs. `action_source`, `event_time`, `user_data`, `custom_data`, `event_source_url`, `event_id`, `request_context` are structurally identical |
| Browser `fbq('trackSingle', PIXEL_ID, 'AddToWishlist', data, { eventID })` path | **PASS** — same call shape counted for `AddToCart` in the same 24h window; not a `track` vs `trackSingle` bug |
| Graph `openbridge_configurations` on this pixel | **empty** — no partner integration diverts events to another dataset. First-party CAPI + browser pixel land on `1092362672918571` |
| Graph `da_checks` diagnostics | Only two open items: `pixel_has_low_event_source_match_rate` (catalog vs `content_ids` mismatch) and `pixel_missing_param_in_events` (DPA). Neither blocks EM Overview from counting `AddToWishlist` |
| Production `META_TEST_EVENT_CODE` | **not set** on Vercel production (correct) |
| Prior `TEST46149` probe rows | **superseded** — that code is not the user's Events Manager Test Events code; the current EM code is `TEST30107` |
| Events Manager Overview UI screenshot | **user-side** — Test Events UI screenshot provided by user; Overview aggregation may still trail by tens of minutes for low-volume standard events |

**Asset identity (mismatch check):**

| Surface | Value |
|---------|-------|
| Pixel / dataset ID | `1092362672918571` (`Utekos Pixel`) |
| Owner business | `1384717111999921` (`Utekos Marketing Data Layer`) |
| Shared agency | `538548380599665` (`Utekos Marketing Group`) |
| OpenBridge | `mpc2-prod-25-is5qnl632q-wl.a.run.app` (+ AWS fallback); blocklist only `SubscribedButtonClick`, `Microdata` — **does not** block `AddToWishlist` |
| Live web GTM | **v128** tag **153** maps `add_to_wishlist` → `AddToWishlist` (pixel ID matches) |
| First-party CAPI | `META_PIXEL_ID=1092362672918571`, `action_source=website`, mapper event name `AddToWishlist` |

### Root cause of the earlier `NO-GO` reading

`events_received=1` is an ingress ACK; it is not proof that the event appears in
Events Manager. But the prior `NO-GO for EM proof` line in this file combined
two independent problems that were both actionable, not a Meta counting bug:

1. **Meta Graph `/stats` aggregation lag** for isolated agent smokes. Live
   `AddToCart` / `ViewContent` fill every hourly bucket, so their counts appear
   quickly. Wishlist agent smokes were isolated fires; Meta rolled them up
   ~30–60 min after the last fire. Rechecking `/stats` at 2026-07-24T00:26Z
   returned `AddToWishlist=6` in bucket `2026-07-23T23:00:00+0000`
   (`SERVER=4`, `BROWSER=2`), which had shown `0` at 2026-07-24T00:19Z. No code
   change caused this — pure Meta-side stats propagation.
2. **Wrong Test Events code** in prior probes. Local `.env.local` /
   `.env.mcp.local` had `META_TEST_EVENT_CODE=TEST46149`, but the user's
   Events Manager Test Events feed uses **`TEST30107`**. All prior
   `TEST46149` probes ACK-ed with `events_received=1` but never rendered in the
   Test Events UI the user was watching. Fixed locally: removed the duplicate
   `TEST46149` line in `.env.local`, and set `.env.mcp.local` to
   `META_TEST_EVENT_CODE=TEST30107`. Vercel production remains **unset** for
   `META_TEST_EVENT_CODE`, so live traffic still counts toward Overview /
   `/stats` and not Test Events, which is correct.

### Events Manager Test Events GO — event IDs (Pixel `1092362672918571`, code `TEST30107`)

User-captured Test Events UI on 2026-07-24 confirmed two live rows:

| # | `event_id` | Name | Value | Currency | `content_ids` | `content_name` | `action_source` | User data |
|---|-----------|------|-------|----------|---------------|----------------|-----------------|-----------|
| 1 | `t30107-AddToWishlist-1784852751-tv22rq6h` | `AddToWishlist` | `199` | `NOK` | `["42903954292984"]` | Stapper Sort Blue Frost S | `website` | External id, Browser id, IP, User agent |
| 2 | `6bcca19f-79e1-49a2-ac95-13df92aa1727` | `AddToWishlist` | `1790` | `NOK` | `["46944403882232"]` | TechDown (`content_category=Yttertøy`) | `website` | Advanced matching IP + User agent |

Row 1 was fired from this session by the direct Graph CAPI probe (paired with
`AddToCart` / `ViewContent`) at 2026-07-24T00:25:51Z with response
`events_received=3`, `fbtrace_id=A8jbwpW7Aw_5u7lPGLeKPxs`.
Row 2 was fired from live browser + CAPI activity on `utekos.no/` in the same
window; `event_id` shape confirms the storefront pipeline (`crypto.randomUUID()`
in the app, not a probe prefix).

### Payload diff `AddToCart` vs `AddToWishlist` — completed

At the mapper level both events go through
`src/lib/analytics/server/mapCanonicalCommerceEventToMeta.ts`. Fields sent:

| Field | `AddToCart` | `AddToWishlist` | Result |
|-------|-------------|-----------------|--------|
| `event_name` | `AddToCart` | `AddToWishlist` | different string, both Meta standard |
| `event_time` | canonical `event_time` → unix seconds | same code path | identical |
| `event_id` | canonical `event_id` | same code path | identical |
| `action_source` | `website` | `website` | identical |
| `event_source_url` | canonical `page_url` | canonical `page_url` | identical |
| `user_data` (`external_id`, `fbp`, `fbc`, `client_ip_address`, `client_user_agent`, hashed `em` / `ph`, optional customer-provided `ct`/`zp`/`st`/`country`) | via `buildMetaUserData` | via `buildMetaUserData` | identical |
| `custom_data` (`currency`, `value`, `content_ids`, `contents`, `content_type='product'`, optional `content_name`, `content_category`) | via `buildCustomData` | via `buildCustomData` | identical |
| `request_context` (host, query params incl. `fbclid`, `_fbc`/`_fbp` cookies, referrer, IP, scheme, path) | via `buildMetaRequestContext` | via `buildMetaRequestContext` | identical |

There is **no structural difference** in what we send. Meta accepts both with
`events_received=1` and equivalent `fbtrace_id` shape. There is no `track` vs
`trackSingle` bug: `src/../web-meta-pixel.html` calls
`fbq('trackSingle', PIXEL_ID, metaEventName, data, { eventID })` for every
mapped event, and `AddToCart` (same call shape) counts in `/stats` in the same
24h window.

### Consequences

```text
STACK_WISHLIST_META_FIRE_PROVEN
EM_TEST_EVENTS_VISIBLE_PROVEN         # TEST30107, two live event_ids
GRAPH_/stats_ADDTOWISHLIST_COUNT_>0   # SERVER=4, BROWSER=2 in bucket 23:00Z
Fix mapping/GTM republish: NOT REQUIRED (v128 already maps AddToWishlist)
Local env test-code drift: FIXED (.env.local dedup, .env.mcp.local=TEST30107)
Production env: unchanged; META_TEST_EVENT_CODE still unset on Vercel
Queue #4 remove_from_cart: DO NOT AUTO-CONTINUE — requires explicit go
```

**Events Manager navigation (human):**

1. Business portfolio **Utekos Marketing Data Layer** → Data sources →
   **Utekos Pixel** `1092362672918571`.
2. **Test events** → filter by code **`TEST30107`** → confirm rows 1 and 2
   above.
3. **Overview** (last 1h / 24h) → search exactly `AddToWishlist` (not
   `AddToWishList`). Expect the Overview count to trail Test Events by tens of
   minutes for low-volume standard events; Graph `/stats` already shows
   `AddToWishlist=6` in bucket `2026-07-23T23:00:00+0000`.
4. **Diagnostics** for this dataset: two open advisories on the pixel
   (`pixel_has_low_event_source_match_rate`, `pixel_missing_param_in_events`)
   are catalog/DPA hygiene items, not blockers for EM counting `AddToWishlist`.
5. Meta docs: standard event is `fbq('track', 'AddToWishlist')`; we use
   `fbq('trackSingle', PIXEL_ID, 'AddToWishlist', data, { eventID })` which is
   documented and counted identically.

### Follow-up fix in same queue item

List/overview variants omit GraphQL `taxable` → Zod reject after persist. Fixed
in `22527d290` by defaulting `taxable: true` in `mapShopifyAddToWishlist`.

## Hard stop

Do not auto-continue to `remove_from_cart` / queue #4+. This queue-#2 gate is
now **cleared for Test Events visibility**; Overview `/stats` is already > 0
and expected to keep climbing as live wishlist traffic accrues.