# Canonical events

Status date: 2026-07-17

The application owns event meaning. GTM and sGTM are delivery
adapters, not the event inventory or source of truth.

## Active inventory

| Event | Owner | Detection | Delivery | Status |
| --- | --- | --- | --- | --- |
| `page_view` | Next.js application | Initial render and App Router URL change | `dataLayer` -> web GTM -> `/__sgtm` -> GA4, plus consent-aware first-party collection | Active; ledger only (no server outbox) |
| `view_item` | Next.js application | Resolved product and selected variant on a product page or landing purchase context (`/skreddersy-varmen`) | GTM/sGTM + ledger + Google Data Manager + Meta CAPI | Active |
| `add_to_cart` | Shopify cart service | After accepted cart mutation | GTM/sGTM + ledger + Google Data Manager + Meta CAPI | Active |
| `begin_checkout` | Shopify checkout service | Before checkout redirect with valid checkout URL | GTM/sGTM + ledger + Google Data Manager + Meta CAPI; persists checkout consent snapshot | Active |
| `purchase` | Shopify orders-paid webhook | Verified order-paid webhook | Ledger (operational) + Google Data Manager + Meta CAPI when checkout consent granted | Active |
| `refund` | Shopify refunds-create webhook | Verified refund webhook | Ledger (operational) + Google Data Manager | Active |
| Remaining behavior/commerce/lead/form/UX events | Storefront detectors / reporters | See `EVENT_CATALOG.md` | First-party API + Google Data Manager; Meta where catalog specifies | Active (schemas, collectors, adapters); some detectors still reporter-only |
| `add_shipping_info`, `add_payment_info`, `checkout_error`, `payment_error` | — | — | — | `blocked_source` until Shopify Customer Events/Web Pixels source is chosen |

GA4 Enhanced Measurement page views, browser-history page views
and the Google tag's automatic `send_page_view` must remain
disabled. This avoids double counting and makes the application
event the only semantic source.

## `page_view` v1 contract

The canonical payload is available at `canonical_event` on the
GTM `page_view` event. Required fields are:

- `schema_version`, `event_name`, `event_id`, `page_view_id`
- `event_time` as UTC ISO 8601 with milliseconds
- `source`, `environment`, `page_url`, `page_title`
- a Cookiebot consent snapshot

Optional, validated context includes `referrer_url`, `click_id`,
`browser_id`, `impression_id`, `user_data`, `custom_data`,
`client_ip_address`, `event_device_info`, `region_code` and
`location`. Provider adapters translate these neutral names to
Google, Meta and Microsoft fields.

The browser does not prompt for precise geolocation during
`page_view`. IP and coarse location are server enrichment fields.
Precise browser location requires a separate explicit browser
permission and use case.

Existing browser identifiers are read only when the matching
Cookiebot category is already granted. The event does not create
identifier cookies.

## Server ingestion foundation

The server ingestion foundation includes tested first-party Route
Handlers at `POST /api/events/page-view` and
`POST /api/events/view-item`. Their browser transports wait for a
Cookiebot decision and collect only when analytics or marketing
consent is granted.

At the server trust boundary:

- the complete payload is reparsed with the canonical Zod schema;
- request-derived IP address, user agent and coarse location
  replace browser-supplied values;
- marketing identifiers and hashed user data are removed unless
  marketing consent is granted; and
- events with both analytics and marketing consent denied are
  rejected before storage.

The generic Postgres adapter persists the canonical event in
`marketing.event_ledger` and its provider intents in
`ops.provider_dispatch_attempts` within one transaction. Stable
idempotency keys use the canonical event name and `event_id`; a
ledger conflict returns `duplicate` without creating new outbox
rows. No schema change is required.

The Route Handler requires same-origin JSON, rejects bodies over
32 KiB, returns no-store responses, and derives IP, user agent
and coarse location with `@vercel/functions`. Raw database errors
and event payloads are not returned or logged.

The deployed planner can still create legacy Meta/Microsoft server rows for
`page_view` and a Microsoft row for `view_item`; no approved worker may replay
those rows. The local foundation changes routing so `page_view` creates no
server-outbox rows and a qualified `view_item` creates only the catalog-owned
Google Data Manager and Meta CAPI rows. Google and Meta consume the same
canonical payload but retain independent attempt counts, statuses and retry
histories.

