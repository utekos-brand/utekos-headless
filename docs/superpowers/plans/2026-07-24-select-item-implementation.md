# Select Item Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire canonical `select_item` from product-list click through dataLayer + `/api/events/select-item` + ledger/outbox, with Meta `SelectItem` Pixel↔CAPI shared `event_id`, Google Data Manager, and Microsoft browser UET evidence — then stop (do not start events 2–11).

**Architecture:** Reuse the existing Zod schema, reporter, collector transport, and Google Data Manager worker. Extend `custom_data` with commerce value fields required by Meta/Google commerce mappers. Add a Shopify→canonical mapper and a single click reporter used by product-card links (`ProductCardViewMoreClick` / `ProductGridCardViewMoreClick`). Update the committed Meta Pixel GTM template map. Register Meta CAPI adapter + catalog Meta/`SelectItem` + Microsoft MS-B. Prove the design-spec verification gate before any next event.

**Tech Stack:** Next.js App Router client reporters, Zod, `@next/third-parties/google` `sendGTMEvent`, existing first-party collector + Postgres ledger/outbox, Meta Pixel template (`config/gtm/web-meta-pixel.html`), Google Data Manager worker, Node `node:test` + `tsx`.

## Global Constraints

- Canonical-first snake_case app contract; PascalCase (`SelectItem`) only at GTM/Meta.
- Clone the proven `add_to_cart` path (reporter → dataLayer → `/api/events/*` → ledger → outbox), not GTM-only.
- One microtask only: `select_item`. Do **not** implement `add_to_wishlist` or any later queue item.
- No `useMemo` / `useCallback` (React Compiler).
- Fail-closed Zod + consent; UI must not block navigation on reporter failure.
- Explicit user approval before any GTM publish, production deploy, or provider mutation (`DEPLOYMENT.md`).
- No Meta through sGTM; Pixel↔CAPI shares `event_id`.
- Do not amend unrelated dirty files; keep scope to files listed below.

## Governance preflight (state before writes)

```text
Charter-version: referenced by current-handoff 1.19.0 — program-charter.md / roadmap.md are NOT present on disk in this worktree (blocked for charter-text citation; proceed on approved design spec + current-handoff + event-matrix)
Roadmap task: Stale-events queue #1 select_item (design 2026-07-24) — not a CE-2.* purchase/refund task
Affected invariants: one occurrence → one event_id; consent fail-closed; provider attempts planned atomically from catalog; no silent dual-fire of legacy PascalCase once canonical live
Goal: wire select_item UI → reporter → ledger → Google + Meta (+ Microsoft browser) with green verification gate
Non-goals: events 2–11; wishlist store; Checkout UI Extensions; PostHog reintroduction; Meta via sGTM
Allowed files/systems: listed File map + evidence/docs under docs/analytics + config/gtm/web-meta-pixel.html
Start SHA: d7ade6b37295230e971fe2bb3969361deeb59c54
Documentation status: design spec committed; current-handoff + event-matrix + ATC dedupe evidence sufficient for select_item planning; charter/roadmap files missing on disk (cite design + handoff)
```

## File map

