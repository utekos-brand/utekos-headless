# Canonical stale and missing commerce events — design

Date: 2026-07-24  
Status: Approved in brainstorming (approach A)  
Charter context: CanonicalEvent program; one active microtask at a time at implementation

## Purpose

Restore and complete Meta / Google / Microsoft parity for events that are stale in Meta Events Manager (8–9 days) or missing, using the **same canonical logic** as proven funnel events (`add_to_cart`, `view_item`, `begin_checkout`): app reporter → `dataLayer` + `/api/events/*` → ledger → provider outbox, with shared `event_id` for Meta Pixel↔CAPI dedupe, verified via GTM / sGTM.

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Naming / ownership | **A — Canonical first** (snake_case app contract; PascalCase is GTM/provider facing) |
| Checkout events in scope | **Yes** (`add_shipping_info`, `add_payment_info`) |
| Checkout authoritative source | **Shopify Checkout UI Extensibility** |
| Delivery order | **Funnel holes → engagement → checkout extensions** |
| Engagement naming | **Hybrid:** `scroll_depth` replaces `LandingScrollDepth`; new canonical `hero_interact`, `open_quick_view`, `interact_with_accordion`, `view_category` |
| Wishlist | **Minimal persistence first**, then emit post-mutation |
| Delivery approach | **A — Clone-the-proven-path** (not GTM-only, not batch-all) |

## Non-goals

- Treating PascalCase Meta names as the app contract
- GTM-only customs without ledger / three-provider path
- Dual `LandingScrollDepth` alongside `scroll_depth`
- Meta via sGTM (Pixel↔CAPI remains the Meta dedupe path; sGTM stays GA4 + Conversion Linker)
- Full customer-account wishlist sync (local persistence is enough for this design)
- Implementing more than one event before the previous event’s verification gate is green

## Architecture

```text
UI trigger (post-mutation where catalog requires it)
  → reporter: crypto.randomUUID() as event_id
  → sendGTMEvent({ event, event_id, canonical_event, ... })
  → POST /api/events/<kebab> (consent-gated)
       → marketing.event_ledger (idempotent event_name:event_id)
       → provider outbox: Meta CAPI / Google DM / Microsoft where workers exist
Web GTM (/__gtg): snake_case → provider names + Meta eventID = event_id
sGTM (/__sgtm): GA4 (+ Conversion Linker)
Checkout UI Extensions → same ingest for add_shipping_info / add_payment_info
```

Reference implementation pattern: existing `addToCartReporter` / `/api/events/add-to-cart` / Meta GTM template (`config/gtm/web-meta-pixel.html`) / evidence `ce-add-to-cart-meta-browser-server-dedupe.md`.

## Event queue (strict one-at-a-time)

| # | Canonical | Owner / trigger | Today | Meta GTM name |
|---|-----------|-----------------|-------|---------------|
| 1 | `select_item` | Product list/card click → wire `selectItemReporter` | Catalog+API, unwired | `SelectItem` (per GTM map) |
| 2 | `add_to_wishlist` | Minimal wishlist store + button; emit after persist | Catalog+API, no store | `AddToWishlist` |
| 3 | `view_cart` | `CartDrawer` | Verify params + providers + dedupe | `ViewCart` |
| 4 | `remove_from_cart` | `CartLineItem` | **GO (EM confirmed)** — `t30107-RemoveFromCart-1784855701-c9f73fc8` + `t30107-RemoveFromCart-1784855899-f20f7723` | `RemoveFromCart` |
| 5 | `scroll_depth` | `ScrollDepthObserver`; replaces LandingScrollDepth | **GO (EM confirmed)** — `9a4c0da9-aaeb-45d3-bbd4-7a1a2ffa614b` (90) + `0ec09d07-81be-417b-b517-2f87bfbfd1eb` (75) + `cde6d55a-a56e-4f78-8164-5199b059630a` (50) + `1b3a412c-e3c6-4978-ac26-d123216e769a` (25) | `LandingScrollDepth` (existing map) |
| 6 | `view_category` | Category/collection view | New catalog + reporter | `ViewCategory` |
| 7 | `hero_interact` | Hero «Se mer» (`ReadMoreHeroClick`) | New | `HeroInteract` |
| 8 | `interact_with_accordion` | PDP accordion | New | `InteractWithAccordion` |
| 9 | `open_quick_view` | TechDown quick view open | New | `OpenQuickView` |
| 10 | `add_shipping_info` | Checkout UI Extension | Unlock `blocked_source` | `AddShippingInfo` |
| 11 | `add_payment_info` | Checkout UI Extension | Unlock `blocked_source` | `AddPaymentInfo` |

