# Evidence — Microsoft UET CAPI begin_checkout worker

```text
Charter-version: 1.0.0
Goal: activate microsoft_uet server outbox for begin_checkout
  (equal diligence with Meta + Google after add_to_cart)
Non-goals: live production smoke (requires deploy); CE-2.4/2.5;
  page_view/view_item Microsoft CAPI
Conclusion: CODE_CONTRACT_PROVEN
Start-SHA: b1347c403449e8cfe7243d8cf312572cc12c122d
Captured: 2026-07-22T15:30:00+02:00
```

## 1. Official contract

Microsoft Learn Conversions API guide
(`uet-conversion-api-integration`) + UET custom event list:

- Endpoint: `POST https://capi.uet.microsoft.com/v1/{tagId}/events`
- Auth: `Authorization: Bearer <ApiToken>`
- Custom `eventName` may be `begin_checkout`
- Retail cart/checkout surface uses `pageType` = `cart`
- Fail-closed without `msclkid` / CAPI token (same as purchase/ATC)

Mapped payload:

| Field | Value |
| --- | --- |
| `eventType` | `custom` |
| `eventName` | `begin_checkout` |
| `eventId` | canonical `event_id` |
| `customData.pageType` | `cart` |
| `customData.transactionId` | `checkout_id` |
| `userData.msclkid` | required (else `skipped_unqualified`) |

## 2. Code path

```text
acceptCanonicalBeginCheckout
→ planCanonicalEventDispatch (meta + google + microsoft_uet)
→ cron → microsoftUetBeginCheckoutProviderAdapter
→ mapCanonicalBeginCheckoutToMicrosoftUet
→ sendMicrosoftUetCapiBeginCheckout
```

## 3. Unit verification

```bash
pnpm exec tsx --test \
  src/lib/analytics/server/mapCanonicalBeginCheckoutToMicrosoftUet.test.ts \
  src/lib/analytics/server/sendMicrosoftUetCapiBeginCheckout.test.ts \
  src/lib/analytics/server/planCanonicalEventDispatch.test.ts \
  src/lib/analytics/server/providerRegistryContract.test.ts \
  src/lib/analytics/eventCatalog.test.ts
```

## 4. Stop

Do not claim production Microsoft acceptance until after deploy +
consented journey with `msclkid` and cron drain. Do not auto-start
CE-2.4/2.5.
