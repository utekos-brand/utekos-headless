# Canonical Page View Collector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a first-party `page_view` collector that can atomically persist one canonical ledger row and its Meta/Microsoft outbox rows without making provider requests.

**Architecture:** A Node.js App Router Route Handler accepts only small same-origin JSON requests, derives IP, user agent, and coarse location through `@vercel/functions`, and delegates to the existing server trust boundary. A lazy Postgres.js adapter writes `marketing.event_ledger` and `ops.provider_dispatch_attempts` in one transaction. Browser transport is deliberately a following increment so consent-ready re-delivery can be designed without duplicating Google `page_view`.

**Tech Stack:** Next.js 16.2.9, TypeScript 6, Zod 4, `@vercel/functions`, Postgres.js, Node test runner, Supabase Postgres.

## Global Constraints

- Keep Google `page_view` delivery exclusively on `dataLayer` -> web GTM -> `/__sgtm` -> GA4.
- Do not call Meta, Microsoft, or Google provider APIs in this increment.
- Do not change the Supabase schema; use the existing unique ledger and provider idempotency constraints.
- Do not expose raw database errors or log event payloads.
- Do not cache collector responses.
- Do not merge or deploy production without a separate explicit approval.

---

### Task 1: Persistence row mapping

**Files:**
- Create: `src/lib/analytics/server/mapCanonicalPageViewPersistence.ts`
- Test: `src/lib/analytics/server/mapCanonicalPageViewPersistence.test.ts`

**Interfaces:**
- Consumes: a normalized `CanonicalPageView` and `ProviderDispatchIntent[]`.
- Produces: one `CanonicalLedgerInsert` and zero or more `ProviderDispatchInsert` records with stable idempotency keys.

- [ ] Write failing tests for ledger mapping, consent/data-quality mapping, and Meta/Microsoft outbox rows.
- [ ] Run the targeted test and confirm the module is missing.
- [ ] Implement the minimal pure mapper.
- [ ] Run the targeted test and confirm it passes.

### Task 2: Atomic Postgres store

**Files:**
- Create: `src/lib/analytics/server/createCanonicalPageViewStore.ts`
- Create: `src/lib/analytics/server/postgresCanonicalPageViewStore.ts`
- Test: `src/lib/analytics/server/createCanonicalPageViewStore.test.ts`

**Interfaces:**
- Consumes: `CanonicalPageViewStoreInput` plus a transaction runner.
- Produces: a `CanonicalPageViewStore` that returns `inserted` or `duplicate`.

- [ ] Write failing tests proving a duplicate ledger row creates no outbox rows and a new ledger row writes every dispatch inside one transaction callback.
- [ ] Run the targeted test and confirm the module is missing.
- [ ] Implement the transaction-oriented store factory.
- [ ] Implement a lazy Postgres.js transaction runner using `SUPABASE_VERCEL_POSTGRES_URL_NON_POOLING` and `ON CONFLICT` against the existing constraints.
- [ ] Run the targeted test and confirm it passes.

### Task 3: First-party collector Route Handler

**Files:**
- Create: `src/lib/analytics/server/handleCanonicalPageViewRequest.ts`
- Create: `src/app/api/events/page-view/route.ts`
- Test: `src/lib/analytics/server/handleCanonicalPageViewRequest.test.ts`

**Interfaces:**
- Consumes: a standard `Request`, request-context factory, and `CanonicalPageViewStore`.
- Produces: no-store JSON responses for accepted, duplicate, validation, origin, media-type, size, and server-error outcomes.

- [ ] Write failing tests for same-origin enforcement, JSON media type, 32 KiB limit, canonical validation, denied consent, accepted, duplicate, and redacted database failure.
- [ ] Run the targeted test and confirm the module is missing.
- [ ] Implement the framework-independent request handler.
- [ ] Add the Node.js Route Handler using `ipAddress(request)` and `geolocation(request)` from `@vercel/functions`.
- [ ] Run the targeted test and confirm it passes.

### Task 4: Documentation and draft PR

**Files:**
- Modify: `CANONICAL_EVENTS.md`

**Interfaces:**
- Records that the collector exists but browser transport and providers remain inactive.

- [ ] Update the runtime inventory and next consent-aware transport gate.
- [ ] Run all analytics tests and isolated TypeScript validation.
- [ ] Commit the reviewed files to a named GitHub branch based on current `main`.
- [ ] Open a draft pull request and verify its Vercel preview reaches `READY`.
