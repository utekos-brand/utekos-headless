# Evidence: view_category /produkter + /gaveguide + Meta ViewCategory (queue #6)

**Date:** 2026-07-24  
**Start SHA:** `9032f040ed2f2a20af340c8e317507cec9cd1013`  
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
- UI: `ViewCategoryObserver` once on `/produkter` overview **layout** (`category_id=produkter`) and once on `/gaveguide` (`category_id=gaveguide`). Removed duplicate mount from produkter `page.tsx` (would double-fire).
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
| **131** | Meta Pixel view_category ViewCategory - 2026-07-24 | Tag **153** HTML (`view_category`→`ViewCategory`); trigger **152** regex includes `view_category`; Source SHA-256 `9bdef37…`. |

### App / Vercel / smoke

Filled after commit/push + production Ready + browser smoke on `/produkter` (and optionally `/gaveguide`).

| Gate | Status |
|------|--------|
| App commit | _pending fill_ |
| Production tip | _pending fill_ |
| dataLayer `view_category` | _pending fill_ |
| `POST /api/events/view-category` | _pending fill_ |
| Pixel `ViewCategory` shared `event_id` | _pending fill_ |
| Meta CAPI | **N/A** — matrix Meta server = `-` |

## How to verify in Meta Events Manager

1. Open Pixel/dataset `1092362672918571` → **Overview** (not Test Events-only).
2. Look for custom event **`ViewCategory`** freshness after visiting `utekos.no/produkter` or `/gaveguide` with marketing consent.
3. Optional browser check: `__utekosMetaPixelState.sent` contains `ViewCategory:<event_id>` matching dataLayer `view_category.event_id`.

## Hard stop

Do **not** auto-continue to queue #7 (`hero_interact`).
