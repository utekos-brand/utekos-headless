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

## Live / production gates

_Populate after GTM publish + app deploy + browser smoke + EM Overview._

## Hard stop

Do **not** auto-continue to queue #8 (`interact_with_accordion`). Await EM/Overview confirmation before next item.