| File | Role |
|------|------|
| Modify [`src/lib/analytics/selectItemEvent.ts`](src/lib/analytics/selectItemEvent.ts) | Add `currency` / `value` / `gross_value` / `tax_value` to `custom_data` so Meta/Google commerce mappers work |
| Create [`src/lib/analytics/shopifySelectItemCommerce.ts`](src/lib/analytics/shopifySelectItemCommerce.ts) | Map Shopify product+variant+list context → `CanonicalSelectItemCustomData` |
| Create [`src/lib/analytics/shopifySelectItemCommerce.test.ts`](src/lib/analytics/shopifySelectItemCommerce.test.ts) | Unit tests for mapper |
| Create [`src/lib/analytics/selectItemEvent.test.ts`](src/lib/analytics/selectItemEvent.test.ts) | Zod accept/reject tests |
| Modify [`src/lib/analytics/selectItemReporter.ts`](src/lib/analytics/selectItemReporter.ts) | Accept Shopify product/variant + list fields; call mapper; keep transport |
| Create [`src/lib/analytics/selectItemReporter.test.ts`](src/lib/analytics/selectItemReporter.test.ts) | Reporter emit tests (pattern from `viewItemReporter.test.ts`) |
| Create [`src/lib/analytics/reportProductListSelectItem.ts`](src/lib/analytics/reportProductListSelectItem.ts) | Click helper: build `interaction_id`, call reporter, never throw to UI |
| Modify [`src/components/ProductCard/ProductCard.tsx`](src/components/ProductCard/ProductCard.tsx) | On product-link click → report; optional `itemListId` prop |
| Modify [`src/app/gaveguide/components/ProductGridCard.tsx`](src/app/gaveguide/components/ProductGridCard.tsx) | Same for `ProductGridCardViewMoreClick` |
| Modify [`src/lib/analytics/eventCatalog.ts`](src/lib/analytics/eventCatalog.ts) | Enable Meta `SelectItem` + Microsoft MS-B for `select_item` |
| Modify [`docs/analytics/event-matrix.md`](docs/analytics/event-matrix.md) | Reflect Meta + MS-B |
| Modify [`EVENT_CATALOG.md`](EVENT_CATALOG.md) | Align provider table row for `select_item` |
| Create [`src/lib/analytics/server/mapCanonicalSelectItemToMeta.ts`](src/lib/analytics/server/mapCanonicalSelectItemToMeta.ts) | `mapCanonicalCommerceEventToMeta(event, 'SelectItem')` |
| Create [`src/lib/analytics/server/dispatchCanonicalSelectItemToMeta.ts`](src/lib/analytics/server/dispatchCanonicalSelectItemToMeta.ts) | Clone add_to_cart Meta dispatch |
| Create [`src/lib/analytics/server/providerAdapters/metaSelectItemProviderAdapter.ts`](src/lib/analytics/server/providerAdapters/metaSelectItemProviderAdapter.ts) | `meta:select_item` adapter |
| Modify [`src/lib/analytics/server/providerAdapterRegistry.ts`](src/lib/analytics/server/providerAdapterRegistry.ts) | Register adapter |
| Modify [`src/lib/analytics/server/providerOutboxWorkerRegistry.ts`](src/lib/analytics/server/providerOutboxWorkerRegistry.ts) | Register worker |
| Modify [`config/gtm/web-meta-pixel.html`](config/gtm/web-meta-pixel.html) | `select_item: 'SelectItem'` + commerceData branch |
| Modify [`scripts/tracking/web-meta-pixel-tag.test.mjs`](scripts/tracking/web-meta-pixel-tag.test.mjs) | Assert SelectItem + shared eventID |
| Create [`docs/analytics/evidence/ce-select-item-three-provider-live.md`](docs/analytics/evidence/ce-select-item-three-provider-live.md) | Verification evidence (after live smoke) |
| Modify [`docs/analytics/known-deviations.md`](docs/analytics/known-deviations.md) | Close/record unwired-select_item deviation if present |

```mermaid
flowchart TD
  click[Product list link click]
  helper[reportProductListSelectItem]
  reporter[reportCanonicalSelectItem]
  dl[dataLayer select_item]
  api["POST /api/events/select-item"]
  ledger[marketing.event_ledger]
  outbox[ops.provider_dispatch_attempts]
  pixel[Meta Pixel SelectItem eventID]
  google[Google DM select_item]
  ms[Microsoft UET browser via GTM]

  click --> helper --> reporter
  reporter --> dl
  reporter --> api --> ledger --> outbox
  dl --> pixel
  outbox --> google
  outbox --> pixel
  dl --> ms
```

