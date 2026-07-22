# CSP GA4/Ads + Klarna Host Allowlist

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Stop Report-Only CSP violations for documented GA4 advertising hosts and Klarna CDN fonts/styles before any future enforcement flip.

**Architecture:** All storefront CSP is built in one place — [`src/lib/security/buildReportOnlyCsp.ts`](src/lib/security/buildReportOnlyCsp.ts) — and applied as `Content-Security-Policy-Report-Only` from [`src/proxy.ts`](src/proxy.ts). Extend existing origin constants (or add a small GA4 measurement/advertising constant) and wire them into `connect-src` / `img-src`; add `https://x.klarnacdn.net` only to `style-src` and `font-src`. Keep policy Report-Only. Never allow scheme-wide `https:`.

**Tech Stack:** Next.js proxy headers, Node `node:test` via `pnpm exec tsx --test`, existing CSP report endpoint `/api/security/csp-report`.

**Plan file (on execute):** Also persist this plan to [`docs/superpowers/plans/2026-07-22-csp-ga4-klarna-hosts.md`](docs/superpowers/plans/2026-07-22-csp-ga4-klarna-hosts.md) per writing-plans convention.

## Global Constraints

- Stay on `Content-Security-Policy-Report-Only` — do not switch to enforcing `Content-Security-Policy`.
- Do not add scheme allowlists (`https:`, `http:`, `*`).
- Norway market: add `https://*.google.no` only (not the full Google TLD list).
- Replace `https://www.google.com` with `https://*.google.com` in `connect-src` and `img-src`.
- Keep existing specific Ads hosts in `GOOGLE_ADS_ORIGINS` (used by `script-src`); adding `https://*.g.doubleclick.net` to connect/img is additive, not a rewrite of script-src.
- Klarna: allow `https://x.klarnacdn.net` in `style-src` and `font-src` only (already present in script/connect via `KLARNA_ORIGINS`).
- Source of truth for Google hosts: [Tag Platform CSP — GA4](https://developers.google.com/tag-platform/security/guides/csp#google_analytics_4).

## File map

| File | Responsibility |
|------|----------------|
| [`src/lib/security/buildReportOnlyCsp.ts`](src/lib/security/buildReportOnlyCsp.ts) | Single CSP string builder — only production change |
| [`src/lib/security/buildReportOnlyCsp.test.ts`](src/lib/security/buildReportOnlyCsp.test.ts) | Assert new hosts and Klarna style/font; assert no `https:` scheme allow |
| [`src/proxy.ts`](src/proxy.ts) | Unchanged wiring (`buildReportOnlyCsp()` → Report-Only header) |
| [`docs/superpowers/plans/2026-07-22-csp-ga4-klarna-hosts.md`](docs/superpowers/plans/2026-07-22-csp-ga4-klarna-hosts.md) | Saved plan artifact |

## Current gap (evidence)

Today in `buildReportOnlyCsp.ts`:

```73:74:src/lib/security/buildReportOnlyCsp.ts
    'https://*.google-analytics.com',
    'https://www.google.com',
```

```103:104:src/lib/security/buildReportOnlyCsp.ts
    'style-src \'self\' \'unsafe-inline\'',
    'font-src \'self\' data:',
```

Missing vs Google GA4 advertising CSP + production reports: `*.analytics.google.com`, `*.g.doubleclick.net`, `*.google.com` / `*.google.no`. Klarna styles/fonts from `x.klarnacdn.net` are not in `style-src` / `font-src`.

```mermaid
flowchart LR
  proxy[proxy.ts] --> builder[buildReportOnlyCsp]
  builder --> header[CSP-Report-Only]
  header --> browser[Browser]
  browser -->|violations| report[/api/security/csp-report]
```

---

### Task 1: Failing tests for GA4 + Klarna CSP hosts

**Files:**
- Modify: [`src/lib/security/buildReportOnlyCsp.test.ts`](src/lib/security/buildReportOnlyCsp.test.ts)
- Test: same file

**Interfaces:**
- Consumes: `buildReportOnlyCsp(): string`
- Produces: assertions later tasks must keep green

- [x] **Step 1: Write the failing test**

Add a third test (keep existing two intact):

```ts
test('permits GA4 advertising hosts and Klarna CDN assets required by report-only rollout', () => {
  const csp = buildReportOnlyCsp()

  assert.match(csp, /connect-src[^;]*https:\/\/\*\.analytics\.google\.com/)
  assert.match(csp, /connect-src[^;]*https:\/\/\*\.g\.doubleclick\.net/)
  assert.match(csp, /connect-src[^;]*https:\/\/\*\.google\.com/)
  assert.match(csp, /connect-src[^;]*https:\/\/\*\.google\.no/)
  assert.match(csp, /img-src[^;]*https:\/\/\*\.analytics\.google\.com/)
  assert.match(csp, /img-src[^;]*https:\/\/\*\.g\.doubleclick\.net/)
  assert.match(csp, /img-src[^;]*https:\/\/\*\.google\.com/)
  assert.match(csp, /img-src[^;]*https:\/\/\*\.google\.no/)
  assert.match(csp, /style-src[^;]*https:\/\/x\.klarnacdn\.net/)
  assert.match(csp, /font-src[^;]*https:\/\/x\.klarnacdn\.net/)

  assert.doesNotMatch(csp, /connect-src[^;]*https:\/\/www\.google\.com(?:\s|;|$)/)
  assert.doesNotMatch(csp, /img-src[^;]*https:\/\/www\.google\.com(?:\s|;|$)/)
  assert.doesNotMatch(csp, /(?:^|;\s)(?:default-src|connect-src|img-src|script-src|style-src|font-src)[^;]*\shttps:(?:\s|;|$)/)
})
```

- [x] **Step 2: Run test to verify it fails**

Run: `pnpm exec tsx --test src/lib/security/buildReportOnlyCsp.test.ts`

Expected: FAIL — missing `*.analytics.google.com` / `*.g.doubleclick.net` / `*.google.no` / Klarna style+font matches (and possibly still matching `www.google.com`).

- [x] **Step 3: Commit**

```bash
git add src/lib/security/buildReportOnlyCsp.test.ts
git commit -m "$(cat <<'EOF'
test: assert GA4 and Klarna CSP host allowlist gaps

EOF
)"
```

---

### Task 2: Extend `buildReportOnlyCsp` allowlists

**Files:**
- Modify: [`src/lib/security/buildReportOnlyCsp.ts`](src/lib/security/buildReportOnlyCsp.ts)
- Test: [`src/lib/security/buildReportOnlyCsp.test.ts`](src/lib/security/buildReportOnlyCsp.test.ts)

**Interfaces:**
- Consumes: existing `KLARNA_ORIGINS`, `GOOGLE_ADS_ORIGINS`, `joinOrigins`
- Produces: updated CSP string still returned by `buildReportOnlyCsp(): string`

- [x] **Step 1: Add GA4 measurement/advertising constants**

Insert after `GOOGLE_ADS_ORIGINS`:

```ts
const GA4_COLLECTION_ORIGINS = [
  'https://*.google-analytics.com',
  'https://*.analytics.google.com'
] as const

const GA4_ADVERTISING_ORIGINS = [
  'https://*.g.doubleclick.net',
  'https://*.google.com',
  'https://*.google.no'
] as const

const KLARNA_ASSET_ORIGINS = ['https://x.klarnacdn.net'] as const
```

- [x] **Step 2: Wire constants into directives**

In `connectSrc` and `imgSrc`, replace the two inline Google lines:

```ts
// remove:
// 'https://*.google-analytics.com',
// 'https://www.google.com',

// add:
...GA4_COLLECTION_ORIGINS,
...GA4_ADVERTISING_ORIGINS,
```

Update style/font lines:

```ts
`style-src ${joinOrigins(['\'self\'', '\'unsafe-inline\'', ...KLARNA_ASSET_ORIGINS])}`,
`font-src ${joinOrigins(['\'self\'', 'data:', ...KLARNA_ASSET_ORIGINS])}`,
```

Do not change `script-src`, `frame-src`, Report-Only usage in `proxy.ts`, or add `https:`.

- [x] **Step 3: Run tests to verify they pass**

Run: `pnpm exec tsx --test src/lib/security/buildReportOnlyCsp.test.ts`

Expected: PASS (all three tests).

- [x] **Step 4: Commit**

```bash
git add src/lib/security/buildReportOnlyCsp.ts src/lib/security/buildReportOnlyCsp.test.ts
git commit -m "$(cat <<'EOF'
fix: allow GA4 advertising and Klarna CDN hosts in report-only CSP

EOF
)"
```

---

### Task 3: Local header smoke + handoff notes

**Files:**
- Modify: none required (verify only)
- Optional artifact: persist plan under `docs/superpowers/plans/` if not already written

- [x] **Step 1: Confirm header composition in Node**

Run:

```bash
pnpm exec tsx -e "import { buildReportOnlyCsp } from './src/lib/security/buildReportOnlyCsp.ts'; console.log(buildReportOnlyCsp())"
```

Expected: printed policy contains all of:
- `https://*.analytics.google.com`
- `https://*.g.doubleclick.net`
- `https://*.google.com`
- `https://*.google.no`
- `style-src` … `https://x.klarnacdn.net`
- `font-src` … `https://x.klarnacdn.net`
- and does **not** contain a bare `https:` token as an origin, and does **not** list `https://www.google.com` as a discrete host.

- [x] **Step 2: Post-deploy verification checklist (after release; blocked until deployed)**

1. Confirm production still sends `Content-Security-Policy-Report-Only` (not enforcing).
2. Watch Vercel/runtime logs for `csp-report` entries mentioning `analytics.google.com`, `g.doubleclick.net`, `google.no`, or `x.klarnacdn.net` — expect those specific violations to stop for new traffic.
3. Do **not** flip to enforcement in this change set.

- [x] **Step 3: Commit plan artifact if created on disk**

```bash
mkdir -p docs/superpowers/plans
# write docs/superpowers/plans/2026-07-22-csp-ga4-klarna-hosts.md from this plan
git add docs/superpowers/plans/2026-07-22-csp-ga4-klarna-hosts.md
git commit -m "$(cat <<'EOF'
docs: add CSP GA4 and Klarna host allowlist plan

EOF
)"
```

## Self-review

| Spec requirement | Task |
|------------------|------|
| Add `*.analytics.google.com` to connect+img | Task 2 |
| Add `*.g.doubleclick.net` to connect+img | Task 2 |
| Add `*.google.no` to connect+img | Task 2 |
| Use `*.google.com` instead of `www.google.com` | Task 2 |
| No general `https:` allow | Tasks 1–2 |
| Klarna `x.klarnacdn.net` in font-src + style-src | Task 2 |
| Stay Report-Only; enforcement remains blocked | Global + Task 3 |

## Out of scope

- Flipping CSP to enforcement
- Adding all Google ccTLDs beyond `.no`
- Changing Cookiebot/GTM/Meta/Microsoft allowlists
- Changing `/api/security/csp-report` parsing
