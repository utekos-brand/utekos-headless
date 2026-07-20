# Provider matrix

**Evidence freeze:** 2026-07-20.

## Google Analytics

- **Owner:** Web GTM/Google tag and sGTM for browser analytics.
- **Transport:** `dataLayer` -> `/__gtg` -> `server_container_url=https://utekos.no/__sgtm` -> Google.
- **Events:** canonical snake_case browser events; page view is router-owned.
- **Destination:** GA4 `G-FCES3L0M9M`; Google tag `GT-MKRLF5WK`.
- **Dedupe:** canonical `event_id` is present in application dataLayer contracts, but GA4 Measurement Protocol has no native dedupe guarantee. Exact published server-tag forwarding is blocked.
- **Retry:** browser/tag infrastructure, not the Supabase provider outbox for `page_view`.
- **Finality:** network/tag receipt is not provider-confirmed ingestion.
- **Diagnostics:** GA4 Admin/Data MCP returned no authorized properties.
- **Status:** present in published web container; live property traffic/config blocked.
- **Measurement Protocol:** no direct application `mp/collect` transport. `/g/collect` is active Google tag/sGTM protocol traffic. Exact current server-container MP client/tag state is blocked.

## Google Ads / Data Manager

- **Owner:** canonical server outbox and Google request-status cron.
- **Transport:** 24 `(google,event)` workers using `@google-ads/datamanager`.
- **Events:** all active catalog events except `page_view`; blocked-source events excluded.
- **Destination:** configured Google Ads/Data Manager destination names are present as environment variables; values are not reproduced.
- **Identifiers:** GA client ID required; canonical transaction/event ID; click IDs; consent-gated SHA-256 email/phone; optional device/location context. Maximum ten contact identifiers.
- **Dedupe:** provider mapping uses canonical transaction/event ID; ledger/outbox uniqueness prevents duplicate local attempts.
- **Retry:** adapter-defined maximum/delays with positive jitter; retryable failures scheduled in the outbox.
- **Finality:** ingest receipt -> `accepted_unverified`; request-status reconciliation maps SUCCESS to `succeeded`, FAILED/PARTIAL_SUCCESS to dead letter, PROCESSING/unknown remains pending.
- **Diagnostics:** response, `request_id`, validation result and per-request status stored. No `request_id` index.
- **Status:** application integration active but production config was observed as validate-only; accepted validation is not proof of live ingestion.

## Meta

- **Owner:** browser web GTM for pixel events and canonical outbox for CAPI-supported events.
- **Transport:** Meta Pixel in published web container; eight Meta CAPI workers.
- **Events:** `PageView`, `ViewContent`, `AddToCart`, `AddToWishlist`, `InitiateCheckout`, `Purchase`, `Search`, `Lead`.
- **Destination:** `1092362672918571` in published web payload and source/config.
- **Identifiers:** same canonical `event_id`; `external_id`, `fbp`, `fbc`, consent-gated hashed contact data, server IP/user agent where approved.
- **Dedupe:** source mappers set identical canonical event ID. Meta requires both provider event name and ID to match between browser and server; live rate is blocked.
- **Retry:** generic outbox retry/jitter/dead-letter.
- **Finality:** successful API receipt becomes `accepted_unverified`; no repository reconciliation poller.
- **Diagnostics:** daily dataset-quality snapshot/retry code exists. Events Manager EMQ/warnings/activity were unavailable.
- **Status:** code/config present. Exact server-container tag state and claimed paused CAPI Gateway tag are unknown.

## Microsoft

- **Owner:** Web GTM for browser UET. No active server owner.
- **Transport:** browser UET only; catalog describes UET CAPI but no worker is registered.
- **Events:** canonical Microsoft names in the catalog; live published container contains UET.
- **Destination:** UET tag `97247724`.
- **Dedupe:** canonical catalog specifies `event_id`; live `pageLoadId`/browser-server behavior is unverified.
- **Retry:** none for current server path because no worker exists.
- **Finality:** browser network receipt only; no server status lifecycle.
- **Diagnostics:** Microsoft read-only API/MCP unavailable.
- **Status:** browser present, server blocked. All 222 historical Microsoft attempts are skipped.

## Supabase

- **Owner:** canonical first-party persistence and operational audit.
- **Transport:** direct PostgreSQL transaction through `postgres`.
- **Events:** all active canonical events.
- **Destination:** project `hkoawfbomhnzupcsdggb`, schemas `marketing`, `ops`, `partner`, `analytics`.
- **Dedupe:** unique ledger idempotency key; unique provider/idempotency key.
- **Retry:** provider attempts; no retry for a failed acceptance transaction because it rolls back and the caller can safely resend the same event.
- **Finality:** ledger insertion is atomic with dispatch attempt planning.
- **Diagnostics:** provider health/dead-letter views, attempt response/request/status fields.
- **Status:** live and ingesting. RLS enabled, no public policies/grants.

## GTM web

- **Owner:** tag bootstrap, Cookiebot, default Consent Mode, browser GA4/Meta/UET.
- **Transport:** Next `<GoogleTagManager>` through `/__gtg`.
- **Destination:** `GTM-5TWMJQFP`.
- **Dedupe:** event contracts carry canonical IDs; exact tag templates/triggers blocked.
- **Consent:** Cookiebot `implementation=gtm`, default denied, redaction and URL passthrough.
- **Status:** verified published and reachable. Prior `GTM-WZ4R3PQL` claim refuted.

## GTM server

- **Owner:** first-party server tagging endpoint.
- **Transport:** `/__sgtm` -> `cloud.server.utekos.no`.
- **Destination:** exact container ID blocked; prior `GTM-PGTJ3FJ` does not resolve.
- **Clients/tags/transformations:** blocked by GTM Admin authorization.
- **Consent:** receives consent signals from Google tag; exact server enforcement blocked.
- **Caching:** verified `no-store`, no cache HIT.
- **Status:** endpoint healthy. Alleged paused Meta CAPI Gateway tag not verifiable.

## Shopify

- **Owner:** authoritative purchase/refund event source; product webhook routes own cache invalidation.
- **Transport:** HTTPS webhooks to Next.js routes.
- **Events:** order-paid -> purchase; refund-created -> refund.
- **Dedupe:** deterministic canonical event ID plus ledger uniqueness. Current code does not use `X-Shopify-Webhook-Id` as a separate key.
- **Consent:** operational ledger; provider export depends on captured checkout attribution/consent.
- **Retry:** Shopify delivery retry plus idempotent receiver; accepted transaction schedules the generic outbox.
- **Finality:** `refunds/create` means refund created, not settled.
- **Diagnostics:** subscription and delivery logs blocked without Shopify Admin MCP/plugin access.
- **Status:** routes/HMAC verified; active app-scoped subscription state is not proven.

## Provider status comparison

| Provider | Immediate receipt | Stored state | Separate reconciliation | Provider-confirmed terminal state |
|---|---|---|---|---|
| Google Data Manager | Ingest/validate receipt + request ID | `accepted_unverified` | Yes | `succeeded` or dead letter |
| Meta CAPI | API receipt | `accepted_unverified` | No repository poller | Not represented separately |
| Microsoft UET browser | Browser request/queue | Not canonical server attempt | No | Not represented |
| Supabase | Transaction commit | Ledger + attempts | Not applicable | Commit is terminal locally |
