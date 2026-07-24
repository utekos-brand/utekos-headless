# Evidence: scroll_depth ScrollDepthObserver + Meta LandingScrollDepth (queue #5)

**Date:** 2026-07-24  
**Start SHA:** `2cabe991d11ec31ae0ab580c9a4d33581a45da7a`  
**Roadmap:** Stale-events design queue #5 (`scroll_depth`)

## Governance preflight

```text
Charter-version: referenced by current-handoff 1.19.0 — program-charter.md / roadmap.md are NOT present on disk in this worktree
Roadmap task: Stale-events queue #5 scroll_depth (design 2026-07-24)
Affected invariants: once per page_view_id + threshold (25/50/75/90); consent fail-closed; Meta Pixel eventID = canonical event_id; no Meta CAPI (matrix Meta server = -)
Goal: reset thresholds on SPA navigation; Pixel map scroll_depth → LandingScrollDepth (existing Meta name); trigger 152; verify dataLayer + /api/events/scroll-depth + Google DM path
Non-goals: queue #6 view_category; Meta CAPI outbox (not in matrix); dual LandingScrollDepth legacy tag (none present in live workspace)
Allowed files: ScrollDepthObserver, web-meta-pixel.html, scroll_depth tests, this evidence, GTM tag 153 / trigger 152
Documentation status: design + handoff + matrix + existing catalog/API/Google adapter sufficient; charter/roadmap files missing on disk
```

## What shipped in-repo

- `ScrollDepthObserver` already emitted canonical `scroll_depth` at 25/50/75/90; now resets emitted thresholds on `pathname`/`search` change (aligned with `page_view_id + threshold` dedupe).
- Catalog + `/api/events/scroll-depth` + Google DM outbox already active; Meta CAPI left disabled per matrix (`-`).
- GTM template: `scroll_depth` → `LandingScrollDepth` + threshold/`percent_scrolled`/`document_height` params (install-race + isoCurrency fail-closed retained).
- Live workspace audit: **no separate legacy LandingScrollDepth tag** to pause (canonical Pixel tag 153 is the sole owner).

## Unit verification

```text
pnpm exec tsx --test src/lib/analytics/scrollDepthEvent.test.ts
→ pass

node --test scripts/tracking/web-meta-pixel-tag.test.mjs
→ pass (includes LandingScrollDepth + shared eventID; isoCurrency fail-closed retained; no-_fbp install retained)
```

Template SHA-256: `d12ec0df9cf0eb2b3900d64e7012405180e8a381faacc0e52b0a535afd7a3652`

## Live / production gates (2026-07-24)

### App / Vercel

| Gate | Status |
|------|--------|
| Production tip | PENDING deploy of this commit |
| dataLayer `scroll_depth` after threshold cross | PENDING smoke |
| `POST /api/events/scroll-depth` | PENDING smoke |

### Web GTM publish (`GTM-5TWMJQFP`)

| Version | Name | Notes |
|---------|------|-------|
| **130** | Meta Pixel scroll_depth LandingScrollDepth - 2026-07-24 | Tag **153** HTML (`scroll_depth`→`LandingScrollDepth` + threshold params); trigger **152** regex includes `scroll_depth`; `supportDocumentWrite` boolean `false`; install-race + isoCurrency retained. Source SHA-256 `d12ec0df9cf0eb2b3900d64e7012405180e8a381faacc0e52b0a535afd7a3652`. |

### Meta Pixel `LandingScrollDepth` browser parity

| Gate | Status |
|------|--------|
| `window.fbq` + tag 153 initialized | PENDING smoke |
| Shared `event_id` Pixel↔dataLayer | PENDING smoke |
| Meta CAPI | **N/A** — matrix Meta server = `-` for `scroll_depth` |
| Events Manager visibility | Prefer **Overview / Pixel** path (same bar as `view_cart`). Test Events under **TEST30107** may stay empty without CAPI. |

## Hard stop

Do not auto-continue to queue #6 (`view_category`).
