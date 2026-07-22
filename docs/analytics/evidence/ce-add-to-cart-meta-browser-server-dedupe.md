# Evidence — add_to_cart Meta browser/server dedupe

```text
Charter-version: 1.0.0
Goal: prove live Pixel/OpenBridge AddToCart eventID ===
  dataLayer / first-party / ledger / Meta CAPI event_id
Non-goals: begin_checkout; Events Manager Overlap UI badge;
  Microsoft browser UET (this run used fbclid only)
Conclusion: LIVE_ATC_META_BROWSER_SERVER_DEDUPE_PROVEN
Runtime tip: 5f126df97 (includes PR #53/#54)
Captured: 2026-07-22T15:07:00+02:00
Smoke: scripts/tracking/verify-meta-add-to-cart-dedupe.mjs
Artifact: /tmp/atc-meta-dedupe-smoke.json
Ledger: /tmp/atc-meta-dedupe-ledger.json
```

## 1. Method

1. Playwright on `https://utekos.no/produkter/utekos-techdown?fbclid=…`
2. Cookiebot accept-all → wait `_fbp` + `utekos_external_id`
3. Click `[data-track=ModalAddToCart]`
4. Wait until dataLayer `add_to_cart` **and** Pixel `/tr` AddToCart
   **and** OpenBridge AddToCart are present
5. Correlate pink-lens ledger + `ops.provider_dispatch_attempts`
6. Authorized cron drain `GET /api/cron/provider-outbox-dispatch`

## 2. Shared UUID

| Surface | Value |
| --- | --- |
| Shared `event_id` | `4032dbf1-d588-4d95-ab84-aa5d14f74191` |
| dataLayer | same |
| first-party POST | same |
| Pixel `/tr` `eid` | same |
| OpenBridge `event_id` | same |
| `marketing.event_ledger` | same |
| Meta CAPI attempt | same (`eventsReceived=1`) |

## 3. Browser commerce parameters (Pixel + OpenBridge)

Observed on both transports for the shared UUID:

| Parameter | Value |
| --- | --- |
| `eventName` | `AddToCart` |
| `eventID` / `event_id` | `4032dbf1-d588-4d95-ab84-aa5d14f74191` |
| `content_ids` | `["46944403882232"]` |
| `contents` | `[{id, quantity:1, item_price:1790}]` |
| `content_type` | `product` |
| `content_name` | `Utekos TechDown™` |
| `content_category` | `Yttertøy` (OpenBridge) |
| `currency` | `NOK` |
| `value` | `1790` |
| `fbp` / `fbc` | present and matched cookies |

Pixel `/tr` and OpenBridge both returned HTTP 200 for AddToCart.

## 4. Server outbox (same `event_id`)

| Provider | Status | Proof |
| --- | --- | --- |
| `meta` | `accepted_unverified` | `eventsReceived=1`, `fbTraceId=ANBPwKcn-jpu24oX1hKth27` |
| `google` | `accepted_unverified` | Data Manager `requestId=31079f35-2358-410a-ad04-ecc82250b667` |
| `microsoft_uet` | `skipped_unqualified` | `missing_msclkid` (expected: Meta-only smoke, no `msclkid`) |

## 5. Conclusion

```text
LIVE_ATC_META_BROWSER_SERVER_DEDUPE_PROVEN
dataLayer = Pixel eid = OpenBridge = POST = ledger = Meta CAPI
Do not auto-continue to begin_checkout
Events Manager Overlap UI remains blocked_verification (DEV-020 P2)
```
