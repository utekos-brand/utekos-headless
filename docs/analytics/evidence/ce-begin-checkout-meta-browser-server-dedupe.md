# Evidence — begin_checkout Meta browser/server dedupe

```text
Charter-version: 1.0.0
Goal: prove live Pixel/OpenBridge InitiateCheckout eventID ===
  first-party / ledger / Meta CAPI event_id
Non-goals: CE-2.4/2.5; Events Manager Overlap UI badge;
  Microsoft (this run used fbclid only)
Conclusion: LIVE_BC_META_BROWSER_SERVER_DEDUPE_PROVEN
Runtime tip: d10d243aa (includes PR #56/#57)
Captured: 2026-07-22T15:46:00+02:00
Smoke: scripts/tracking/verify-meta-begin-checkout-dedupe.mjs
Artifact: /tmp/bc-meta-dedupe-smoke.json
Ledger: /tmp/bc-meta-dedupe-ledger.json
```

## 1. Method

1. Playwright on `https://utekos.no/produkter/utekos-techdown?fbclid=…`
2. Cookiebot accept-all → `ModalAddToCart` → cart drawer
   `a[aria-label*="Gå til kassen"]`
3. Capture Pixel `/tr` + OpenBridge `InitiateCheckout` and
   first-party `begin_checkout` POST
4. Correlate pink-lens ledger + Meta attempt
5. Authorized cron drain

## 2. Shared UUID

| Surface | Value |
| --- | --- |
| Shared `event_id` | `e4d043ee-34af-47ac-8102-22bf2a907b05` |
| first-party POST | same |
| Pixel `/tr` `eid` | same (`InitiateCheckout`) |
| OpenBridge `event_id` | same (`InitiateCheckout`) |
| `marketing.event_ledger` | same (`begin_checkout`) |
| Meta CAPI attempt | same (`eventsReceived=1`) |

## 3. Browser commerce parameters (Pixel + OpenBridge)

| Parameter | Value |
| --- | --- |
| `eventName` | `InitiateCheckout` |
| `eventID` / `event_id` | `e4d043ee-34af-47ac-8102-22bf2a907b05` |
| `content_ids` | `["46944403882232"]` |
| `contents` | `[{id, quantity:1, item_price:1790}]` |
| `content_type` | `product` |
| `content_name` | `Utekos TechDown™` |
| `content_category` | `Yttertøy` (OpenBridge) |
| `currency` | `NOK` |
| `value` | `1790` |
| `fbp` / `fbc` | present and matched |
| `external_id` hash | present on Pixel + OpenBridge |

## 4. Server outbox (same `event_id`)

| Provider | Status | Proof |
| --- | --- | --- |
| `meta` | `accepted_unverified` | `eventsReceived=1`, `fbTraceId=AlnCXoK4YDKgFQAzFNRdkYF` |
| `google` | `accepted_unverified` | Data Manager `requestId=6a610535-34c2-440d-9291-214cd36a5372` |
| `microsoft_uet` | `skipped_unqualified` | `missing_msclkid` (expected: Meta-only smoke) |

Ledger also had `external_id`, `client_ip_address`, `fbp`/`fbc`.
`location.country_code=NO` is IP-geo only (not sent as Meta
customer-address country).

## 5. Conclusion

```text
LIVE_BC_META_BROWSER_SERVER_DEDUPE_PROVEN
POST = Pixel eid = OpenBridge = ledger = Meta CAPI
Do not auto-continue to CE-2.4 / CE-2.5
Events Manager Overlap UI remains blocked_verification (DEV-020 P2)
```
