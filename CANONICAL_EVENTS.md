# Canonical events

Status date: 2026-07-15

The application owns event meaning. GTM and sGTM are delivery adapters,
not the event inventory or source of truth.

## Active inventory

| Event | Owner | Detection | Delivery | Status |
| --- | --- | --- | --- | --- |
| `page_view` | Next.js application | Initial render and App Router URL change | `dataLayer` -> web GTM -> `/__sgtm` -> GA4 | Deployed with web GTM version 113; browser provider verification remains |

GA4 Enhanced Measurement page views, browser-history page views and the
Google tag's automatic `send_page_view` must remain disabled. This avoids
double counting and makes the application event the only semantic source.

## `page_view` v1 contract

The canonical payload is available at `canonical_event` on the GTM
`page_view` event. Required fields are:

- `schema_version`, `event_name`, `event_id`, `page_view_id`
- `event_time` as UTC ISO 8601 with milliseconds
- `source`, `environment`, `page_url`, `page_title`
- a Cookiebot consent snapshot

Optional, validated context includes `referrer_url`, `click_id`,
`browser_id`, `impression_id`, `user_data`, `custom_data`,
`client_ip_address`, `event_device_info`, `region_code` and `location`.
Provider adapters translate these neutral names to Google, Meta and
Microsoft fields.

The browser does not prompt for precise geolocation during `page_view`.
IP and coarse location are server enrichment fields. Precise browser
location requires a separate explicit browser permission and use case.

Existing browser identifiers are read only when the matching Cookiebot
category is already granted. The event does not create identifier cookies.

## Server ingestion foundation

The server ingestion foundation includes a tested first-party Route Handler
at `POST /api/events/page-view`. The route is not a live browser data flow
until the consent-aware client transport is added and the change is merged.

At the server trust boundary:

- the complete payload is reparsed with the canonical Zod schema;
- request-derived IP address, user agent and coarse location replace
  browser-supplied values;
- marketing identifiers and hashed user data are removed unless marketing
  consent is granted; and
- events with both analytics and marketing consent denied are rejected
  before storage.

The Postgres adapter persists the canonical event in
`marketing.event_ledger` and its provider intents in
`ops.provider_dispatch_attempts` within one transaction. Stable
idempotency keys use the canonical event name and `event_id`; a ledger
conflict returns `duplicate` without creating new outbox rows. No schema
change is required.

The Route Handler requires same-origin JSON, rejects bodies over 32 KiB,
returns no-store responses, and derives IP, user agent and coarse location
with `@vercel/functions`. Raw database errors and event payloads are not
returned or logged.

For `page_view`, marketing consent creates server-retry intents for Meta
and Microsoft UET. Google is deliberately excluded from this outbox:
GTG, web GTM and same-origin sGTM remain the only Google `page_view`
delivery path. Google Data Manager is reserved for qualified server and
commerce events where it does not duplicate the active sGTM event.

Microsoft UET CAPI maps `page_view_id` to `pageLoadId` and uses `event_id`
for deduplication. Microsoft ID sync remains a separate consent-gated
browser responsibility when audience matching or remarketing is enabled.

The next increment adds browser transport. It must keep the pre-consent
Google `dataLayer` event separate from first-party persistence: wait for a
Cookiebot decision, send at most one permitted canonical event to the
collector, and never emit a second Google `page_view` merely because
consent changed.

## Browser verification gate

Before publish, prove in GTM Preview and sGTM Preview that:

1. The Google base tag is processed before `page_view` and has
   `send_page_view=false` and
   `server_container_url=https://utekos.no/__sgtm`.
2. One initial view and one event per App Router URL change are emitted.
3. Initial external referrer and subsequent virtual referrers are correct.
4. Denied consent creates no optional cookies; Google cookieless pings may
   still use `/__sgtm` in Advanced Consent Mode.
5. Meta, Microsoft and other non-Google adapters do not fire without their
   required consent.
