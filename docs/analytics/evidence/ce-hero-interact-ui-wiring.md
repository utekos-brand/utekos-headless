# Evidence: hero_interact homepage CTA + Meta HeroInteract (queue #7)

**Date:** 2026-07-24  
**Start SHA:** `191c73393c67b8bb41dcc542ac7125f37cff95df`  
**Roadmap:** Stale-events design queue #7 (`hero_interact`)

## Governance preflight

```text
Charter-version: referenced by current-handoff 1.19.3 — program-charter.md / roadmap.md often missing on disk
Roadmap task: Stale-events queue #7 hero_interact (design 2026-07-24)
Affected invariants: consent fail-closed; Meta Pixel eventID = canonical event_id; no Meta CAPI (matrix Meta server = -)
Goal: catalog + reporter + /api/events/hero-interact + Google DM; Pixel map hero_interact → HeroInteract; wire ReadMoreHeroClick
Non-goals: queue #8+; Meta CAPI outbox; inventing extra hero surfaces beyond frontpage CTA
Allowed files: heroInteract*, API route, catalog/matrix, MotionContentView, ChevronDown, web-meta-pixel.html, GTM tag 153 / trigger 152, this evidence
Documentation status: design + view_category clone path + handoff sufficient
```

## What shipped in-repo

- New canonical `hero_interact` (Zod + reporter + collector + `/api/events/hero-interact` + Google DM adapter/outbox/worker).
- Catalog lifecycle `active`; Meta CAPI `not_relevant` (browser Pixel only).
- UI: `MotionContentView` «Se mer» and `ChevronDownSection` emit on click (`cta_id=read_more_hero`, `destination_path=/skreddersy-varmen`, `click_sequence=1`).
- GTM template: `hero_interact` → `HeroInteract` with `content_name` / `content_category` / `click_sequence`.

## Unit verification

```text
pnpm exec tsx --test \
  src/lib/analytics/heroInteractEvent.test.ts \
  src/lib/analytics/eventCatalog.test.ts \
  src/lib/analytics/canonicalEvent.test.ts \
  src/lib/analytics/server/providerRegistryContract.test.ts
→ pass (31 canonical events)

node --test scripts/tracking/web-meta-pixel-tag.test.mjs
→ pass (includes HeroInteract + shared eventID)
```

Template SHA-256: `10199cc8ce1a7026621346d28913df5077a4ace2b1b58475530ed0e90d4ee541`

## Live / production gates (2026-07-24)

### Web GTM publish (`GTM-5TWMJQFP`)

| Version | Name | Notes |
|---------|------|-------|
| **132** | Meta Pixel hero_interact HeroInteract - 2026-07-24 | Tag **153** HTML (`hero_interact`→`HeroInteract`); trigger **152** regex includes `hero_interact`; Source SHA-256 `10199cc8…`. Live `gtm.js` `"version":"132"` contains `hero_interact` + `HeroInteract`. |

### App / Vercel

| Gate | Status |
|------|--------|
| App commit | `aaca17cf2` |
| Production tip | **READY** — `dpl_36uANn1Fyhr6gDcZVgNkKzZAF6fe` aliased to `utekos.no` |
| dataLayer `hero_interact` on CTA click | **PASS** — `f2ecfe32-cf4d-4cf5-aa7a-3fed954c618b` |
| `POST /api/events/hero-interact` | **PASS** — HTTP `202` |
| Meta Pixel `HeroInteract` shared `event_id` | **Blocked in automation** — prefer Overview path |
| Meta CAPI | **N/A** — matrix Meta server = `-` |

### Browser smoke sample

| Field | Value |
|-------|-------|
| Route | `https://utekos.no/?hi_smoke=1` |
| `event_id` | `f2ecfe32-cf4d-4cf5-aa7a-3fed954c618b` |
| `cta_id` | `read_more_hero` |
| `destination_path` | `/skreddersy-varmen` |
| `click_sequence` | `1` |
| API | `202` |

## How to verify in Meta Events Manager

1. Open Pixel/dataset `1092362672918571` → **Overview** (not Test Events-only).
2. Visit `utekos.no`, Allow marketing, click hero **Se mer**.
3. Look for custom event **`HeroInteract`** freshness.
4. Optional: `__utekosMetaPixelState.sent` contains `HeroInteract:<event_id>`.

## Hard stop

Do **not** auto-continue to queue #8 (`interact_with_accordion`). Await EM/Overview confirmation before next item.
