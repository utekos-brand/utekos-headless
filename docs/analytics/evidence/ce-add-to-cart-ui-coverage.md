# Evidence — AddToCart UI call-site coverage

**Date:** 2026-07-22  
**Start SHA:** `184086af7b5378522b59c40ac262ddd6898198fd`  
**Tip SHA:** `d0f8cf3f8f1b5d85fd8b1a3ca76e1df2a2c6a502`  
**Task:** SAFE — AddToCart UI call-site coverage (not CE-\*)  
**Conclusion:** `ATC_UI_CALL_SITE_COVERAGE_CLOSED`

## Goal

Every UI that successfully adds a Shopify line to the cart reports
canonical `add_to_cart` exactly once after mutation success.

## Architecture

Shared helper
`src/lib/analytics/addProductLineAndReportAddToCart.ts` awaits
`addLines`, resolves `cartId`, then calls
`reportCanonicalAddToCart`. React wrapper:
`src/hooks/useCanonicalAddToCart.ts`.

Analytics remains call-site only (not in the XState cart machine)
to avoid double-firing paths that already report.

## Closed gaps (previously fire-and-forget `ADD_LINES`)

| Surface | File | Now reports via |
| --- | --- | --- |
| Product card quick-buy | `src/components/ProductCard/ProductCard.tsx` | `useCanonicalAddToCart` |
| Gaveguide grid | `src/app/gaveguide/components/ProductGridCard.tsx` | `useCanonicalAddToCart` |
| Isbading Comfyrobe | `src/app/inspirasjon/isbading/sections/ComfyrobeQuickBuy.tsx` | `useCanonicalAddToCart` |
| Empty-cart recommendation | `src/components/cart/EmptyCart/RecommendedItem.tsx` | `useCanonicalAddToCart` |
| Cart upsell | `src/components/cart/UpsellItem.tsx` | `useCanonicalAddToCart` |
| NBCC product cards | `src/app/nbcc/components/NbccProductCardActions.tsx` | `useCanonicalAddToCart` + full `ShopifyProduct` from parent |
| Mikrofiber purchase | `src/hooks/useMicrofiberLogic.ts` | `useCanonicalAddToCart` + server-fetched `utekos-mikrofiber` |

## Already-correct paths (unchanged)

- `src/hooks/useAddToCartAction.ts`
- `src/hooks/usePurchaseLogic.ts`
- `src/app/skreddersy-varmen/components/useLandingPurchaseLogic..tsx`

## Grep gate (2026-07-22)

UI `type: 'ADD_LINES'` outside mutation plumbing: **zero**.

Remaining `ADD_LINES` only in:

- `src/lib/state/createCartMutationMachine.ts`
- `src/hooks/useCartMutations.ts`

## Verification performed

- Unit tests:
  `pnpm exec tsx --test src/lib/analytics/addProductLineAndReportAddToCart.test.ts`
  → 3 pass (report on success; no report on failure; cookie cartId
  fallback)
- Inventory grep for `ADD_LINES` and `reportCanonicalAddToCart`
  call sites

## Verification not claimed

- Live browser smoke on ProductCard / NBCC / mikrofiber against
  production providers (not run in this change)
- Deploy of this tip

## Commits

1. `feat(analytics): add shared ATC report after cart line mutation`
2. `feat(analytics): add useCanonicalAddToCart hook`
3. `fix(analytics): report add_to_cart from product card and cart suggestion CTAs`
4. `fix(analytics): report add_to_cart from NBCC product cards`
5. `fix(analytics): report add_to_cart from mikrofiber purchase with real Shopify product`
