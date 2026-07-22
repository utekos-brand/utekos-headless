# CE-5.2C evidence — Meta live browser/server dedupe

```text
Charter-version: 1.0.0
Roadmap: CE-5.2C / DEC-013
Goal: prove live Pixel/OpenBridge eventID === CAPI/ledger event_id
  for PageView and ViewContent
Non-goals: GTM publish, permanent META_TEST_EVENT_CODE, add_to_cart,
  CE-2.4/2.5, push/deploy
Conclusion: LIVE_SHARED_EVENT_ID_PROVEN
Start-SHA: ae2c831b01736a8a4eecdd4e120f128d37f5b24e
Production tip: PR #51 merge (runtime logging + CRON_BATCH_SIZE=10)
Captured: 2026-07-22T13:13:00+02:00
```

## 1. Method

1. Playwright smoke: `node scripts/tracking/verify-meta-pixel-parity.mjs`
   against `https://utekos.no` with Cookiebot accept-all
2. Correlate UUIDs in dataLayer, `facebook.com/tr`, OpenBridge gateway
3. Read-only pink-lens: `marketing.event_ledger` +
   `ops.provider_dispatch_attempts` (provider=`meta`)
4. Drain Meta outbox via authorized production cron
   `GET /api/cron/provider-outbox-dispatch` (existing worker; no deploy)

## 2. Browser channel parity (smoke `ok: true`)

All three surfaces passed `canonicalEventParity` (dataLayer
`event_id` === Pixel `eid` === OpenBridge `event_id`).

### Product surface (primary ViewContent proof)

| Channel | Event | Shared `event_id` |
| --- | --- | --- |
| dataLayer + Pixel + OpenBridge | PageView | `e89cbda0-d685-4245-a0b5-38bc7a28feed` |
| dataLayer + Pixel + OpenBridge | ViewContent | `01c38322-5264-4eb4-9c58-5221ce5e3a29` |

URL: `https://utekos.no/produkter/utekos-dun?fbclid=codex_meta_pixel_product_d17e1b2ad73544f090619c6359f8adb1`

ViewContent Pixel/OpenBridge: `content_ids=["42903234609400"]`,
`currency=NOK`, `value=2490`, `content_name=Utekos Dun`,
`content_category=Yttertøy`, `content_type=product`.

### Additional surfaces (same run)

| Surface | PageView `event_id` | ViewContent `event_id` |
| --- | --- | --- |
| homepage | `950378d4-3598-4bb5-a984-24819ed33c3c` | — |
| campaign | `7685bf66-18bb-4259-b3d7-778aea141ba9` | `9c6a346d-018f-4b43-8e70-22a50cffe903` |

## 3. Ledger + Meta CAPI acceptance

All five smoke `event_id`s present in `marketing.event_ledger` with
marketing consent granted, `has_fbp=true`, `has_fbc=true`.

Meta outbox (after cron drain), product + homepage + campaign:

| `event_id` | Canonical name | Meta status | `eventsReceived` | `fbTraceId` |
| --- | --- | --- | --- | --- |
| `950378d4-…` | page_view | `accepted_unverified` | 1 | `AZII2_xxtRQjajD-SbDPyr7` |
| `e89cbda0-…` | page_view | `accepted_unverified` | 1 | `AUg1A3MTGwUB5TvN5fftP7X` |
| `01c38322-…` | view_item | `accepted_unverified` | 1 | `AB2THDOhh7jzIowVJHiZ8mZ` |
| `7685bf66-…` | page_view | `accepted_unverified` | 1 | `ARgYAFw0z8iRqeJVTYRbN_F` |
| `9c6a346d-…` | view_item | `accepted_unverified` | 1 | `A2FVeP5_LGgBsXo4HOExGqm` |

Outbox `payload.event_id` equals row `event_id` (no ID rewrite).
Cron claimed `meta:view_item` 3 and `meta:page_view` 4 in the
same drain window (includes concurrent traffic).

## 4. Parameterliste — klient vs server (produkt ViewContent)

Consent: marketing/analytics/preferences **granted**.

### 4.1 Klient (browser Pixel `/tr` + OpenBridge)

| Parameter | Observed (product ViewContent) |
| --- | --- |
| `event_name` | `ViewContent` |
| `event_id` / `eid` | `01c38322-5264-4eb4-9c58-5221ce5e3a29` |
| `fbp` | `fb.1.1784718796000.502879338.AQQCAQMB` |
| `fbc` | `fb.1.…codex_meta_pixel_product_….AQQCAQMB` |
| `external_id` (AM hash) | `8a6ad220ed6879856df710872f7de24b…` |
| page URL / `dl` | product URL + fbclid |
| commerce | variant `42903234609400`, NOK 2490, Utekos Dun |

Cookies set post-consent: `_fbp`, `_fbc`, `utekos_external_id`
(`anon_d83e3843-7936-448c-b967-486ef163e468`).

### 4.2 Server (ledger → Meta CAPI via cron)

| Parameter | Observed |
| --- | --- |
| canonical `event_name` | `view_item` → Meta `ViewContent` |
| `event_id` | same UUID; `eventsReceived=1` |
| `browser_id.fbp` / `fbc` | present on ledger |
| `external_id` | `anon_d83e3843-…` |
| item | Utekos Dun |
| Meta accept | `accepted_unverified` ~60s after accept |

### 4.3 Paritetssammendrag

| Goal field | Klient | Server CAPI | Same journey? |
| --- | --- | --- | --- |
| `event_id` | yes | yes | **yes — shared** |
| `fbp` / `fbc` | yes | yes | yes |
| `external_id` | hashed AM | stored + hashed CAPI | yes |
| Consent fail-closed | Meta after allow-all | Meta only if marketing | yes |

## 5. TEST97851 / Events Manager UI

| Check | Result |
| --- | --- |
| Permanent `META_TEST_EVENT_CODE` on production | **not set** (correct; no mutation) |
| Events Manager Deduplication Overlap UI re-read | **blocked_verification** — no Meta UI MCP; Graph still omits `dedupe_key_feedback` |
| Shared browser+server `event_id` (wire + ledger + CAPI) | **PROVEN** |

## 6. DEV-020 impact

Historical fail (2026-07-20 Test Events with mismatched IDs) is
superseded for PageView/ViewContent by this controlled same-UUID
journey on production tip `ae2c831b0`. UI badge lag remains possible;
operational claim is **shared `event_id` proven**, not «Test Events
script channel reach».

## 7. Conclusion

```text
LIVE_SHARED_EVENT_ID_PROVEN
PageView + ViewContent: Pixel/OpenBridge/dataLayer/ledger/CAPI
  same event_id; Meta eventsReceived=1
Primary ViewContent: 01c38322-5264-4eb4-9c58-5221ce5e3a29
Events Manager Overlap UI: blocked_verification
Do not auto-continue to add_to_cart or CE-2.4/2.5
```
