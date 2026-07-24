# Evidence: scroll_depth ScrollDepthObserver + Meta LandingScrollDepth (queue #5)

**Date:** 2026-07-24  
**Start SHA:** `2cabe991d11ec31ae0ab580c9a4d33581a45da7a`  
**Roadmap:** Stale-events design queue #5 (`scroll_depth`)  
**Tip at Meta EM-VISIBLE GO:** see commit that closes this hard gate

## Governance preflight

```text
Charter-version: referenced by current-handoff 1.19.1 — program-charter.md / roadmap.md are NOT present on disk in this worktree
Roadmap task: Stale-events queue #5 scroll_depth (design 2026-07-24)
Affected invariants: once per page_view_id + threshold (25/50/75/90); consent fail-closed; Meta Pixel eventID = canonical event_id; no Meta CAPI (matrix Meta server = -)
Goal: reset thresholds on SPA navigation; Pixel map scroll_depth → LandingScrollDepth (existing Meta name); trigger 152; verify dataLayer + /api/events/scroll-depth + Google DM path
Non-goals: queue #6 view_category; Meta CAPI outbox (not in matrix); dual LandingScrollDepth legacy tag (none present in live workspace)
Allowed files: ScrollDepthObserver, web-meta-pixel.html, scroll_depth tests, this evidence, GTM tag 153 / trigger 152, design/handoff GO close
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
| App commit | `e1835be327385d4ca33aa130638e00800efb3356` (SPA threshold reset); tip includes build unblock `45e532895` |
| Production tip | **READY** — `45e532895` (`dpl_CFCmMKD3V98hgPqEZjwTZizDuZzP`) |
| dataLayer `scroll_depth` after threshold cross | **PASS** — `07b5f5f2-9917-442c-a6d8-daaf7dd5f26d` (`threshold=25`, `percent_scrolled=25`, `page_view_id` present) |
| `POST /api/events/scroll-depth` | **PASS** — HTTP `202` |

### Web GTM publish (`GTM-5TWMJQFP`)

| Version | Name | Notes |
|---------|------|-------|
| **130** | Meta Pixel scroll_depth LandingScrollDepth - 2026-07-24 | Tag **153** HTML (`scroll_depth`→`LandingScrollDepth` + threshold params); trigger **152** regex includes `scroll_depth`; `supportDocumentWrite` boolean `false`; install-race + isoCurrency retained. Source SHA-256 `d12ec0df9cf0eb2b3900d64e7012405180e8a381faacc0e52b0a535afd7a3652`. Live `gtm.js` `"version":"130"` contains `scroll_depth` + `LandingScrollDepth`. |

### Meta Pixel `LandingScrollDepth` browser parity

| Gate | Status |
|------|--------|
| `window.fbq` + tag 153 initialized | **PASS** |
| Shared `event_id` Pixel↔dataLayer | **PASS** — `__utekosMetaPixelState.sent['LandingScrollDepth:07b5f5f2-9917-442c-a6d8-daaf7dd5f26d']` |
| Meta `/tr` LandingScrollDepth | Not required for gate; Pixel state.sent is authoritative for shared `eventID` |
| Meta CAPI | **N/A** — matrix Meta server = `-` for `scroll_depth` |
| Events Manager visibility | **EM-VISIBLE GO** — user confirmed Overview / Pixel path for `LandingScrollDepth` (no CAPI; Test Events under **TEST30107** may stay empty) |

## Meta Events Manager visibility — GO (EM-VISIBLE)

Hard gate **CLOSED**. Pixel-only path (matrix Meta server = `-`) uses Events Manager **Overview / Pixel** for `LandingScrollDepth` (same bar as `view_cart`). User confirmed four threshold rows on `https://utekos.no/` with `action_source=website` and Advanced Matching IP + UA.

| Gate | Status |
|------|--------|
| Meta Events Manager **Overview / Pixel** (`LandingScrollDepth`) | **PASS** — user confirmed |
| Pixel / dataset | `1092362672918571` |
| URL | `https://utekos.no/` |
| `action_source` | `website` |
| Advanced Matching | IP + UA |

### Events Manager GO — event IDs (user-confirmed)

| threshold | `percent_scrolled` | `document_height` | `event_id` |
|-----------|--------------------|-------------------|------------|
| 90 | 90 | 8150 | `9a4c0da9-aaeb-45d3-bbd4-7a1a2ffa614b` |
| 75 | 75 | 8150 | `0ec09d07-81be-417b-b517-2f87bfbfd1eb` |
| 50 | 50 | 1902 | `cde6d55a-a56e-4f78-8164-5199b059630a` |
| 25 | 25 | 1902 | `1b3a412c-e3c6-4978-ac26-d123216e769a` |

Earlier browser smoke (kept): `07b5f5f2-9917-442c-a6d8-daaf7dd5f26d` (`threshold=25`, dataLayer + Pixel `LandingScrollDepth:<event_id>` parity).

## How to verify in Meta Events Manager

1. Open Pixel/dataset `1092362672918571` → **Overview** (not Test Events-only).
2. Look for custom event **`LandingScrollDepth`** freshness after scrolling past 25% on `utekos.no` with marketing consent.
3. Optional browser check: after scroll, `__utekosMetaPixelState.sent` contains `LandingScrollDepth:<event_id>` matching dataLayer `scroll_depth.event_id`.

## Hard stop (queue advance)

Hard gate for queue #5 is **CLOSED** (EM-VISIBLE confirmed).  
Do **not** auto-continue to queue #6 (`view_category`).
