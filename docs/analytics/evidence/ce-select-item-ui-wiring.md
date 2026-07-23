# Evidence: select_item UI wiring (queue #1)

**Date:** 2026-07-24  
**Start SHA:** `3ba756ab3e069f15e9309bf2df52c2b474c03dee`  
**Implementation tip:** `cee7f63b2d62283874a12991689d06743033d0aa`  
**Production tip at smoke:** `cf688f844c39a6a8bb6a07c4e98f976887d582b7` (ancestor includes `cee7f63b2`)  
**Roadmap:** Stale-events design queue #1 (`select_item`)

## What shipped in-repo

- `select_item` `custom_data` requires commerce values (`currency`, `value`, `gross_value`, `tax_value`) for Meta/Google mappers.
- `mapShopifySelectItem` reuses `mapShopifyViewItem` + list fields.
- `reportCanonicalSelectItem` accepts Shopify product/variant + `itemListId`.
- UI: `ProductCard` + `ProductGridCard` call `reportProductListSelectItem` on product navigation clicks.
- Meta CAPI: `meta:select_item` adapter + outbox worker (`SelectItem`).
- Catalog / event-matrix / EVENT_CATALOG: Meta + Microsoft MS-B documented.
- GTM template source: `config/gtm/web-meta-pixel.html` maps `select_item` → `SelectItem` and includes commerce payload.

## Unit verification performed

```text
pnpm exec tsx --test \
  src/lib/analytics/selectItemEvent.test.ts \
  src/lib/analytics/shopifySelectItemCommerce.test.ts \
  src/lib/analytics/eventCatalog.test.ts
→ pass

node --test scripts/tracking/web-meta-pixel-tag.test.mjs
→ pass (includes SelectItem + shared eventID)
```

## Live / production gates (2026-07-24)

### App / Vercel

| Gate | Status |
|------|--------|
| Production deploy includes `cee7f63b2` | **READY** — `dpl_s4xot7FgrinbVkhinBRamDLspTnu` for `cee7f63b2`; later production tip `dpl_GU8T9k9UcU7FyBfpNSzoGQhHDekn` (`cf688f844`, CSP Meta iframe allowlist) still contains the select_item wiring |
| dataLayer `select_item` on ProductCard click | **PASS** (see sample event_ids) |
| `POST /api/events/select-item` | **PASS** HTTP `202` |

### Web GTM publish (`GTM-5TWMJQFP`, account `6295468138`, container `220236256`)

| Version | Name | Notes |
|---------|------|-------|
| **122** | Meta Pixel select_item SelectItem - 2026-07-24 | Tag **153** HTML from `config/gtm/web-meta-pixel.html` (`select_item: 'SelectItem'` + commerce branch). Template SHA-256 `aeb51cf8f3efe3075dc3ce855cb68785dcae41e85a68cac90cceda624e49da59`. Firing triggers `152`+`128` preserved. |
| **123** | Meta Pixel select_item trigger 152 - 2026-07-24 | Trigger **152** regex updated to `^(page_view\|view_item\|select_item\|add_to_cart\|begin_checkout\|search\|generate_lead)$` so tag 153 can fire on `select_item`. |
| **124** | Meta Pixel supportDocumentWrite boolean restore + select_item - 2026-07-24 | Restored tag 153 `supportDocumentWrite` to GTM type `boolean` after MCP `update_gtm_tag` had coerced it to `template` (risked Custom HTML render). |

Live `__gtg/gtm.js` verified containing `select_item:\"SelectItem\"` and trigger regex with `select_item`.

### Sample production event_ids (consented ProductCard click on `/produkter`)

Surface: `LazyFeaturedProductCarousel` → `ProductCard` (`data-track=ProductCardViewMoreClick`), not the upper `HelpChooseCard` carousel (that card is not wired for `select_item`).

| event_id | currency | gross_value | API |
|----------|----------|-------------|-----|
| `8291b466-9490-4e47-93d0-ef1e2427bdab` | NOK | 1790 | `POST /api/events/select-item` **202** |
| `46d68ea2-2e93-4ce5-b7fd-c8274709f087` | NOK | 1790 | (dataLayer; same path) |
| `ec1e300f-a109-4817-b80b-d1983ba2900c` | NOK | 1790 | (dataLayer after GTM v124) |

### Meta Pixel `SelectItem` browser parity

| Gate | Status |
|------|--------|
| Meta Pixel `SelectItem` with shared `event_id` | **NOT OBSERVED** in automation smoke |
| Meta CAPI / ledger outbox | Adapter registered; browser Pixel path blocked this pass — ledger row not re-queried here |

**Blocked reason (automation):** After marketing Cookiebot consent and Consent Mode `gcs=G111`, GTM tag **153** did not install `window.fbq` / did not request `connect.facebook.net/en_US/fbevents.js` on its own. Manual script injection of `fbevents.js` loaded (`onload`), so the network path to Facebook is open. Clarity and Bing tags did load under the same consent. Follow-up: GTM Preview for tag 153 fire/consent on a human browser session; do not treat browser SelectItem as green until `/tr?ev=SelectItem&eid=<event_id>` is captured.

## Limitations

- Upper `/produkter` “Produktkarusell” (`HelpChooseCard`) does **not** emit `select_item`; use `ProductCard` / `ProductGridCard` surfaces.
- Meta browser `SelectItem` parity remains open despite GTM HTML + trigger publish.
- Pink-lens ledger/outbox sample not confirmed via SQL in this pass.
- Do not start queue events #2–11 until Meta browser SelectItem is green (or explicitly waived).

## Stop condition

Microtask live gate: app + GTM publish + dataLayer/API smoke complete. Meta Pixel SelectItem shared-`event_id` network proof still open. Queue #2–11 not started.
