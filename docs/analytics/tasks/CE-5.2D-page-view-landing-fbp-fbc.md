# CE-5.2D — page_view landing fbp/fbc server enhancement

```text
Charter-versjon: 1.0.0
Roadmap-versjon: 1.0.0
Roadmap-oppgave: CE-5.2D (DEC-015 PageView Event Enhancement)
Berørte invariants: INV-001, INV-002, INV-003
Start-SHA: 386a1b0010572e3982d2aba49a55b1d895de4a2b
Dokumentasjonsstatus: Tilstrekkelig (Meta attachments + live ledger)
```

## 1. Mål

Close the PageView landing race where marketing-consented events
arrived with `fbclid` but `has_fbp=0` / missing `fbc`. Ensure
CanonicalEvent `page_view` persist carries:

- stable `event_id` (dedupe key with browser)
- `external_id` when present
- first-party `_fbp` / `fbp` always when marketing granted
- `_fbc` / `fbc` when `fbclid` is observed (page_url query preferred)

Read `fbclid` server-side from document `page_url` query string
(Meta best practice), with API request query as fallback. Set
first-party cookies on the accept response (Event Enhancement).

## 2. Architecture decision

- **Use:** CanonicalEvent → ParamBuilder → first-party cookies →
  Supabase ledger/outbox → cron Meta CAPI
- **Do not use:** Firestore or Google Sheets for click-id /
  event enhancement (DEC-015)
- GTG / sGTM remain browser Google path; not Meta identity store

## 3. Ikke-mål

- GTM publish
- Firestore / Sheets enrichment product
- add_to_cart EMQ / CE-2.4/2.5
- push / deploy without separate order

## 4. Allowed files

```text
src/lib/analytics/server/ensureCanonicalMetaBrowserIds.ts
src/lib/analytics/server/ensureCanonicalMetaBrowserIds.test.ts
src/lib/analytics/server/acceptCanonicalPageView.ts
src/lib/analytics/server/acceptCanonicalPageView.test.ts
src/lib/analytics/server/handleCanonicalPageViewRequest.ts
src/lib/analytics/server/normalizeCanonicalPageView.ts
src/lib/analytics/enrichCanonicalEventWithMetaAttribution.ts
src/app/api/events/page-view/route.ts
docs/analytics/tasks/CE-5.2D-page-view-landing-fbp-fbc.md
docs/analytics/evidence/ce-5.2d-page-view-landing-fbp-fbc.md
docs/analytics/decision-log.md
docs/analytics/known-deviations.md
docs/analytics/evidence-register.md
docs/analytics/current-handoff.md
```

## 5. Verification

```bash
pnpm exec tsx --test \
  src/lib/analytics/server/ensureCanonicalMetaBrowserIds.test.ts \
  src/lib/analytics/server/acceptCanonicalPageView.test.ts
```

## 6. Stop

Stop after evidence + handoff. Do not auto-continue.
