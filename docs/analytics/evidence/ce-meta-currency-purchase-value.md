# Evidence: Meta Pixel currency warning + Purchase missing value

**Date:** 2026-07-24  
**Start SHA:** `e70979afe5984f139e5cc597c1a31762bffb7423`  
**Environment:** production `utekos.no` + web GTM `GTM-5TWMJQFP`  
**Related:** DEV-019 / META-008; Events Manager Purchase value quality

## 1) Browser console — Invalid parameter format for currency

### Reproduction

1. Product URL `https://utekos.no/produkter/utekos-techdown` (GTM aborted in isolation).
2. Load Meta `fbevents.js`, `init`, `trackSingle` ViewContent with valid
   `{ currency: 'NOK', value: 1790, content_ids, contents }`.
3. Console warns:
   `[Meta Pixel] - Invalid parameter format for currency`.
4. Same ViewContent payload on `about:blank` / homepage / `/produkter`
   does **not** warn.

### Root cause

Unused DOM attributes on the product price panel:

```html
data-product-price="1790.0"
data-product-currency="NOK"
```

in `ProductPageView` (`priceActivityPanel`). Meta Pixel automatic parameter
detection scrapes these on ViewContent and emits the currency-format warning
even when the `fbq` payload currency is valid ISO `NOK`.

Isolation proof:

| Change | Warning |
|--------|---------|
| Remove only `data-product-price` + `data-product-currency` | No |
| Remove only Klarna placement | Yes |
| Set `data-product-currency="kr"` | Yes |
| Nuclear empty `body` | No |

Stack location pointing at a Next.js chunk is a console interceptor; the
message text is Meta Pixel’s.

### Secondary gap (metadata)

`buildProductOtherMetadata` read `selectedOrFirstAvailableVariant`, which the
Storefront product GraphQL fragment never returns. Live HTML only had:

- `product:item_group_id`
- `product:availability`
- `product:condition`

and lacked paired `product:price:amount` / `product:price:currency`. Fixed to
resolve variant from `variants.edges` / `priceRange` and emit amount+currency
together (ISO only).

### Fix

1. Remove `data-product-*` attributes from `ProductPageView` (unused in-repo).
2. Fix `buildProductOtherMetadata` fail-closed price metas.
3. Harden `config/gtm/web-meta-pixel.html`: ISO-4217 currency helper; never send
   `value` without valid currency; omit invalid/empty currency.

## 2) Events Manager — Purchase value missing (~25%), Klarna URL sample

### Findings

- Canonical web Meta tag **153** `EVENT_NAMES` has **no** `purchase` mapping;
  browser Purchase is not owned by Utekos GTM Pixel HTML.
- Canonical Purchase CAPI (`shopifyOrderToCanonicalPurchase` →
  `mapCanonicalPurchaseToMeta`) always sets numeric `custom_data.value` from
  Shopify `total_price_set` and ISO currency; Zod rejects empty string values.
- Sampled activity `https://payments.klarna.com/` is therefore **not** explained
  by the first-party webhook→CAPI path. It matches Shopify checkout / Klarna
  hosted payment / Shopify Meta sales-channel Pixel+CAPI behavior.

### Fail-closed stance

Do **not** invent Purchase `value` when order total is unavailable. Partner /
Shopify Meta channel must supply numeric value > 0. First-party CAPI remains
authoritative for paid Shopify orders we accept.

### Non-goals

- No change to Klarna Express checkout UX.
- No Shopify Admin Meta channel mutation in this microtask.
- Queue events #2–11 not started.

## Verification

| Gate | Status |
|------|--------|
| `node --test scripts/tracking/web-meta-pixel-tag.test.mjs` | PASS (incl. ISO omit cases) |
| `buildProductOtherMetadata` unit tests | PASS (via `tsx` import) |
| Playwright isolation of `data-product-*` | PASS (warning cleared) |
| Production app deploy of ProductPageView fix | **Blocked** until Vercel deploy |
| GTM tag 153 HTML publish (ISO harden) | **Published v125** `Meta Pixel ISO currency fail-closed - 2026-07-24`; live `gtm.js` `"version":"125"` contains `/^[A-Z]{3}$/` currency helper; `supportDocumentWrite` boolean |
| Purchase Klarna partner gap fix | **Blocked** — partner surface |

## Dokumentasjonsstatus

Enough evidence to fix the storefront currency warning and document the Purchase
Klarna partner gap. Production confirmation of the DOM-attr fix requires app
deploy; GTM v125 harden is defense-in-depth for dataLayer currency, not the
primary console root cause.
