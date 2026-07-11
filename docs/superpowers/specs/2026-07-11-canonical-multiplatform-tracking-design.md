# Canonical multi-platform tracking architecture

Date: 2026-07-11  
Status: direction approved in conversation; written specification pending user review

## Goal

Create one durable, consent-aware measurement architecture for Utekos that improves event reliability and advertising signal quality without creating competing sources of truth. Meta, Google Ads and GA4, Microsoft Ads and UET, and every other provider that is proven active must be handled as first-class destinations with equivalent delivery audit and failure visibility.

The first implementation must repair checkout attribution and Purchase identity continuity. A narrow identity and lifetime-value bridge follows as a separate phase after current-event delivery is proven.

## Design principles

1. **Truth is owned by domain, not by one vendor.** Shopify owns order, payment, customer, and product facts. Supabase owns the canonical measurement record, event-time consent, identity links, dispatch state, and provider audit.
2. **GTM is a transport and policy layer, not a database.** Web GTM and the server container at `cloud.server.utekos.no` may collect, transform, redact, and route browser-originated data, but they are not the durable event ledger or replay authority.
3. **Advertising and analytics platforms are destinations.** Meta, Google, Microsoft, Pinterest, GA4, and PostHog may process different projections of the same canonical facts; none becomes the operational source of truth.
4. **One owner per provider event path.** A provider must not receive the same server event from Next.js, sGTM, Shopify, and a retry worker unless those paths form an explicit idempotent failover design.
5. **Consent is event-time data.** Dispatch eligibility is evaluated from the consent captured with the event. A Shopify webhook must not replace a known checkout consent snapshot with a static consent assumption.
6. **Event quality beats event quantity.** Advertising providers receive commercially meaningful signals. Detailed interaction telemetry belongs primarily in PostHog and, when useful, GA4.
7. **Every critical event is observable.** Verification spans consent, browser emission, canonical persistence, queue or direct dispatch, provider response, and provider dashboard evidence.

## Observed facts

### Repository and production

- The storefront is Next.js and is deployed on Vercel.
- The production deployment inspected on 2026-07-11 was ready and mapped to commit `874864ae6c27563ed64b6cf3ed33745f9a8e2b30`.
- `src/app/api/checkout/capture-identifiers/route.ts` accepts marketing-consented checkout identifier capture.
- `src/lib/tracking/capture/processCapture.ts` writes checkout attribution to Redis and attempts a Supabase snapshot.
- `src/lib/tracking/warehouse/persistCheckoutAttributionSnapshot.ts` persists GA identifiers, Google and Microsoft click IDs, Meta browser IDs, `external_id`, request context, user-data quality, and the raw attribution payload.
- `src/lib/tracking/utils/getRedisAttribution.ts` checks checkout and cart tokens in Redis.
- The current production version adds `src/lib/tracking/warehouse/getCheckoutAttributionSnapshotByTokens.ts` as a Supabase fallback when Redis does not resolve attribution.
- `src/lib/tracking/orders/buildOrderPurchaseTrackingPayload.ts` builds the canonical Shopify Purchase with order, value, currency, items, and GA identifiers, but currently sets `userData: undefined`.
- `src/lib/tracking/services/processOrderTrackingWithDependencies.ts` currently persists Shopify Purchase with a static consent object whose optional categories, including marketing, are false.
- `src/lib/tracking/meta/sendMetaPurchase.ts`, `src/lib/tracking/google/sendGooglePurchase.ts`, and `src/lib/tracking/microsoft-uet/sendMicrosoftUetPurchase.ts` implement direct server provider delivery.
- `src/lib/tracking/pinterest/sendPinterestPurchase.ts` and `src/lib/tracking/pinterest/sendPinterestLead.ts` implement Pinterest server-delivery code. Repository presence does not prove that Pinterest is enabled in production.
- No repository implementation was found by the targeted source search for TikTok, Snapchat, LinkedIn, Klaviyo, or Criteo tracking. GTM remains an uninspected runtime surface that could still contain provider tags.
- `marketing.event_ledger`, `ops.provider_dispatch_attempts`, `ops.provider_dispatch_health`, and `ops.dead_letter_summary` provide the existing canonical/audit foundation.

### Supabase runtime evidence

