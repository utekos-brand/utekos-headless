# CE-5.2D evidence — page_view landing fbp/fbc enhancement

```text
Charter-version: 1.0.0
Roadmap: CE-5.2D / DEC-015
Goal: eliminate marketing page_view rows with fbclid but has_fbp=0
Conclusion: CODE_CONTRACT_PROVEN_SERVER_ENHANCEMENT
Start-SHA: 386a1b0010572e3982d2aba49a55b1d895de4a2b
Captured: 2026-07-22T10:20:00+02:00
```

## 1. Problem (live 7d before fix)

Marketing-granted `page_view` with `fbclid` but missing `fbc`:
**265** rows; **261** had `fbclid` in `page_url`; **`has_fbp=0` on all**.
Overall PageView `fbc` coverage ~49.7% (near historical ~54% Click ID).

Root cause: landing race — ParamBuilder/`_fbp`/`_fbc` not ready before
client enrich timed out (1s), while server accept trusted empty body
cookies.

## 2. Meta / attachment alignment

Checked under
`~/.codex/attachments/9fc07233-cea2-4a7f-8e64-d23053f05051/`:

| Guidance | Implementation |
| --- | --- |
| Read `fbclid` from URL query server-side, case-sensitive | `ensureCanonicalMetaBrowserIds` from `page_url` then request URL |
| Format + store `_fbc` 90d first-party cookie | ParamBuilder + `Set-Cookie` on page-view response |
| Always send `fbc` with CAPI when available | ledger `browser_id.fbc` before outbox |
| `external_id` + `fbp` together | existing external_id path unchanged; `fbp` now minted on accept |
| Event Enhancement (cookies + enrich when missing) | server ensure + client enrich timeout 2.5s + one retry |

## 3. DEC-015 — no Firestore / Sheets

Event enhancement stays on **first-party cookies + CanonicalEvent +
Supabase ledger/outbox**. Firestore/Google Sheets would add a parallel
identity store outside INV-001 pipeline and RealTime freshness for
PageView dedupe keys.

```text
GTG = first-party Google script delivery
sGTM = realtime Google multivendor collection
Supabase ledger/outbox = durable truth, idempotency, retries
```

## 4. Code change

- `ensureCanonicalMetaBrowserIds` — CanonicalEvent-first mint of `fbp`
  (always when marketing) and `fbc` when `fbclid` present
- `acceptCanonicalPageView` applies ensure before persist
- page-view route passes `cookieHeader` + `requestUrl`
- response sets `_fbp`/`_fbc` for later browser reuse
- client enrich: 2500ms timeout + one retry when `fbclid` present

## 5. Unit verification

```bash
pnpm exec tsx --test \
  src/lib/analytics/server/ensureCanonicalMetaBrowserIds.test.ts \
  src/lib/analytics/server/acceptCanonicalPageView.test.ts
```

Result: **11 pass / 0 fail** (includes landing `fbclid` → `fbp`+`fbc`).

## 6. Remaining

| Item | Status |
| --- | --- |
| Production deploy of CE-5.2D | **NOT AUTHORIZED** this microtask |
| Post-deploy 7d `has_fbp=0` with fbclid = 0 | requires deploy + measure |
| ~54% total PageView Click ID (organic denominator) | expected residual; measure `fbc\|fbclid` |

## 7. Conclusion

```text
CODE_CONTRACT_PROVEN_SERVER_ENHANCEMENT
PageView accept path can no longer persist marketing events with
fbclid and empty fbp when ParamBuilder can mint identifiers.
WAITING_FOR_STARTORDRE for deploy / post-deploy proof.
```
