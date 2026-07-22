# Provider matrix

**Evidence freeze:** 2026-07-20.

## Google Analytics

- **Owner:** Web GTM/Google tag and sGTM for browser analytics.
- **Transport:** `dataLayer` -> `/__gtg` ->
  `server_container_url=https://utekos.no/__sgtm` -> Google.
- **Events:** canonical snake_case browser events; page view is
  router-owned.
- **Destination:** GA4 `G-FCES3L0M9M`; Google tag `GT-MKRLF5WK`.
- **Dedupe:** canonical `event_id` is present in application
  dataLayer contracts, but GA4 Measurement Protocol has no native
  dedupe guarantee. Server container `GTM-M8GT97CV` v29 forwards
  GA4 + Conversion Linker.
- **Retry:** browser/tag infrastructure, not the Supabase
  provider outbox for `page_view`.
- **Finality:** network/tag receipt is not provider-confirmed
  ingestion.
- **Diagnostics:** Prefer project Google Analytics / GTM MCP with
  working OAuth; Stape remote may still show empty accounts.
- **Status:** present in published web container; server
  container verified. Browser smoke 2026-07-20 observed Google
  Ads destination `AW-18180376403` in `ccm/collect` pings pre-
  and post-consent (DEV-017), despite the documented
  native-Google-Ads exclusion policy.
- **Measurement Protocol:** no direct application `mp/collect`
  transport. `/g/collect` is active Google tag/sGTM protocol
  traffic.

## Google Ads / Data Manager

- **Owner:** canonical server outbox and Google request-status
  cron.
- **Transport:** 24 `(google,event)` workers using
  `@google-ads/datamanager`.
- **Events:** all active catalog events except `page_view`;
  blocked-source events excluded.
- **Destination:** configured Google Ads/Data Manager destination
  names are present as environment variables; values are not
  reproduced.
- **Identifiers:** GA client ID required; canonical
  transaction/event ID; click IDs; consent-gated SHA-256
  email/phone; optional device/location context. Maximum ten
  contact identifiers.
- **Dedupe:** provider mapping uses canonical transaction/event
  ID; ledger/outbox uniqueness prevents duplicate local attempts.
- **Retry:** adapter-defined maximum/delays with positive jitter;
  retryable failures scheduled in the outbox.
- **Finality:** ingest receipt -> `accepted_unverified`;
  request-status reconciliation maps SUCCESS to `succeeded`,
  FAILED/PARTIAL_SUCCESS to dead letter, PROCESSING/unknown
  remains pending.
- **Diagnostics:** response, `request_id`, validation result and
  per-request status stored. No `request_id` index.
- **Status:** application integration active; Production
  `GOOGLE_DATA_MANAGER_VALIDATE_ONLY` is executed mode (`false`)
  per live `validation_result` and `DEPLOYMENT.md`. Treat
  accidental re-enable of validate-only as P0/P1 regression.

## Meta

- **Owner:** browser web GTM for pixel events and canonical
  outbox for CAPI-supported events.
- **Transport:** Meta Pixel in published web container; eight
  Meta CAPI workers. Browser pixel routes through Meta CAPI
  Gateway (openbridge3, `mpc2-prod-25-...run.app` with AWS ECS
  fallback), not `facebook.com/tr`; both gateway hosts are
  allowed in the production CSP.
- **Events:** `PageView`, `ViewContent`, `AddToCart`,
  `AddToWishlist`, `InitiateCheckout`, `Purchase`, `Search`,
  `Lead`. Live 7-day dataset window contains only these
  PascalCase names (verified via Graph API 2026-07-20).
- **Destination:** `1092362672918571` in published web payload,
  source/config **and** the live receiving dataset
  (`last_fired_time` fresh; 7d SERVER 3959 / BROWSER 1838).
- **Identifiers:** same canonical `event_id`; `external_id`,
  `fbp`, `fbc`, consent-gated hashed contact data, server IP/user
  agent where approved. Live match keys 7d: `external_id` 7461,
  `email` 59, `phone` 47.
- **Dedupe:** source mappers set identical canonical event ID.
  Meta requires both provider event name and ID to match between
  browser and server; the numeric live dedupe rate is still
  unavailable from the `/stats` aggregations used.
- **Retry:** generic outbox retry/jitter/dead-letter.
- **Finality:** successful API receipt becomes
  `accepted_unverified`; no repository reconciliation poller.
- **Diagnostics:** daily dataset-quality snapshot/retry code
  exists. Events Manager activity/source split/match keys
  verified via Graph API; numeric EMQ live (upper funnel 6.1,
  Purchase 9.3). **Dedupe: NOT OK / not proven** — ViewContent
  Deduplication tab reports setup missing; Graph omits
  `dedupe_key_feedback` (DEV-020). Live console warning: invalid
  currency parameter format (DEV-019).
- **Status:** browser and server delivery verified at the
  dataset. Server GTM has no Meta CAPI Gateway tag (v29 = GA4 +
  Conversion Linker); browser uses openbridge3 outside sGTM.

## Microsoft

- **Owner:** Web GTM for browser UET; analytics server outbox for
  UET CAPI purchase.
- **Transport:** browser UET + server Conversions API
  (`capi.uet.microsoft.com`) for `purchase` only.
- **Events:** canonical Microsoft names in the catalog; live
  published container contains UET. Server worker registered for
  `purchase` only; other Microsoft `serverOutbox` values remain
  `blocked_no_worker`.
- **Destination:** UET tag `97247724`.
- **Auth:** UET tag ApiToken (`MICROSOFT_UET_CAPI_*` aliases),
  not Ads OAuth.
- **Dedupe:** catalog `event_id`; live `pageLoadId`
  browser-server pairing still unverified (purchase-first path
  does not emit pageLoad).
