# Comfyrobe Landing Page Design

## Goal

Create `/comfyrobe` as a mobile-first, conversion-focused landing page for paid traffic from Meta, Microsoft Advertising and potentially Google, while preserving Utekos' existing visual system, Shopify product truth, canonical analytics and cart behavior.

## Strategic direction

The page uses a broad category-entry-point strategy rather than positioning Comfyrobe only for ice bathing. The first screen connects the product to the broad buying situation "varme og beskyttelse når været skifter", while later sections refresh multiple usage contexts: rain and wind, after activity, camping and motorhome life, boat and cold spectator settings.

Brand and product are shown immediately, copy is kept off imagery, and the same Utekos colors, typefaces, terminology and product assets are repeated consistently. The page combines a direct sales objective with long-term brand-building signals rather than becoming a generic discount funnel.

## Architecture

- `src/app/comfyrobe/page.tsx` remains a Server Component and owns metadata, route composition and Suspense.
- Product data is fetched once on the server through the existing cached Shopify product-page data function.
- Only the purchase experience and scenario tabs are Client Components.
- Variant selection uses the existing `useVariantState`, `renderOptionComponent`, `AddToCart`, Klarna and canonical `view_item` reporter.
- No duplicate cart transport, analytics event or product-price source is introduced.
- Static sections are independently rendered Server Components.

## Page flow

1. Purchase hero: Utekos + Comfyrobe visible immediately, broad promise, lifestyle-first gallery, price, Klarna, variant/size selection and Add to Cart.
2. Product-proof strip: four quickly scannable product facts.
3. Interactive usage scenarios: four accessible tabs that expand the product's mental availability across buying situations.
4. Technical proof: HydroGuard, SherpaCore, taped seams, YKK and movement details.
5. Fit confidence: unisex fit, layers and wet clothing, with size-guide and care links.
6. FAQ: resolves waterproofing, use, fit, care and purchase objections.
7. Final CTA: returns the visitor to the purchase controls on the same page.

## Accessibility

- Semantic landmarks and one H1.
- Text is never required to be read on top of photography.
- Theme tokens provide all colors; no new hardcoded palette is introduced.
- Full-contrast foreground tokens are used for body text.
- Interactive controls have visible focus states and minimum 44 px targets.
- Scenario tabs implement `tablist`, `tab`, `tabpanel`, `aria-selected` and labelled relationships.
- FAQ uses native `details`/`summary` behavior.
- Motion is non-essential and disabled through `motion-reduce` utilities.

## Performance

- Server-fetch product data once and pass it into the client island.
- Reuse optimized `next/image` assets with correct responsive `sizes`.
- Eager-load only the first gallery image.
- Avoid adding libraries or a page-wide Client Component.
- Preserve existing remote cache tags and product cache lifetime.

## Measurement

The page reports the existing canonical `view_item` whenever a resolved product/variant context changes. Add to Cart and checkout continue through the existing canonical cart components, preserving provider dispatch and `event_id` deduplication. No provider-specific pixel call is added to UI code.

## Success criteria

- `/comfyrobe` renders a complete purchase journey without redirecting to `/produkter/comfyrobe`.
- Price, availability, variants and checkout behavior remain Shopify-driven.
- Mobile users can understand the product, select a variant and add it to cart without hunting through the page.
- The page passes type checking/build, existing canonical-event behavior remains unchanged, and the new gallery-order unit test passes.
