# Task 2 report

## Implemented

- Split the signed public receipt contract from internal `browser_dispatch` observations with strict discriminated Zod schemas.
- Kept the five-minute receipt window, canonical base64 key validation, constant-time HMAC comparison and unique idempotency replay protection.
- Hardened `ops.tagging_observations` with observation-shape constraints, forced RLS, explicit `PUBLIC`/`anon`/`authenticated`/`service_role` revocation and service-role-only `SELECT` + `INSERT`.
- Added terminal `accepted_unverified` handling for GA4 HTTP acceptance without event confirmation and protected terminal rows from automatic requeue or downgrade.
- Added minimized PII-free server-direct evidence for Meta, Google and Microsoft: payload summary, consent basis, request ID where exposed, HTTP status, validation summary, response semantics and latency.
- Added verified `refunds/create` processing with strict Shopify refund money validation, Shopify refund ID as event identity, Shopify order ID as transaction identity, successful refund transaction amount and explicit `skipped_unqualified/missing_consent_provenance` provider audit rows.

## TDD evidence

- RED observed for public `browser_dispatch` acceptance, missing tag discriminator requirements, over-broad migration grants, missing database shape constraints, missing refund processor, incomplete provider evidence, non-terminal accepted transport status and invalid refund money.
- GREEN: focused Task 2 tests passed.
- GREEN: full tracking suite passed: 104/104.
- GREEN: `pnpm exec tsc --noEmit`.
- GREEN: targeted ESLint.
- GREEN: `git diff --check`.

## Supabase read-only evidence

- Linked migration history shows only `20260712120000_add_tagging_observations_and_verified_dispatch_status.sql` pending.
- `supabase db push --linked --dry-run` would apply only that migration.
- Linked `marketing,ops` lint returned no schema errors.

## Blocked by production gates

- The migration has not been applied and the new SQL has not been executed against a local Supabase stack because no local stack is running.
- Vercel deploy, receipt secret configuration, Shopify webhook subscription and any live refund remain unperformed.