Already present (do not rebuild): [`selectItemCollectorTransport.ts`](src/lib/analytics/selectItemCollectorTransport.ts), [`src/app/api/events/select-item/route.ts`](src/app/api/events/select-item/route.ts), [`acceptCanonicalSelectItem.ts`](src/lib/analytics/server/acceptCanonicalSelectItem.ts), [`googleDataManagerSelectItemProviderAdapter.ts`](src/lib/analytics/server/providerAdapters/googleDataManagerSelectItemProviderAdapter.ts).

---

### Task 1: Extend `select_item` custom_data + failing Zod tests

**Files:**
- Modify: `src/lib/analytics/selectItemEvent.ts`
- Create: `src/lib/analytics/selectItemEvent.test.ts`

**Interfaces:**
- Consumes: existing `canonicalCommerceItemSchema`
- Produces: `CanonicalSelectItemCustomData` with required commerce value fields used by Meta mapper

- [ ] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict'
import test from 'node:test'
import {
  canonicalSelectItemCustomDataSchema,
  createCanonicalSelectItem
} from './selectItemEvent'

const item = {
  item_id: 'gid://shopify/ProductVariant/123',
  product_id: 'gid://shopify/Product/456',
  variant_id: 'gid://shopify/ProductVariant/123',
  item_name: 'Utekos TechDown',
  product_handle: 'utekos-techdown',
  quantity: 1,
  unit_price: 1432,
  gross_unit_price: 1790,
  tax_amount: 358,
  tax_rate: 0.25,
  taxable: true,
  price_includes_tax: true,
  available_for_sale: true,
  currently_not_in_stock: false,
  quantity_available: 8,
  selected_options: [],
  collection_ids: [],
  collection_titles: []
}

test('custom_data requires currency and gross_value for Meta commerce parity', () => {
  assert.throws(() =>
    canonicalSelectItemCustomDataSchema.parse({
      interaction_id: 'int-1',
      item_list_id: 'frontpage_featured',
      items: [item]
    })
  )
})

