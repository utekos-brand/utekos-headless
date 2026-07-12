# Task 1 report: browser ownership, consent and funnel correctness

Status: DONE

## Implemented

- Added one typed browser dispatcher and migrated browser business-event call sites to it.
- Statically excluded `Purchase` and `Refund` from the browser dispatcher. Browser `userData` accepts only `fbp`, `fbc`, `external_id`, and `email_hash`; raw email, phone, address, and IP fields are forbidden.
- Removed raw newsletter email from browser tracking and removed the duplicate direct newsletter tracking path.
- Added a pure checkout-capture consent policy shared by `CheckoutButton` and `usePurchaseLogic`. Capture now runs when Google Analytics, Google Ads, Meta, or Microsoft attribution consent is authorized, including statistics-only Google Analytics consent.
- Kept Shopify `orders-paid` as purchase owner and removed the Klarna return-page purchase producer.
- Changed Microsoft UET to one business event per logical action. `begin_checkout` keeps `AutoEvent_begin_checkout` without the canonical duplicate. Removed the unused browser purchase helper and `window.uet_report_conversion` declaration.
- Added `view_cart` once per cart-drawer open cycle with reset on close, `remove_from_cart` after successful mutation, and `search` only on explicit submission.
- Strengthened the commerce smoke contract to require Meta Pixel and Microsoft UET network evidence after consent and to drive `search`, `view_cart`, and confirmed `remove_from_cart` through stable role/data attributes. It still creates no purchase.

## TDD evidence

- RED: 8 focused regressions failed for the expected missing-policy/duplicate/ownership reasons.
- GREEN: focused tests passed, 18/18.
- Full tracking test suite passed, 88/88.

## Verification

- `pnpm exec tsx --test src/lib/tracking/consent/hasBrowserTrackingConsent.test.ts src/lib/tracking/cart/buildCartTrackingData.test.ts src/lib/tracking/microsoft-uet/trackMicrosoftUetEvent.test.ts src/lib/tracking/architecture/trackingOwnership.test.ts` — PASS (18/18).
- All `src/lib/tracking/**/*.test.ts` through `pnpm exec tsx --test` — PASS (88/88).
- `pnpm exec tsc --noEmit` — PASS.
- `node --check scripts/tracking/verify-commerce-event-flow.mjs` — PASS.
- `git diff --check` — PASS.
- Focused ESLint — blocked only by the pre-existing `react-hooks/set-state-in-effect` violation at `src/components/cart/CartLineItem.tsx:43`, unrelated to the added stable tracking attribute.

## Blocked or intentionally not run

- The live commerce smoke was not executed because its default target is production and it deliberately emits live consent-qualified commerce events. The deterministic smoke path and fail-closed assertions were verified statically and by syntax/type/test gates.
- No production deploy, GTM publish, provider mutation, Supabase mutation, or real purchase was performed.

## Scope

- No Supabase, GTM, GCP, or Vercel files were changed or staged for Task 1.
- Pre-existing Task 2 receipt-observation hunks in `scripts/tracking/verify-commerce-event-flow.mjs` were deliberately left unstaged.
