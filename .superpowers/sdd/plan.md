# sGTM Release 2 execution tasks

## Task 1: Browser ownership, consent and funnel correctness

- Keep one explicit `dispatchTrackingEvent` browser dispatcher.
- Keep Google pageview owned only by `GoogleAnalyticsPageTracker` and Meta pageview only by `PixelLogic`.
- Capture checkout identifiers whenever any provider-specific service is authorized, including Google Analytics statistics-only consent.
- Never put raw email, phone or address values into browser tracking payloads.
- Emit one Microsoft UET business event per logical action.
- Emit `view_cart` once per actual drawer opening, `remove_from_cart` after confirmed mutation and `search` only on explicit submission.
- Preserve Shopify `orders-paid` as the only purchase owner and keep Klarna return non-converting.
- Add or update focused regression tests and run them.

## Task 2: Receipt, audit, refund and warehouse contract

- Validate and HMAC-verify minimal sGTM receipts with a five-minute window and replay protection.
- Persist PII-free `browser_dispatch`, `sgtm_ingress` and `tag_execution` observations.
- Make the Supabase migration additive, RLS-protected and service-role-only.
- Keep `ops.tagging_observations` append-only for application roles: revoke `PUBLIC`, `anon` and `authenticated`; grant `service_role` only `SELECT` and `INSERT`; require tag ID/status only for `tag_execution` observations.
- Let the public signed receipt route accept only `sgtm_ingress` and `tag_execution`; `browser_dispatch` is an internal application observation.
- Keep GA4 HTTP 2xx status as `accepted_unverified`, terminal and non-retryable.
- Store minimized server-direct payload, consent, request, HTTP, validation, response semantics and latency evidence for Google, Meta and Microsoft without provider payloads or PII.
- Accept Shopify `refunds/create` with verified HMAC, authoritative refund ID/amount and honest provider skip semantics when consent provenance is unavailable.
- Add or update focused regression tests and run them.

## Task 3: GTM, Cloud Run and release tooling

- Keep a fail-closed GTM publish guard tied to expected live versions/fingerprints, clean workspace, client 6 invariant, Quick Preview evidence and explicit confirmation.
- Quick Preview evidence must be generated directly from the official `workspaces.quick_preview` response, include compiler/sync status and a digest of the previewed resources, and be matched against the exact expected workspace change set.
- Provide a reviewable server monitoring receipt custom template contract using official sGTM APIs.
- Provide idempotent Cloud Run/Monitoring hardening tooling for capacity 3/10, concurrency 80, secret file mount, `/healthy` uptime and required alerts.
- Verify service identity, Secret Manager IAM/mount/path, `SGTM_CREDENTIALS`, actual policy filters/thresholds/durations/channels, uptime host/path/regions and budget thresholds rather than only display names.
- Provide budget thresholds at 80 and 100 percent without embedding secrets.
- Keep CSP Report-Only compatible with `cloud.server.utekos.no` and document the enforcement gate.
- Update release documentation and verification commands.

## Task 4: Local release verification

- Run all targeted Node tests, TypeScript, build, MCP build/doctor, commerce doctor, loader smoke, tracking smoke, commerce smoke where it does not create a live event, GTM guard and Supabase migration dry-run/schema/lint gates.
- Record every pass, expected fail-closed result and blocker.

## Task 5: Numbered production mutation gates

- Gate 1: Supabase production migration, lint and schema proof.
- Gate 2: Vercel Preview with receipt secret and preview smoke.
- Gate 3: Vercel Production and READY verification.
- Gate 4: create/mount Cloud Run receipt secret and set `SGTM_CREDENTIALS` before the monitoring tag can go live.
- Gate 5: web then server GTM Quick Preview and publish.
- Gate 6: Cloud Run capacity/uptime/alerts/budget hardening.
- Gate 7: Shopify refund subscription/App Pixel only with separate Shopify approval.
- Gate 8: production smoke; no real order/refund/live control event without its own test identifier approval.
- Establish 24-hour observation automation and update canonical docs after evidence exists.
