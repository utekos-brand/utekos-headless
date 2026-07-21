# Event-catalog integration for the universal signal contract

This document is the exact integration contract for the current
local `src/lib/analytics/eventCatalog.ts`.

Do not replace the complete local file from a stale remote copy.
Apply these changes to the verified local HEAD and return the
complete resulting file.

## 1. Imports

Add:

```ts
import type {
  CanonicalEventSignalPolicy,
  ProviderSignalDeliveryPolicy
} from './canonicalSignalContract'
import {
  attachEventSignalContracts,
  resolveProviderSignalDelivery,
  type EventSignalProfile
} from './eventCatalogSignalContracts'
```

## 2. Provider catalog type

Add this required field to `ProviderCatalogEntry`:

```ts
signalDelivery: ProviderSignalDeliveryPolicy
```

## 3. Event catalog type

Add this required field to `EventCatalogEntry`:

```ts
signals: CanonicalEventSignalPolicy
```

During construction, use a base type without the attached field:

```ts
type EventCatalogEntryBase = Omit<EventCatalogEntry, 'signals'>
```

## 4. Provider helper

Change `providerMapping` so every provider entry receives a
complete policy:

```ts
function providerMapping(
  input: Omit<ProviderCatalogEntry, 'signalDelivery'>
): ProviderCatalogEntry {
  return {
    ...input,
    signalDelivery: resolveProviderSignalDelivery(
      input.transport
    )
  }
}
```

`notRelevantProvider`, `plannedProviders`,
`activeEventProviders`, `pageViewProviders`, `viewItemProviders`,
`purchaseProviders` and `refundProviders` must continue using
`providerMapping`.

No provider entry may construct `signalDelivery` independently.

## 5. Base catalog

Rename:

```ts
export const eventCatalog = {
```

to:

```ts
const eventCatalogBase = {
```

Change the terminal `satisfies` clause to:

```ts
} as const satisfies Record<
  string,
  EventCatalogEntryBase
>
```

## 6. Exhaustive profile map

Add immediately after `eventCatalogBase`:

```ts
export const eventSignalProfiles = {
  page_view: 'website',
  view_item_list: 'website',
  select_item: 'website',
  view_item: 'website',
  add_to_wishlist: 'website',
  add_to_cart: 'server_mutation',
  remove_from_cart: 'server_mutation',
  view_cart: 'website',
  begin_checkout: 'server_mutation',
  add_shipping_info: 'blocked_browser',
  add_payment_info: 'blocked_browser',
  purchase: 'transaction_attribution',
  refund: 'transaction_attribution',
  search: 'website',
  view_search_results: 'website',
  view_promotion: 'website',
  select_promotion: 'website',
  generate_lead: 'server_mutation',
  form_start: 'website',
  form_submit: 'server_mutation',
  form_error: 'server_mutation',
  filter_apply: 'website',
  sort_apply: 'website',
  variant_select: 'website',
  size_guide_view: 'website',
  checkout_error: 'blocked_mixed',
  payment_error: 'blocked_mixed',
  scroll_depth: 'website',
  video_progress: 'website'
} as const satisfies {
  readonly [K in keyof typeof eventCatalogBase]: EventSignalProfile
}
```

## 7. Final exported catalog

Add:

```ts
export const eventCatalog = attachEventSignalContracts(
  eventCatalogBase,
  eventSignalProfiles
)
```

Existing exports must continue deriving from the final
`eventCatalog`, not `eventCatalogBase`:

```ts
export type CatalogEventName = keyof typeof eventCatalog

export const canonicalEventNames = Object.freeze(
  Object.keys(eventCatalog) as CatalogEventName[]
)
```

## 8. Identifier policy text

Replace `providerIdentifierPolicy` with wording that also
requires completeness:

```ts
export const providerIdentifierPolicy =
  'Direct contact fields and free text are forbidden. Hashed contact identifiers, external IDs, browser/click IDs, and request-context IP addresses may be present only when required by an approved provider mapping and gated by the documented consent policy. Every eligible provider mapping must emit every available signal declared by its eventCatalog signalDelivery contract; unavailable signals must retain an explicit audited reason and must never be fabricated.'
```

## 9. Existing tests

Do not remove or weaken `eventCatalog.test.ts`.

Add the separate exhaustive test:

```text
src/lib/analytics/eventCatalog.signal-contract.test.ts
```

The existing 29-event key/order test, lifecycle test, provider
status truth and GA automatic-event decisions remain unchanged.

## 10. Validator ownership

Delete the previous derived-policy file:

```text
src/lib/analytics/canonicalSignalPolicy.ts
```

`validateCanonicalSignalContract` must use:

```ts
const policy = getEventCatalogEntry(event.event_name).signals
```

It must not infer policy again from trigger sources or
operational purpose.

## 11. Provider-specific correctness

- Meta `fbclid` is canonical evidence and is converted to
  provider-valid `fbc`; do not invent a raw Meta payload field.
- Microsoft `msclkid`, client IP, user-agent and external ID are
  emitted when available and consented.
- Google click identifiers and device data are mapped only where
  supported and permitted. Google Ads/Analytics IP must be
  conditionally excluded for EEA, UK and Switzerland according to
  the active Data Manager contract.
- Supabase persists canonical values and audit state; provider
  payloads are not canonical truth.