The deployed route currently starts the combined Meta/Google batch through
Next.js `after()`. The local foundation replaces this with registered generic
workers and configures the authenticated
`/api/cron/provider-outbox-dispatch` route every five minutes. That schedule
is not present in the currently deployed `vercel.json`; it becomes the durable
retry path only after this foundation is shipped and verified.
Google authenticates with Vercel OIDC and Google Workload Identity
Federation, then sends to Data Manager with
`GOOGLE_DATA_MANAGER_VALIDATE_ONLY=false`. An accepted response is
stored as `accepted_unverified`, including request and validation
metadata. The adapter caps `additionalItemParameters` at the live
provider limit of 24; the canonical ledger retains every source
field. The local patch maps canonical `event_id` to browser
`transaction_id` and Data Manager's top-level `transactionId`, which Google
documents as the cross-source deduplication field. It also omits request IP
unless server-derived country is known and outside the EEA, UK and
Switzerland. Neither local correction is deployed yet.

The production event
`a28a8f3c-ba90-4006-9dd8-429072a3c772` reached Meta and Google on
their first independent attempts after the executed-ingestion cutover.
Google returned request ID
`a9ebe80f-9c54-4bd9-9971-6c4c7bb1a43c` with
`validate_only=false`; Meta returned `events_received=1`.
This proves provider acceptance, not that the published GTM tag forwarded
`transaction_id` or that GA4 counted the event only once.

Microsoft UET CAPI maps `page_view_id` to `pageLoadId` and uses
`event_id` for deduplication. Microsoft ID sync remains a
separate consent-gated browser responsibility when audience
matching or remarketing is enabled.

The pre-consent Google `dataLayer` event remains separate from
first-party persistence. A consent update may release a held
canonical event to the collector, but it must never emit a second
Google event.

## `view_item` v1 contract

`view_item` reuses the canonical event context and the
`page_view_id` from the page view that owns the product render.
Its `custom_data` contains one provider-neutral commerce item
with Shopify product and variant ids, currency, net and gross
values, tax data, availability, selected options and collection
context.

The product reporter emits once for each resolved product/variant
context after the owning `page_view` has been emitted. This covers
product pages and the `/skreddersy-varmen` landing purchase section.
Re-rendering the same context is deduplicated; a committed variant
change is a new legitimate `view_item`. The collector re-evaluates
Cookiebot at send time, removes marketing identifiers without
marketing consent and replaces browser-supplied IP, user-agent
and coarse location with request-derived values at the server
boundary.

## Event foundation

[`EVENT_CATALOG.md`](EVENT_CATALOG.md) and
`src/lib/analytics/eventCatalog.ts` are the authoritative human- and
machine-readable allowlists for all 29 v1 decisions. All non-blocked
catalog events now have implemented schemas in the discriminated
canonical union. The four `blocked_source` entries remain decisions
without runtime detectors until an authoritative checkout source is
approved.

This foundation is implemented locally and is not deployed. Provider routing
reads the catalog and can enqueue only an explicitly
active provider/event pair. A registry invariant test requires the
catalog's active outbox pairs, adapter keys and worker keys to be
identical. Queue claim, retry, receipt, dead-letter and Postgres logic
are generic; a new event therefore adds its detector, schema, provider
mappings/adapters and tests without a new queue or retry architecture.
The existing Supabase/Postgres outbox remains the durable queue;
Vercel Workflow and Vercel Queues are deliberately not added as a
second delivery system.

Ledger insertion and provider-row creation are transactionally
idempotent. Completion is guarded by the claimed attempt generation so a
stale worker cannot commit over a newer claim. Provider transport remains
at-least-once across the crash window after external acceptance and before
the local receipt commit; retries preserve Meta `event_id` and Google
`transactionId` for provider deduplication. Both active HTTP transports have
a 10-second request deadline; timeout failures are retryable.

## Browser verification gate

Before publish, prove in GTM Preview and sGTM Preview that:

1. The Google base tag is processed before `page_view` and has
   `send_page_view=false` and
   `server_container_url=https://utekos.no/__sgtm`.
2. One initial view and one event per App Router URL change are
   emitted.
3. Initial external referrer and subsequent virtual referrers are
   correct.
4. Denied consent creates no optional cookies; Google cookieless
   pings may still use `/__sgtm` in Advanced Consent Mode.
5. Meta, Microsoft and other non-Google adapters do not fire
   without their required consent.
6. The actual browser/sGTM Google request for `view_item` contains
   `transaction_id` equal to Data Manager `transactionId`. If this cannot be
   proved, Data Manager must remain validate-only or one Google route must be
   disabled before executed ingestion is approved.