- After the production deployment became ready, Meta and Google browser/server traffic continued to succeed and no new Google `page_location` dead letters were observed in the checked interval.
- One Purchase appeared after the deployment. It was recorded without checkout attribution and produced `missing_attribution` for Meta, `missing_client_id` for Google, and `missing_attribution` for Microsoft UET.
- No new checkout attribution snapshot was observed after that deployment at the time of inspection.
- The canonical Purchase rows consequently do not currently provide a reliable view of event-time marketing consent or Purchase user identifiers.

### Meta provider evidence

- The active dataset is `Utekos Pixel` (`1092362672918571`), and both browser and server activity were current when inspected.
- Meta reported Purchase Event Match Quality of `9.3`, with full reported coverage for email, phone, IP address, user agent, `_fbp`, `external_id`, name, city, postal code, and country on the evaluated Purchase traffic.
- Purchase `fbc` coverage was `0%`.
- The last 28-day source queries returned 41 browser Purchase events and 42 server Purchase events. This proves both streams are active but does not, by itself, prove correct deduplication.
- The business contains several dormant datasets whose names describe customer or recency segments. They must not become new event authorities. Segments belong in controlled audience/export models.
- The active dataset is not onboarded to Meta OpenBridge. The existing direct CAPI path must be audited before any gateway is added.

Meta documents that matching `event_name` and `event_id` are the primary deterministic browser/server deduplication keys. Event Match Quality and deduplication are separate gates.

### GA4 provider evidence

The Utekos GA4 Data API probe is live against property `489598217`. For the seven-day control reported on 2026-07-11 it returned:

| Event | Count |
| --- | ---: |
| `page_view` | 1,621 |
| `view_item` | 166 |
| `add_to_cart` | 52 |
| `begin_checkout` | 22 |
| `purchase` | 6 |
| `select_item` | 39 |

The current Utekos probe is useful for fixed commerce quality checks but does not yet expose a safe general `runReport` surface, funnel reporting, arbitrary dimensions, reporting metadata, or property configuration.

Google's official experimental `googleanalytics/google-analytics-mcp` server is read-only and provides property metadata, Google Ads links, general reports, funnels, realtime reports, and custom dimension/metric discovery. It complements rather than replaces the Utekos commerce/tracking probe.

### GTM and sGTM evidence

- `https://cloud.server.utekos.no/healthy`, the GTM loader, noscript endpoint, and Google tag destination were reported healthy on 2026-07-11.
- This proves public infrastructure availability, not individual tag, trigger, variable, transformation, or consent correctness.
- The current authenticated GTM workspace probe fails closed because its required read-only workspace configuration is incomplete.
- Until the GTM API probe succeeds, the published web/server container contents and any additional Meta, Google, Microsoft, Pinterest, or other provider routes remain unknown runtime configuration.

### Bridge evidence

The Utekos Codex Bridge bootstrap and status calls succeeded in read-only mode, but three repository-analysis calls ended in HTTP 504. The Bridge supplied no architecture result and is not used as evidence in this specification.

## Considered architectures

### 1. Warehouse-centric hybrid — selected

Browser and commerce sources produce a versioned canonical event envelope. Next.js validates it, and Supabase durably records event, consent, identity references, data quality, and provider work. Web GTM and sGTM remain first-party browser transport and Google-oriented routing. Critical server events use audited provider adapters.

Benefits:

- existing code and database objects are reused;
- provider retries and skip reasons remain inspectable;
- Shopify Purchase truth is preserved;
- consent and identity can be tested independently of provider behavior;
- provider replacement does not rewrite event production.

### 2. GTM-centric hub — rejected as canonical architecture

All browser and server events would be routed through GTM/sGTM, with provider tags owning transformations and delivery.

This can reduce application adapters, but it does not provide the required durable ledger, relational identity model, replay governance, or database-verifiable consent audit. It also increases the risk of hidden duplicate paths when application CAPI and GTM CAPI coexist.

### 3. Managed CDP or external event bus — deferred

A managed CDP could centralize identity resolution and destinations. It would add cost, vendor dependency, another consent processor, and a migration before the current checkout defect is fixed. The present scale and existing Supabase foundation do not justify it now.

## System ownership

