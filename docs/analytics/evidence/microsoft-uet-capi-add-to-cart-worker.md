# Evidence — Microsoft UET CAPI add_to_cart worker

```text
Charter-version: 1.0.0
Goal: activate microsoft_uet server outbox for add_to_cart
  (equal diligence with Meta + Google)
Non-goals: page_view/view_item Microsoft CAPI; production deploy;
  live Microsoft Ads UI conversion proof
Conclusion: CODE_CONTRACT_PROVEN
Start-SHA: 1c31ef7840f46386a4469edbcbfb30cf3282eec5
Captured: 2026-07-22T13:45:00+02:00
```

## 1. Official contract

Microsoft Learn Conversions API guide
(`uet-conversion-api-integration`):

- Endpoint: `POST https://capi.uet.microsoft.com/v1/{tagId}/events`
- Auth: `Authorization: Bearer <ApiToken>`
- Custom events use free-form `eventName` for conversion goals
- Retail ATC: `pageType` = `product` when fired on PDP; items,
  value, currency, `msclkid` recommended
- Shopify Microsoft docs: conversion goal action `add_to_cart`

Mapped payload:

| Field | Value |
| --- | --- |
| `eventType` | `custom` |
| `eventName` | `add_to_cart` |
| `eventId` | canonical `event_id` |
| `customData.pageType` | `product` |
| `customData.transactionId` | `cart_mutation_id` |
| `userData.msclkid` | required (else `skipped_unqualified`) |

## 2. Code path

```text
acceptCanonicalAddToCart
→ planCanonicalEventDispatch (meta + google + microsoft_uet)
→ cron → microsoftUetAddToCartProviderAdapter
→ mapCanonicalAddToCartToMicrosoftUet
→ sendMicrosoftUetCapiAddToCart
```

## 3. Unit verification

```bash
pnpm exec tsx --test \
  src/lib/analytics/server/mapCanonicalAddToCartToMicrosoftUet.test.ts \
  src/lib/analytics/server/sendMicrosoftUetCapiAddToCart.test.ts \
  src/lib/analytics/server/planCanonicalEventDispatch.test.ts \
  src/lib/analytics/server/providerRegistryContract.test.ts \
  src/lib/analytics/eventCatalog.test.ts
```

## 4. Stop

Do not claim production Microsoft acceptance until after deploy +
consented journey with `msclkid` and cron drain. Do not auto-start
`begin_checkout` or CE-2.4/2.5.