- **Retry:** provider outbox retry for purchase CAPI HTTP/network
  failures; qualification skips are terminal.
- **Finality:** purchase CAPI HTTP 200 → generic
  `accepted_unverified`; missing `msclkid`/token →
  `skipped_unqualified`.
- **Diagnostics:** Microsoft Ads audit green 2026-07-20; browser
  smoke verified UET `97247724` fires `pageLoad` + custom
  `view_item` post-consent only (`asc=G`), Clarity `wupwleuv2e`
  linked.
- **Status:** browser verified; purchase CAPI production-verified
  2026-07-20 (`#6ULWCDZT5` → `accepted_unverified`). Historical
  222 skipped Microsoft rows remain historical; non-purchase
  server events still `blocked_no_worker`.

## Supabase

- **Owner:** canonical first-party persistence and operational
  audit.
- **Transport:** direct PostgreSQL transaction through
  `postgres`.
- **Events:** all active canonical events.
- **Destination:** project `hkoawfbomhnzupcsdggb`, schemas
  `marketing`, `ops`, `partner`, `analytics`.
- **Dedupe:** unique ledger idempotency key; unique
  provider/idempotency key.
- **Retry:** provider attempts; no retry for a failed acceptance
  transaction because it rolls back and the caller can safely
  resend the same event.
- **Finality:** ledger insertion is atomic with dispatch attempt
  planning.
- **Diagnostics:** provider health/dead-letter views, attempt
  response/request/status fields.
- **Status:** live and ingesting. RLS enabled, no public
  policies/grants.

## GTM web

- **Owner:** tag bootstrap, Cookiebot, default Consent Mode,
  browser GA4/Meta/UET.
- **Transport:** Next `<GoogleTagManager>` through `/__gtg`.
- **Destination:** `GTM-5TWMJQFP`.
- **Dedupe:** event contracts carry canonical IDs; web container
  verified published.
- **Consent:** Cookiebot `implementation=gtm`, default denied,
  redaction and URL passthrough.
- **Status:** verified published and reachable. Prior
  `GTM-WZ4R3PQL` claim refuted.

## GTM server

- **Owner:** first-party server tagging endpoint.
- **Transport:** `/__sgtm` -> `cloud.server.utekos.no`.
- **Destination:** `GTM-M8GT97CV` (`248521914`); prior
  `GTM-PGTJ3FJ` does not resolve.
- **Clients/tags/transformations:** Published version 29 = GA4 +
  Conversion Linker only (no Meta CAPI Gateway).
- **Consent:** receives consent signals from Google tag.
- **Caching:** verified `no-store`, no cache HIT.
- **Status:** endpoint healthy; container identity verified.

## Shopify

- **Owner:** Shopify Admin notification `Order payment` owns
  Purchase. Shopify Admin reconciliation is duplicate-safe
  missed-delivery recovery. Shopify Admin notification
  `Refund create` owns Refund, with reconciliation as
  duplicate-safe missed-delivery recovery.
- **Transport:** HTTPS webhooks to Next.js routes.
- **Events:** order-paid -> purchase; refund-created -> refund.
- **Dedupe:** Purchase uses the order legacy ID through
  `deterministicPurchaseEventId`; webhook, retry and
  reconciliation converge on that identity. Verified Shopify
  delivery/event IDs are source evidence only and never create an
  alternative canonical or provider event ID. Refund uses its
  Shopify Refund legacy ID through `deterministicRefundEventId`;
  alternative event/refund/order identities fail closed.
- **Consent:** operational ledger; provider export depends on
  captured checkout attribution/consent. Refund resolves that
  snapshot through the deterministic canonical Purchase linkage;
  it does not invent a new browser identifier or reuse webhook
  transport context.
- **Retry:** Shopify delivery retry plus idempotent receiver;
  accepted transaction schedules the generic outbox.
- **Finality:** `refunds/create` means refund created, not
  settled.
- **Item/value contract:** line-item refunds retain their item
  mapping; shipping-only and adjustment-only refunds retain an
  explicit `items: []` without fabricated products. Google Data
  Manager omits `cartData` for the itemless case while preserving
  refund value, currency and identity.
- **Diagnostics:** app-scoped subscriptions verified via Admin
  GraphQL 2025-07: **zero** `webhookSubscriptions` for the app
  token (2026-07-20). Delivery logs for any other subscriber
  remain unavailable.
- **Status:** CE-2.4 is production-proven; CE-3.3R is committed
  and locally verified; CE-2.5 ownership cutover is locally
  implemented with the integrated fresh verifier pending. The
  historical direct provider-resend/backfill entrypoints are
  fail-closed before credentials, database or network access.
  Production activation and the one-ledger-row/provider-attempt
  proof are pending release approval;
  `STOP_ACTIVE_DOUBLE_COUNT_RISK` remains active until the
  complete release candidate is verified, owner-approved and
  production-proven.

## Provider status comparison

| Provider                    | Immediate receipt                    | Stored state                 | Separate reconciliation | Provider-confirmed terminal state |
| --------------------------- | ------------------------------------ | ---------------------------- | ----------------------- | --------------------------------- |
| Google Data Manager         | Ingest/validate receipt + request ID | `accepted_unverified`        | Yes                     | `succeeded` or dead letter        |
| Meta CAPI                   | API receipt                          | `accepted_unverified`        | No repository poller    | Not represented separately        |
| Microsoft UET browser       | Browser request/queue                | Not canonical server attempt | No                      | Not represented                   |
| Microsoft UET CAPI purchase | HTTP 200 / adapter receipt           | `accepted_unverified`        | No repository poller    | Not represented separately        |
| Supabase                    | Transaction commit                   | Ledger + attempts            | Not applicable          | Commit is terminal locally        |
