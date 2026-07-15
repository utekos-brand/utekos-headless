# Canonical events

Status date: 2026-07-15

The application owns event meaning. GTM and sGTM are delivery adapters,
not the event inventory or source of truth.

## Active inventory

| Event | Owner | Detection | Delivery | Status |
| --- | --- | --- | --- | --- |
| `page_view` | Next.js application | Initial render and App Router URL change | `dataLayer` -> web GTM -> `/__sgtm` -> GA4 | Implemented in code; GTM publish and preview verification pending |

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

## Verification gate

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
