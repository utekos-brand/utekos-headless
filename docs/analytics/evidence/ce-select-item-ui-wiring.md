# Evidence: select_item UI wiring (queue #1)

**Date:** 2026-07-24  
**Start SHA:** `3ba756ab3e069f15e9309bf2df52c2b474c03dee`  
**Implementation tip:** see commit after this evidence is committed  
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

## Live / production gates

| Gate | Status |
|------|--------|
| dataLayer `select_item` on product-card click | Code wired; requires browser smoke with marketing/analytics consent |
| `POST /api/events/select-item` 2xx + ledger | Requires runtime smoke |
| Google DM outbox attempt | Requires runtime smoke |
| Meta Pixel `SelectItem` shared `event_id` | **Blocked:** committed template must be published to web GTM with explicit approval |
| Meta CAPI `SelectItem` | Adapter registered; requires marketing consent + outbox dispatch after accept |
| Microsoft UET browser | MS-B via GTM (if tag listens to `select_item`); MS-S blocked_no_worker |

## Limitations

- No production GTM publish in this microtask (explicit DEPLOYMENT gate).
- No pink-lens sample `event_id` captured in this pass (local unit only).
- Do not start queue events #2–11 until live gate above is green after GTM publish + smoke.

## Stop condition

Microtask code complete. Next human action: approve GTM publish of updated Meta Pixel tag, then run consented product-card smoke and append sample `event_id` to this file.
