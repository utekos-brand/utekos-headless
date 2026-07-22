# Evidence — add_to_cart three-provider live smoke

```text
Charter-version: 1.0.0
Goal: prove consented add_to_cart reaches Meta + Google + Microsoft
  with shared event_id after PR #53 production deploy
Non-goals: begin_checkout; Events Manager / Microsoft Ads UI badges
Conclusion: LIVE_THREE_PROVIDER_ATC_PROVEN
Runtime tip: 1537e28df (PR #53) production READY dpl_EZMuJTEFAv3umzkodHCdm2WXDxyV
Captured: 2026-07-22T14:26:00+02:00
```

## 1. Method

1. Playwright on `https://utekos.no/produkter/utekos-techdown`
2. Query `msclkid` + `fbclid` (controlled smoke IDs)
3. Cookiebot accept-all → click `[data-track=ModalAddToCart]`
4. Correlate dataLayer / first-party POST / pink-lens ledger + attempts
5. Authorized cron drain `GET /api/cron/provider-outbox-dispatch`

## 2. Browser + first-party

| Field | Value |
| --- | --- |
| Shared `event_id` | `1b788154-1e7b-433b-a930-f8b5f529ce34` |
| Item | Utekos TechDown™ |
| `msclkid` | `codex_msclkid_atc_885a2806eb7b45a7a30cff6198252e24` |
| `fbclid` | `codex_fbclid_atc_786c0c6330a0476f87ad18ac8e803c35` |
| dataLayer === POST | yes |
| marketing consent | granted |
| `fbp` / GA client | present on ledger |

## 3. Provider outbox (same `event_id`)

| Provider | Status | Proof |
| --- | --- | --- |
| `meta` | `accepted_unverified` | `eventsReceived=1`, `fbTraceId=A7jdveKeM6lkpA165mRyURK` |
| `google` | `accepted_unverified` | Data Manager `requestId=36c14ac7-9be8-49e2-b551-8128a0356608` |
| `microsoft_uet` | `accepted_unverified` | CAPI HTTP `status=200`, `eventName=add_to_cart`, `tagId=97247724` |

Cron claimed `meta:add_to_cart`, `google:add_to_cart`, and
`microsoft_uet:add_to_cart` in the same drain.

## 4. Conclusion

```text
LIVE_THREE_PROVIDER_ATC_PROVEN
Meta + Google + Microsoft UET CAPI accepted one shared add_to_cart UUID
Do not auto-continue to begin_checkout / CE-2.4 / CE-2.5
```