| System | Owned facts and responsibilities | Must not own |
| --- | --- | --- |
| Shopify | Order, payment, customer, product, fulfillment | Provider delivery status |
| Next.js | Input validation, canonical event construction, trusted webhook handling | Long-term audit state |
| Supabase | Event ledger, event-time consent, identity links, data quality, outbox, attempts, dead letters | Browser tag execution |
| Redis | Short-lived checkout lookup and low-latency attribution cache | Canonical history |
| Web GTM | Browser tag loading and controlled browser event forwarding | Purchase truth or replay authority |
| sGTM/Cloud Run | First-party collection, transformations, Google routing, selected provider routing after audit | Canonical ledger |
| GA4 | Reporting, acquisition analysis, ecommerce analysis, Google ecosystem joins | Raw commerce truth |
| PostHog | Product behavior, funnels, CRO, replay under statistics consent | Advertising conversion truth |
| BigQuery | GA4 raw analytical replica and future large-scale joins | Operational dispatch |
| Ad providers | Optimization, attribution, audiences, reporting | Source customer or consent record |

## Canonical event contract

Every business-critical event must map to one versioned envelope before provider projection:

```text
schema_version
event_id
canonical_event_name
source
occurred_at
received_at
order_id / transaction_id
value / currency / items
anonymous_id
person_id or customer_id reference
external_id
click identifiers: fbc, gclid, gbraid, wbraid, msclkid, dclid
browser identifiers: fbp, GA client_id, GA session_id
event-time consent snapshot and source
data quality flags
provider eligibility decisions
```

Raw contact information must not be copied into every event row. Normalized customer data belongs in a restricted identity/customer layer. Provider adapters receive only the fields allowed for that event and hash provider-required fields at the outbound boundary.

## Event tiers and destinations

### Tier 1: business and optimization events

Examples: `page_view`, `view_item`, `add_to_cart`, `begin_checkout`, `purchase`, and genuine leads.

- Persist canonical commerce/conversion events in Supabase.
- Send only eligible projections to advertising providers.
- Send the corresponding analytics projection to GA4.
- Send useful product-analysis projections to PostHog.

### Tier 2: product behavior

Examples: scroll depth, accordion interaction, section exposure, quick view, and UI selection details.

- PostHog is the primary destination.
- GA4 receives only events used in defined reporting or funnel questions.
- Meta, Google Ads, Microsoft Ads, and Pinterest do not receive these by default.

### Tier 3: operational telemetry

Examples: validation failure, provider latency, retry, dead letter, snapshot miss, and consent-parser failure.

- Store in Supabase operations tables and application observability.
- Never send as advertising events.

## Provider delivery design

### Meta

- Keep one active dataset as the website event destination.
- Browser Pixel and server CAPI use identical `event_name` and `event_id` for the same action.
- Purchase uses deterministic `shopify_order_<order-id>` or another single documented order-derived value on both paths.
- Direct CAPI remains the proposed server owner because it is tied to the Shopify paid-order webhook and provider audit.
- Any Meta CAPI tag in sGTM or Shopify must be inventoried before implementation. Duplicate server ownership is not allowed.
- Capture and forward `fbc` only when it exists and event-time consent permits it. Zero `fbc` on non-Meta traffic is expected; zero on Meta-click purchases is a defect.

### Google Analytics and Google Ads

- Browser tagging continues through the web/server GTM first-party path.
- GA4 Measurement Protocol supplements browser collection for trusted server/offline interactions; it does not replace browser tagging.
- Purchase uses Shopify order ID as `transaction_id` and includes GA client/session identifiers when captured.
- Google Ads conversion and Enhanced Conversions delivery must be inventoried in GTM and the linked Google Ads account before a second server path is enabled.
- The official GA MCP provides flexible read-only analysis. The Utekos probe remains the fixed cross-provider commerce health check.
- Google Data Manager API is evaluated later for future server ingestion; it is not required to fix checkout attribution.

### Microsoft Ads and UET

- Browser UET and Microsoft Conversions API remain first-class surfaces.
- Capture `msclkid` at landing and persist it through checkout attribution.
- Purchase uses the same deterministic order/event identity in browser and server representations when both exist.
- UET tag API-token readiness, goal configuration, and provider response must be proven independently of Microsoft Ads OAuth access.
- Missing attribution, missing click ID, missing token, provider rejection, and intentional consent skip have distinct audit reasons.

### Pinterest and any other implemented provider