test('createCanonicalSelectItem accepts full commerce select payload', () => {
  const event = createCanonicalSelectItem({
    environment: 'production',
    eventId: '72b6c4d3-cf47-493b-844c-147e237fcf45',
    eventTime: '2026-07-24T00:00:00.000Z',
    pageUrl: 'https://utekos.no/',
    pageTitle: 'Utekos',
    pageViewId: '0c955d6b-5e9c-47d0-b304-046df7f4bf7f',
    consent: {
      analytics: 'granted',
      marketing: 'granted',
      preferences: 'denied',
      source: 'cookiebot',
      version: '1'
    },
    customData: {
      interaction_id: 'int-1',
      item_list_id: 'frontpage_featured',
      destination_url: 'https://utekos.no/produkter/utekos-techdown',
      currency: 'NOK',
      value: 1432,
      gross_value: 1790,
      tax_value: 358,
      items: [item]
    }
  })

  assert.equal(event.event_name, 'select_item')
  assert.equal(event.custom_data.item_list_id, 'frontpage_featured')
  assert.equal(event.custom_data.gross_value, 1790)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec tsx --test src/lib/analytics/selectItemEvent.test.ts`  
Expected: FAIL (missing required fields / module parse expectations not met)

- [ ] **Step 3: Write minimal schema change**

In `selectItemEvent.ts`, replace `canonicalSelectItemCustomDataSchema` with:

```ts
export const canonicalSelectItemCustomDataSchema = z.strictObject({
  interaction_id: z.string().min(1),
  item_list_id: z.string().min(1),
  destination_url: z.string().url().optional(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  value: z.number().finite().nonnegative(),
  gross_value: z.number().finite().nonnegative(),
  tax_value: z.number().finite().nonnegative(),
  items: z.array(canonicalCommerceItemSchema).min(1).max(1)
})
```

Remove unused `canonicalCommerceValueSchema` import if it becomes unused.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec tsx --test src/lib/analytics/selectItemEvent.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add -f src/lib/analytics/selectItemEvent.ts src/lib/analytics/selectItemEvent.test.ts
git commit -m "$(cat <<'EOF'
feat(analytics): require commerce values on select_item

Align select_item custom_data with Meta/Google commerce mappers
before UI wiring.
EOF
)"
```

---

### Task 2: Shopify select_item commerce mapper

**Files:**
- Create: `src/lib/analytics/shopifySelectItemCommerce.ts`
- Create: `src/lib/analytics/shopifySelectItemCommerce.test.ts`

**Interfaces:**
- Consumes: `mapShopifyViewItem` from `shopifyViewItemCommerce.ts`
- Produces: `mapShopifySelectItem(input) => CanonicalSelectItemCustomData`

- [ ] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict'
import test from 'node:test'
import { mapShopifySelectItem } from './shopifySelectItemCommerce'
import type { ShopifyProduct } from 'types/product/ShopifyProduct'
import type { ShopifyProductVariant } from 'types/product/ShopifyProductVariant'

test('maps list context and single commerce item', () => {
  const product = {
    id: 'gid://shopify/Product/456',
    handle: 'utekos-techdown',
    title: 'Utekos TechDown',
    vendor: 'Utekos',
    productType: 'Yttertøy',
    collections: { nodes: [] },
    options: [],
    variants: { nodes: [] },
    featuredImage: null,
    priceRange: {
      minVariantPrice: { amount: '1790.0', currencyCode: 'NOK' },
      maxVariantPrice: { amount: '1790.0', currencyCode: 'NOK' }
    }
  } as unknown as ShopifyProduct

  const variant = {
    id: 'gid://shopify/ProductVariant/46944403882232',
    title: 'Default',
    availableForSale: true,
    currentlyNotInStock: false,
    quantityAvailable: 3,
    selectedOptions: [],
    price: { amount: '1790.0', currencyCode: 'NOK' },
    compareAtPrice: null,
    image: null,
    sku: 'TD-1'
  } as unknown as ShopifyProductVariant

  const customData = mapShopifySelectItem({
    product,
    variant,
    interactionId: '550e8400-e29b-41d4-a716-446655440000',
    itemListId: 'frontpage_featured',
    destinationUrl: 'https://utekos.no/produkter/utekos-techdown'
  })

  assert.equal(customData.item_list_id, 'frontpage_featured')
  assert.equal(customData.interaction_id, '550e8400-e29b-41d4-a716-446655440000')
  assert.equal(customData.currency, 'NOK')
  assert.equal(customData.items.length, 1)
  assert.equal(customData.items[0]?.variant_id, variant.id)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec tsx --test src/lib/analytics/shopifySelectItemCommerce.test.ts`  
Expected: FAIL (module not found)

- [ ] **Step 3: Implement mapper**

```ts
import type { CanonicalSelectItemCustomData } from './selectItemEvent'
import { mapShopifyViewItem } from './shopifyViewItemCommerce'
import type { ShopifyProduct } from 'types/product/ShopifyProduct'
import type { ShopifyProductVariant } from 'types/product/ShopifyProductVariant'

export type MapShopifySelectItemInput = {
  destinationUrl?: string
  interactionId: string
  itemListId: string
  product: ShopifyProduct
  quantity?: number
  variant: ShopifyProductVariant
}

export function mapShopifySelectItem(
  input: MapShopifySelectItemInput
): CanonicalSelectItemCustomData {
  const commerce = mapShopifyViewItem({
    product: input.product,
    variant: input.variant,
    quantity: input.quantity ?? 1
  })

  return {
    interaction_id: input.interactionId,
    item_list_id: input.itemListId,
    ...(input.destinationUrl ?
      { destination_url: input.destinationUrl }
    : {}),
    currency: commerce.currency,
    value: commerce.value,
    gross_value: commerce.gross_value,
    tax_value: commerce.tax_value,
    items: commerce.items
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec tsx --test src/lib/analytics/shopifySelectItemCommerce.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/analytics/shopifySelectItemCommerce.ts src/lib/analytics/shopifySelectItemCommerce.test.ts
git commit -m "$(cat <<'EOF'
feat(analytics): map Shopify products to select_item

Reuse view_item commerce mapping and attach list interaction fields.
EOF
)"
```

---

### Task 3: Reporter accepts Shopify selection + unit tests

**Files:**
- Modify: `src/lib/analytics/selectItemReporter.ts`
- Create: `src/lib/analytics/selectItemReporter.test.ts`

**Interfaces:**
- Consumes: `mapShopifySelectItem`, `createCanonicalSelectItem`, `buildSelectItemDataLayerEvent`, `startSelectItemCollectorTransport`
- Produces: `reportCanonicalSelectItem({ product, variant, itemListId, destinationUrl?, pageViewId? })`

- [ ] **Step 1: Write the failing test**

Mirror `viewItemReporter.test.ts`: inject deps if you extract `createSelectItemReporter`; otherwise test the public `reportCanonicalSelectItem` with jsdom-free stubs by extracting a factory (preferred). Minimal factory shape:

```ts
export type ReportCanonicalSelectItemInput = {
  destinationUrl?: string
  itemListId: string
  pageViewId?: string
  product: ShopifyProduct
  quantity?: number
  variant: ShopifyProductVariant
}
```

Assert: one `sendGTMEvent` payload with `event: 'select_item'`, shared `event_id`, `custom_data.item_list_id`, and collector transport started once.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec tsx --test src/lib/analytics/selectItemReporter.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement reporter change**

Replace the `customData`-only input with Shopify selection input. Inside `reportCanonicalSelectItem`:

1. `readBrowserReporterContext()` + `browserPageViewSession.ensure(...)`
2. `interactionId = globalThis.crypto.randomUUID()`
3. `customData = mapShopifySelectItem({ ... })`
4. `createCanonicalSelectItem({ eventId: globalThis.crypto.randomUUID(), ... })`
5. `sendGTMEvent(buildSelectItemDataLayerEvent(event))`
6. `return startSelectItemCollectorTransport(event)`
7. Keep try/catch with `queueMicrotask(() => { throw error })` — never block UI

Update the file header comment from “no detector is active yet” to “wired via product list click helper”.

- [ ] **Step 4: Run tests**

Run: `pnpm exec tsx --test src/lib/analytics/selectItemReporter.test.ts src/lib/analytics/selectItemEvent.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/analytics/selectItemReporter.ts src/lib/analytics/selectItemReporter.test.ts
git commit -m "$(cat <<'EOF'
feat(analytics): report select_item from Shopify selection

Generate interaction_id and commerce custom_data in the reporter.
EOF
)"
```

---

### Task 4: Click helper + ProductCard / ProductGridCard wiring

**Files:**
- Create: `src/lib/analytics/reportProductListSelectItem.ts`
- Modify: `src/components/ProductCard/ProductCard.tsx`
- Modify: `src/app/gaveguide/components/ProductGridCard.tsx`
- Modify: `types/layout.types.ts` (optional `itemListId?: string` on `ProductCardProps` if shared)

**Interfaces:**
- Consumes: `reportCanonicalSelectItem`
- Produces: `reportProductListSelectItem(input): void` — never throws to caller

- [ ] **Step 1: Implement helper**

```ts
'use client'

import { reportCanonicalSelectItem } from './selectItemReporter'
import type { ShopifyProduct } from 'types/product/ShopifyProduct'
import type { ShopifyProductVariant } from 'types/product/ShopifyProductVariant'

export type ReportProductListSelectItemInput = {
  destinationUrl: string
  itemListId: string
  product: ShopifyProduct
  variant: ShopifyProductVariant | null | undefined
}

export function reportProductListSelectItem(
  input: ReportProductListSelectItemInput
): void {
  if (!input.variant) return

  try {
    reportCanonicalSelectItem({
      product: input.product,
      variant: input.variant,
      itemListId: input.itemListId,
      destinationUrl: input.destinationUrl
    })
  } catch {
    // Fail-open for navigation; reporter already rethrows async
  }
}
```

- [ ] **Step 2: Wire ProductCard links**

On every `Link` with `data-track='ProductCardViewMoreClick'`, add:

```tsx
onClick={() => {
  reportProductListSelectItem({
    product,
    variant: selectedVariant,
    itemListId: itemListId ?? 'product_card',
    destinationUrl:
      typeof window === 'undefined' ?
        productUrl
      : new URL(productUrl, window.location.origin).toString()
  })
}}
```

Add optional prop `itemListId?: string` to `ProductCard` (default `'product_card'`). Pass explicit list ids from known parents when easy (`frontpage_featured`, `products_overview`, `gaveguide_grid`) — defaults are acceptable for this microtask if parent plumbing is large; document chosen defaults in evidence.

- [ ] **Step 3: Wire ProductGridCard**

Same `onClick` on `data-track='ProductGridCardViewMoreClick'` with `itemListId: 'gaveguide_grid'`.

- [ ] **Step 4: Manual sanity (dev)**

Run: `pnpm exec next typegen` and `pnpm exec tsc --noEmit` (or project-equivalent).  
Expected: no new errors in touched files.

- [ ] **Step 5: Commit**

```bash
git add src/lib/analytics/reportProductListSelectItem.ts \
  src/components/ProductCard/ProductCard.tsx \
  src/app/gaveguide/components/ProductGridCard.tsx \
  types/layout.types.ts
git commit -m "$(cat <<'EOF'
feat(analytics): wire select_item on product list clicks

Emit canonical select_item when product card navigation starts.
EOF
)"
```

---

### Task 5: Catalog + Meta CAPI adapter + registries

**Files:**
- Modify: `src/lib/analytics/eventCatalog.ts` (`select_item.providers`)
- Modify: `docs/analytics/event-matrix.md`
- Modify: `EVENT_CATALOG.md`
- Create: `src/lib/analytics/server/mapCanonicalSelectItemToMeta.ts`
- Create: `src/lib/analytics/server/dispatchCanonicalSelectItemToMeta.ts`
- Create: `src/lib/analytics/server/providerAdapters/metaSelectItemProviderAdapter.ts`
- Modify: `src/lib/analytics/server/providerAdapterRegistry.ts`
- Modify: `src/lib/analytics/server/providerOutboxWorkerRegistry.ts`

**Interfaces:**
- Produces: `meta:select_item` outbox worker; catalog Meta eventName `SelectItem`; Microsoft browser mapping `select_item` (MS-B; no new UET CAPI worker in this task unless live smoke proves server required)

- [ ] **Step 1: Update catalog providers**

Change `select_item` providers to:

```ts
providers: activeEventProviders('select_item', {
  commerce: true,
  googleRequired: ['item_list_id', 'items'],
  meta: {
    eventName: 'SelectItem',
    requiredParameters: ['currency', 'value', 'contents', 'content_ids']
  },
  microsoft: {
    eventName: 'select_item',
    requiredParameters: ['items']
  },
  posthog: true
})
```

Confirm `activeEventProviders` sets Meta `serverOutbox: 'active'` when `meta` is provided (same as `view_item` / `add_to_cart`). For Microsoft: if `activeEventProviders` would activate UET CAPI outbox without a worker, either (a) keep microsoft catalog entry with browser-only production detail and `serverOutbox: 'blocked_no_worker'` via the same pattern used for events that are MS-B only, or (b) add a thin MS-S worker. **Preferred for this microtask:** match `view_item_list` — MS-B via GTM, MS-S blocked — by inspecting how `view_item_list` sets `microsoft` in `eventCatalog.ts` and copying that exact shape for `select_item`.

- [ ] **Step 2: Meta mapper + dispatch + adapter**

```ts
// mapCanonicalSelectItemToMeta.ts
import type { CanonicalSelectItem } from '../selectItemEvent'
import { mapCanonicalCommerceEventToMeta } from './mapCanonicalCommerceEventToMeta'

export function mapCanonicalSelectItemToMeta(event: CanonicalSelectItem) {
  return mapCanonicalCommerceEventToMeta(event, 'SelectItem')
}
```

Clone `dispatchCanonicalAddToCartToMeta.ts` → `dispatchCanonicalSelectItemToMeta.ts` with `eventName: 'select_item'`.

```ts
// metaSelectItemProviderAdapter.ts
import { canonicalSelectItemSchema } from '../../selectItemEvent'
import { createMetaProviderAdapter } from '../createMetaProviderAdapter'
import { dispatchCanonicalSelectItemToMeta } from '../dispatchCanonicalSelectItemToMeta'

export const metaSelectItemProviderAdapter = createMetaProviderAdapter({
  dispatch: dispatchCanonicalSelectItemToMeta,
  eventName: 'select_item',
  key: 'meta:select_item',
  schema: canonicalSelectItemSchema
})
```

Register in both registries next to other Meta entries.

- [ ] **Step 3: Update docs tables**

`event-matrix.md` Microsoft column → `select_item` MS-B; MS-S blocked. Meta column → `SelectItem`.  
`EVENT_CATALOG.md` provider row for `select_item`: Meta `P/A(SelectItem)` consistent with active status after wiring.

- [ ] **Step 4: Run catalog tests**

Run: `pnpm exec tsx --test src/lib/analytics/eventCatalog.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/analytics/eventCatalog.ts \
  src/lib/analytics/server/mapCanonicalSelectItemToMeta.ts \
  src/lib/analytics/server/dispatchCanonicalSelectItemToMeta.ts \
  src/lib/analytics/server/providerAdapters/metaSelectItemProviderAdapter.ts \
  src/lib/analytics/server/providerAdapterRegistry.ts \
  src/lib/analytics/server/providerOutboxWorkerRegistry.ts \
  docs/analytics/event-matrix.md \
  EVENT_CATALOG.md
git commit -m "$(cat <<'EOF'
feat(analytics): enable Meta SelectItem outbox for select_item

Register CAPI adapter and align catalog/matrix with design.
EOF
)"
```

---

### Task 6: Meta Pixel GTM template map + unit test

**Files:**
- Modify: `config/gtm/web-meta-pixel.html`
- Modify: `scripts/tracking/web-meta-pixel-tag.test.mjs`

**Interfaces:**
- Consumes: dataLayer `select_item` entries with `event_id` + `canonical_event`
- Produces: `fbq('trackSingle', PIXEL_ID, 'SelectItem', commerceData, { eventID })`

- [ ] **Step 1: Write failing Pixel test**

Extend `web-meta-pixel-tag.test.mjs` with a case that pushes `select_item` with commerce `custom_data` (currency, gross_value, items with variant GID) and asserts queued call includes `'SelectItem'` and matching `eventID`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/tracking/web-meta-pixel-tag.test.mjs`  
Expected: FAIL (SelectItem not mapped)

- [ ] **Step 3: Update template**

In `EVENT_NAMES` add:

```js
select_item: 'SelectItem',
```

In `eventData`, include `select_item` in the commerce branch:

```js
if (
  eventName === 'view_item' ||
  eventName === 'select_item' ||
  eventName === 'add_to_cart' ||
  eventName === 'begin_checkout'
) {
  return commerceData(customData);
}
```

- [ ] **Step 4: Run Pixel test**

Run: `node --test scripts/tracking/web-meta-pixel-tag.test.mjs`  
Expected: PASS

- [ ] **Step 5: Commit (app/template only — no GTM publish)**

```bash
git add config/gtm/web-meta-pixel.html scripts/tracking/web-meta-pixel-tag.test.mjs
git commit -m "$(cat <<'EOF'
feat(gtm): map select_item to Meta SelectItem pixel

Share event_id for Pixel↔CAPI dedupe once the tag is published.
EOF
)"
```

**STOP:** Do not publish GTM. Ask for explicit approval and classify under `DEPLOYMENT.md` before any publish.

---

### Task 7: Verification gate + evidence (must be green before event #2)

**Files:**
- Create: `docs/analytics/evidence/ce-select-item-three-provider-live.md`
- Modify: `docs/analytics/known-deviations.md` (if a DEV exists for unwired select_item)
- Optional smoke helper under `scripts/tracking/` only if ATC scripts are cloned for this event

**Verification checklist (from design §Verification):**

1. Consent on → dataLayer object `select_item` with catalog parameters (`interaction_id`, `item_list_id`, currency/value, single `items[]`, `event_id`)
2. `POST /api/events/select-item` 2xx; Meta Pixel/OpenBridge `SelectItem` shares `event_id` when marketing consent + Pixel tag live
3. Pink-lens `marketing.event_ledger` + `ops.provider_dispatch_attempts` for `google` and `meta` (Microsoft: browser UET network or documented MS-B evidence; `skipped_unqualified`/`blocked_no_worker` only if catalog says so)
4. Meta / Google / Microsoft surfaces show the event in the expected window (or fail-closed reason recorded)
5. Evidence note with SHA + sample `event_id`
6. `DEPLOYMENT.md` classification before app deploy / GTM publish

- [ ] **Step 1: Local/unit gate**

```bash
pnpm exec tsx --test \
  src/lib/analytics/selectItemEvent.test.ts \
  src/lib/analytics/shopifySelectItemCommerce.test.ts \
  src/lib/analytics/selectItemReporter.test.ts \
  src/lib/analytics/eventCatalog.test.ts
node --test scripts/tracking/web-meta-pixel-tag.test.mjs
pnpm exec next typegen
pnpm exec tsc --noEmit
```

Expected: all PASS / no new errors in scope.

- [ ] **Step 2: Browser smoke (production or approved preview after deploy + GTM publish approval)**

Procedure (mirror ATC dedupe evidence):

1. Open a page with a product card (e.g. `/` or `/produkter`) with marketing+analytics consent accepted
2. Click `[data-track=ProductCardViewMoreClick]`
3. Capture dataLayer `select_item`, Pixel `/tr` or OpenBridge `SelectItem`, POST `/api/events/select-item`
4. Correlate ledger + outbox; authorize cron drain only if already standard for ATC (`GET /api/cron/provider-outbox-dispatch` with secret) — do not invent new cron auth
5. Record shared UUID table like `ce-add-to-cart-meta-browser-server-dedupe.md`

- [ ] **Step 3: Write evidence**

Create `docs/analytics/evidence/ce-select-item-three-provider-live.md` with charter block, method, shared UUID table, provider statuses, conclusion `LIVE_SELECT_ITEM_THREE_PROVIDER_PROVEN` or fail-closed reason. End with: **Do not auto-continue to `add_to_wishlist`.**

- [ ] **Step 4: Commit evidence only after live proof**

```bash
git add -f docs/analytics/evidence/ce-select-item-three-provider-live.md docs/analytics/known-deviations.md
git commit -m "$(cat <<'EOF'
docs(analytics): record select_item three-provider evidence

Prove dataLayer, ledger, and provider dedupe for queue item 1.
EOF
)"
```

- [ ] **Step 5: Hard stop**

Do not start queue item 2 (`add_to_wishlist`). Return GO/NO-GO for select_item only.

---

## Self-review (writing-plans)

1. **Spec coverage:** Purpose, locked decisions, architecture, event #1 row, error handling, GTM/sGTM, verification gate, touchpoints — each mapped to Tasks 1–7. Events 2–11 intentionally absent.
2. **Placeholder scan:** No TBD/TODO steps; concrete files, schemas, commands, and commit messages included.
3. **Type consistency:** `CanonicalSelectItemCustomData` gains currency/value/gross_value/tax_value; mapper/reporter/Meta commerce mapper all use those names; Meta event string is always `SelectItem`.

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-24-select-item-implementation.md`. Two execution options:

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks
2. **Inline Execution** — execute with executing-plans and checkpoints

Which approach?
