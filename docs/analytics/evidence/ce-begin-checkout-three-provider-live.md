# Evidence — begin_checkout three-provider live smoke

```text
Charter-version: 1.0.0
Goal: prove consented begin_checkout reaches Meta + Google + Microsoft
  with shared event_id after PR #56 production deploy
Non-goals: CE-2.4/2.5; Events Manager Overlap UI; Meta Pixel wire capture
  (navigation to kasse aborted after first-party POST)
Conclusion: LIVE_THREE_PROVIDER_BEGIN_CHECKOUT_PROVEN
Runtime tip: 36672b7aa (PR #56) production READY dpl_5ZDyzPjK7ZN3c5Mv32HMwYfHNvrm
Captured: 2026-07-22T15:38:00+02:00
```

## 1. Method

1. Playwright on `https://utekos.no/produkter/utekos-techdown`
2. Query `msclkid` + `fbclid`
3. Cookiebot accept-all → `ModalAddToCart` → cart drawer
   `a[aria-label*="Gå til kassen"]`
4. Correlate first-party POST / pink-lens ledger + attempts
5. Authorized cron drain `GET /api/cron/provider-outbox-dispatch`

## 2. Browser + first-party

| Field | Value |
| --- | --- |
| Shared `event_id` | `71e61762-9def-4899-8262-446a521ad3bd` |
| first-party POST | yes (same UUID + msclkid/fbclid) |
| marketing consent | granted |
| `fbp` on ledger | present |

## 3. Provider outbox (same `event_id`)

| Provider | Status | Proof |
| --- | --- | --- |
| `meta` | `accepted_unverified` | `eventsReceived=1`, `fbTraceId=ACHaminBWBDODbjrU0LfAZm` |
| `google` | `accepted_unverified` | Data Manager `requestId=74406d12-796f-4cc7-8a6f-344c787b0b79` |
| `microsoft_uet` | `accepted_unverified` | CAPI HTTP `status=200`, `eventName=begin_checkout`, `tagId=97247724` |

Cron claimed `meta:begin_checkout`, `google:begin_checkout`, and
`microsoft_uet:begin_checkout` in the same drain window.

## 4. Conclusion

```text
LIVE_THREE_PROVIDER_BEGIN_CHECKOUT_PROVEN
Meta + Google + Microsoft UET CAPI accepted one shared begin_checkout UUID
Do not auto-continue to CE-2.4 / CE-2.5
Optional follow-up: Meta Pixel/OpenBridge InitiateCheckout eid parity
```