- Pinterest Purchase and Lead senders exist at `src/lib/tracking/pinterest/sendPinterestPurchase.ts` and `src/lib/tracking/pinterest/sendPinterestLead.ts`; repository implementation does not by itself prove an active business destination.
- Runtime configuration and campaign use must be established in the provider inventory.
- If active, the provider receives the same canonical commerce facts, event-time consent evaluation, idempotency, and attempt audit as Meta, Google, and Microsoft.
- If inactive, its adapter remains disabled and must not silently receive events.

### PostHog

- PostHog remains a product analytics destination, not an advertising delivery adapter.
- Statistics consent gates initialization and events.
- Autocapture drift and accidental PII capture remain disabled or tightly controlled.

## Data flows

### Browser event

1. Consent defaults to denied until Cookiebot state is known.
2. The browser creates a unique canonical `event_id`.
3. The browser emits its analytics/provider projections with that ID.
4. A validated canonical event is persisted when the event is business-critical.
5. Supabase records provider eligibility and delivery outcomes.

### Checkout attribution

1. On an eligible checkout action, the browser resolves GA IDs and provider identifiers.
2. The capture request includes a versioned event-time consent snapshot.
3. Navigation waits for a bounded, successful capture response rather than only starting a fire-and-forget fetch.
4. Redis and Supabase receive the same normalized attribution payload and lookup tokens.
5. Failure is visible and does not falsely report capture success.

### Paid order Purchase

1. Shopify `orders/paid` is HMAC-verified and provides authoritative order facts.
2. Attribution is resolved from Redis, then Supabase, using checkout/cart tokens.
3. The canonical Purchase includes the event-time consent and permitted identity references from attribution plus verified order/customer facts.
4. The ledger write and provider work are idempotent on the deterministic Purchase event ID.
5. Provider adapters project the canonical event and record success, skip reason, response, latency, and retry classification.
6. A controlled test proves provider receipt and deduplication before production is declared healthy.

### Identity and LTV phase

1. Shopify remains the current customer/value source.
2. Historical/imported sources remain source-preserving and are linked only by deterministic normalized identifiers.
3. Ambiguous links never enrich a Shopify customer automatically.
4. A restricted person/identifier layer supports current LTV segments and platform exports.
5. Hashed export payloads are generated at the platform boundary; raw PII remains restricted.
6. Historical provider replay is a separate approval-gated operation and is never implied by identity linkage.

## Read-only audit prerequisites

### Google Analytics

Connect the official Analytics MCP in a dedicated read-only profile with property access limited to what the MCP needs. Verify:

- account and property identity;
- web data stream metadata;
- Google Ads links;
- key-event configuration visible through available read surfaces;
- custom dimensions and metrics;
- seven- and twenty-eight-day ecommerce reports;
- bounded checkout funnel;
- realtime event continuity;
- thresholding, sampling, and other report metadata when returned.

### GTM and sGTM

Repair the read-only workspace probe and inventory:

- numeric account, web-container, and server-container paths;
- published versions and workspace drift;
- all tags, triggers, variables, templates, transformations, and consent settings;
- Meta Pixel and CAPI ownership;
- GA4 and Google Ads conversion ownership;
- Microsoft UET ownership;
- Pinterest or other provider tags;
- duplicated Purchase and page-view paths;
- server container region, scaling, latency, error rate, and preview readiness.

Publishing is explicitly excluded from the default read-only profile.

### Provider inventory

For every provider, record one row containing:

```text
provider
business/account/dataset destination
browser owner
server owner
event set
canonical event-id mapping
consent category/service
retry owner
dashboard verification method
runtime status
```

## Phased delivery

### Phase 0: read-only architecture audit

- Connect the official GA MCP alongside the Utekos probe.
- Repair read-only GTM workspace access.
- Inventory web GTM, sGTM, provider destinations, and duplicate paths.
- Record the provider matrix without publishing or sending test events.

### Phase 1: checkout and Purchase integrity

- Add an explicit consent snapshot to checkout attribution.
- Make checkout capture completion observable and bounded before navigation.
- Preserve Redis plus Supabase fallback.
- Propagate permitted `fbc`, `fbp`, Google IDs, Microsoft click ID, and stable identity references.
- Enrich the canonical Purchase without making marketing consent universally true.
- Use one deterministic Purchase event ID across eligible browser and server paths.
- Add tests before implementation changes.

### Phase 2: explicit Supabase canonical ledger and provider parity

