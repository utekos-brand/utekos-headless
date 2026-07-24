# Evidence: view_category /produkter + /gaveguide + Meta ViewCategory (queue #6)

**Date:** 2026-07-24  
**Start SHA:** `9032f040ed2f2a20af340c8e317507cec9cd1013`  
**App tip:** `e064fa6e2e0231a1d66cf53fabae18ee332b5f22`  
**Roadmap:** Stale-events design queue #6 (`view_category`)

## Governance preflight

```text
Charter-version: referenced by current-handoff 1.19.1 — program-charter.md / roadmap.md are NOT present on disk in this worktree
Roadmap task: Stale-events queue #6 view_category (design 2026-07-24)
Affected invariants: once per page_view_id + category_id + view_sequence; consent fail-closed; Meta Pixel eventID = canonical event_id; no Meta CAPI (matrix Meta server = -)
Goal: catalog + reporter + /api/events/view-category + Google DM; Pixel map view_category → ViewCategory; mount on collection surfaces only
Non-goals: queue #7 hero_interact; Meta CAPI outbox; inventing extra category routes beyond /produkter and /gaveguide
Allowed files: ViewCategoryObserver, viewCategory*, API route, catalog/matrix, web-meta-pixel.html, GTM tag 153 / trigger 152, this evidence
Documentation status: design + handoff + matrix + existing scroll_depth/view_cart clone path sufficient; charter/roadmap files missing on disk
```

## What shipped in-repo

- New canonical `view_category` (Zod + reporter + collector + `/api/events/view-category` + Google DM adapter/outbox).
- Catalog lifecycle `active`; Meta CAPI `not_relevant` (browser Pixel only, same bar as `view_cart` / `scroll_depth`).
- UI: `ViewCategoryObserver` once on `/produkter` overview **layout** (`category_id=produkter`) and once on `/gaveguide` (`category_id=gaveguide`). Removed duplicate mount from produkter `page.tsx`.
- Observer waits for Cookiebot decision (`CookiebotOnConsentReady` / Accept / Decline) before emit — avoids pre-banner denied-consent race.
- GTM template: `view_category` → `ViewCategory` with `content_category` / `content_name` / `view_sequence`.

## Unit verification

```text
pnpm exec tsx --test \
  src/lib/analytics/viewCategoryEvent.test.ts \
  src/lib/analytics/eventCatalog.test.ts \
  src/lib/analytics/canonicalEvent.test.ts
→ pass (30 canonical events)

node --test scripts/tracking/web-meta-pixel-tag.test.mjs
→ pass (includes ViewCategory + shared eventID)
```

Template SHA-256: `9bdef37da970bc63e8510baf372945e959825e4ef0697fab456d18d3945c95fc`

## Live / production gates (2026-07-24)

### Web GTM publish (`GTM-5TWMJQFP`)

| Version | Name | Notes |
|---------|------|-------|
| **131** | Meta Pixel view_category ViewCategory - 2026-07-24 | Tag **153** HTML (`view_category`→`ViewCategory`); trigger **152** regex includes `view_category`; Source SHA-256 `9bdef37…`. Live `gtm.js` `"version":"131"` contains `view_category` + `ViewCategory`. |

### App / Vercel

| Gate | Status |
|------|--------|
| App commit | `e064fa6e2` (Cookiebot wait); feature `4bb03e100` |
| Production tip | **READY** — `dpl_hKyisKuTjx6c68P8FBVThe31WCLy` aliased to `utekos.no` |
| dataLayer `view_category` after consent | **PASS** — before consent count `0`; after Allow-All count `1` |
| Consent on event | **PASS** — `marketing=granted` |
| `POST /api/events/view-category` | **PASS** — HTTP `202` |
| Meta Pixel `ViewCategory` shared `event_id` | **PASS (EM-VISIBLE)** — user Overview confirmation below; automation often lacks `fbevents.js` |
| Meta CAPI | **N/A** — matrix Meta server = `-` |

### Browser smoke sample

| Field | Value |
|-------|-------|
| Route | `https://utekos.no/produkter?vc_smoke=consentwait` |
| `event_id` | `9b48e2c0-1ad7-4a9b-a296-e33cf760e4fc` |
| `category_id` | `produkter` |
| `category_name` | `Kolleksjonen` |
| `view_sequence` | `1` |
| API | `202` |

Secondary Chrome sample (post-consent): `4b5569c5-9fde-491e-b5f5-2f68990c05df`.  
EM-VISIBLE sample: `d8a3cf31-14b6-47fb-8261-8fb46dbdef2c` (`/produkter?vc_em=1` → Overview).

## Meta Events Manager visibility — GO (EM-VISIBLE)

Hard gate **CLOSED**. Pixel-only path (matrix Meta server = `-`) uses Events Manager **Overview / Pixel** for `ViewCategory` (same bar as `view_cart` / `LandingScrollDepth`).

| Gate | Status |
|------|--------|
| Meta Events Manager **Overview / Pixel** (`ViewCategory`) | **PASS** — user confirmed |
| Pixel / dataset | `1092362672918571` |
| `event_id` | `d8a3cf31-14b6-47fb-8261-8fb46dbdef2c` |
| Status | Processed · Browser · Manual Setup |
| Parameters | `content_category=produkter`, `content_name=Kolleksjonen`, `view_sequence=1` |
| `action_source` | `website` |
| Advanced Matching | IP + UA |
| EM URL display | Meta may show `https://utekos.no/` even when fired from `/produkter` (known Overview quirk) |

## How to verify in Meta Events Manager

1. Open Pixel/dataset `1092362672918571` → **Overview** (not Test Events-only).
2. Visit `utekos.no/produkter` or `/gaveguide` with marketing consent.
3. Look for custom event **`ViewCategory`** freshness.
4. Optional browser check: `__utekosMetaPixelState.sent` contains `ViewCategory:<event_id>` matching dataLayer `view_category.event_id`.

## Hard stop (queue advance)

Hard gate for queue #6 is **CLOSED** (EM-VISIBLE confirmed).  
Do **not** auto-continue to queue #7 (`hero_interact`) without explicit start approval.