Microsoft: browser via web GTM where catalog says MS-B; add/extend server workers only inside the same event task when required.

## Wishlist detail

- Persist product/variant id + timestamp in a minimal client store (localStorage).
- Emit `add_to_wishlist` only after successful mutation (`wishlist_mutation_id` + standard item fields).
- Do not emit on bare login-dialog click.

## Checkout UI Extensions detail

- Extensions observe shipping completed / payment info submitted targets.
- POST to first-party `/api/events/add-shipping-info` and `/api/events/add-payment-info` with Zod canonical payload + `event_id`.
- Consent: fail-closed using the same checkout attribution/consent posture as `begin_checkout` / Klarna.
- Unlock catalog `blocked_source` only after ingest path exists.
- Primary path for checkout steps: ledger + CAPI / Google DM. Pixel parity in checkout only if the same `event_id` can be shared; otherwise document server-primary explicitly in evidence.

## Error handling

- Fail-closed Zod + consent; no provider call without accepted ledger row.
- UI must not block on reporter failure; ledger reject ⇒ no outbox row.
- Extension: retry with backoff; no silent drop without audit.
- Idempotency: ledger `event_name:event_id`; provider `provider+event_name+event_id`.

## GTM / sGTM

- Per event: minimal web GTM diff; **explicit user approval before each GTM publish**.
- Disable/remove legacy PascalCase tags that double-fire once canonical is live.
- No Meta through sGTM.

## Verification gate (must be green before next event)

1. Consent on → dataLayer object with full catalog parameters  
2. `/api/events/...` 2xx; Meta Pixel/OpenBridge shares `event_id` when Meta browser is active  
3. Pink-lens ledger + `provider_dispatch_attempts`  
4. Meta / Google / Microsoft dashboards show the event in the expected window  
5. Short evidence note under `docs/analytics/evidence/` (SHA + sample `event_id`)  
6. `DEPLOYMENT.md` classification before app deploy / GTM publish  

Unit tests: Zod + reporter for that event only.

## Components / files (expected touchpoints)

- Reporters + Zod: `src/lib/analytics/*Reporter.ts`, `*Event.ts`
- Routes: `src/app/api/events/*`
- Catalog / matrix / FLOW updates when lifecycle changes
- UI: product cards, `WishlistButton`, `CartDrawer`, `CartLineItem`, `ScrollDepthObserver`, category pages, hero `MotionContentView`, `ProductPageAccordion`, TechDown `NewProductLaunchSectionView` / `QuickViewModal`
- GTM: web container mapping (publish gated)
- New: Checkout UI Extension package (Shopify) + wishlist store module

## Open implementation details (resolve in first relevant microtask, not ambiguous here)

- Exact Shopify Checkout UI Extension target APIs for shipping vs payment
- Whether checkout Pixel can share `event_id` with server ingest
- Exact Meta GTM template row names for new engagement events (extend existing PascalCase map)

## Success criteria for the program

All eleven queue items have green verification gates; Meta Events Manager no longer shows 8–9 day staleness for the mapped set; `add_payment_info` / `add_shipping_info` are no longer `blocked_source` without a real source; evidence docs exist per event.