- Finalize the canonical event contract and versioning.
- Ensure each active provider is a first-class adapter with equivalent audit semantics.
- Remove or disable duplicate server delivery paths discovered in Phase 0.
- Separate ad-provider events from PostHog/GA4 behavioral telemetry.
- Add provider coverage and identifier-quality reports.

### Phase 3: narrow identity and LTV bridge

- Add source-preserving identity links between Shopify and approved external customer sources.
- Calculate current LTV/value segments from Shopify order truth.
- Generate platform-specific customer/value exports from one restricted model.
- Do not automatically replay historical web events.

### Phase 4: controlled production verification

- Run consent accept, deny, and withdrawal checks.
- Run browser and ledger smoke tests.
- Use provider test-event mechanisms where available.
- Execute one approved test purchase or validate the next live purchase.
- Verify browser event, canonical ledger, dispatch attempt, provider response, provider dashboard, and deduplication.
- Update `FLOW.md` and `PLAN.md` with measured results.

## Success criteria

- Every paid Shopify order produces exactly one canonical Purchase record with correct order ID, value, currency, and items.
- Every marketing-consented checkout that reaches the capture handler produces a Redis record and durable Supabase snapshot, or a visible classified failure.
- Meta-click Purchases include `fbc` when the identifier was available at checkout and consent allowed it.
- Meta browser and server Purchase deduplication is proven with the same `event_name` and `event_id`.
- GA4 Purchase count and transaction IDs reconcile to eligible Shopify orders within documented reporting latency.
- Microsoft Purchase dispatch has a provider response or a precise skip/failure reason.
- Every active provider has an owner, event mapping, consent rule, idempotency key, and dashboard verification procedure.
- No active provider receives the same server event from two uncoordinated paths.
- Behavioral events not used for advertising optimization are removed from ad-provider delivery while remaining available in PostHog or GA4 as designed.
- Raw PII is restricted, and provider-required hashing occurs at outbound boundaries.

## Error handling

- Capture persistence failure is observable and must not be converted into a false success.
- Redis failure does not erase the durable Supabase fallback.
- Supabase failure prevents a Purchase from being reported as canonically accepted.
- Provider failures are classified as retryable, terminal, or intentionally skipped.
- Dead-letter replay is idempotent and separately approved.
- Unknown or invalid consent fails closed for advertising dispatch.
- Provider dashboard absence is not treated as success solely because an HTTP request returned 2xx.

## Security and governance

- Apply least-privilege read-only access to GA4 and GTM audit MCPs.
- Keep GTM publishing, provider mutations, database migrations, production deploys, and replay outside read-only profiles.
- Store raw PII only in restricted schemas/tables with service-role access and explicit retention policy.
- Do not place protected values in repository files, MCP-generated configuration, logs, or design documents.
- Treat imported demographics as source-attributed data, not inferred truth.
- Obtain the required lawful basis and consent before sharing customer information with advertising providers.

## Unknowns and hard gates

The following are deliberately unresolved until authenticated read-only inspection succeeds:

- the current published GTM web/server tag graph;
- whether sGTM, Shopify, or another integration sends an additional Meta CAPI Purchase;
- the browser Purchase event's current `event_id` and whether it matches `shopify_order_<order-id>`;
- Google Ads conversion actions, Enhanced Conversions ownership, and any duplicated GA4-import/direct conversion;
- Microsoft UET browser goal and CAPI dashboard state;
- Pinterest and other provider runtime activation;
- GA4 Google Ads links, reporting identity implications, custom dimensions, and funnel definitions;
- provider-side deduplication and diagnostics beyond the available aggregate APIs.

No implementation may replace these unknowns with assumptions. Phase 0 either proves them or records a provider-specific blocker.

## Official references

- Meta Event Match Quality: https://www.facebook.com/business/help/765081237991954
- Meta Pixel and CAPI deduplication: https://www.facebook.com/business/help/823677331451951
- Google server-side tagging: https://developers.google.com/tag-platform/tag-manager/server-side/overview
- GA4 Measurement Protocol: https://developers.google.com/analytics/devguides/collection/protocol/ga4
- Official Google Analytics MCP: https://developers.google.com/analytics/devguides/MCP

## Scope boundary

This specification authorizes design and implementation planning only. It does not authorize GTM publishing, provider writes, live test events, database migration, dead-letter replay, production deployment, audience upload, or campaign mutation. Each concrete production or provider action remains approval-gated under `AGENTS.md` and `DEPLOYMENT.md`.
