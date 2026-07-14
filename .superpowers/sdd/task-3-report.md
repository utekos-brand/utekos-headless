# Task 3 report

Status: implemented locally without production mutations. Initial Task 3 is
commit `f9c8aa98d`; review remediation is ready for a separate commit.

## Delivered

- Fail-closed GTM guard for live web `108` / server `23`, workspaces `113/26`,
  exact fingerprints, exact workspace change descriptors and immutable server
  client `6` fingerprint `1783840862217`.
- Direct official `workspaces.quick_preview` evidence capture with compiler,
  sync, workspace fingerprint, normalized API-response digest and previewed
  resource digest. The guard re-captures live evidence, requires freshness,
  explicit confirmation and a clean git worktree.
- Full importable server monitoring template export with minimal event data,
  container metadata, tag execution metadata, fixed HTTPS receipt permission
  and `receipt-key` custom private key permission.
- Dry-run-by-default GCP/Vercel hardening tool with separately gated receipt
  secret + Preview, Production, Cloud mount, Budget API and operations phases.
  The first phase is retry-idempotent for absent resources and zero-version
  resources; valid enabled versions are reused, while access/parse/state errors
  fail closed. Cloud mount never creates a key. Wrong Vercel targets and
  same-name GCP drift fail closed.
- Read-only verifier for Vercel env presence, Cloud Run service-level 3/10,
  concurrency 80, dedicated identity, Secret Manager resource/enabled latest
  version/nonprinted key validation/IAM/exact `latest` file mount/env,
  `/healthy` host/path/TLS/regions, exact logging metrics, exact alert
  conditions/channels and last-period budget thresholds 80/100.
- Report-Only CSP compatibility policy permitting the active first-party
  `/gtm.js` origin, plus a strictly allowlisted/non-reflecting report receiver
  and an explicit 24-hour enforcement gate.
- Exact `/g/collect` numerator/denominator log metrics, count-only raw-UPD
  coverage across request URL and structured fields, and an exact project-
  scoped budget filter.
- Deterministic receipt keys (`eventId:sgtm_ingress` and
  `eventId:tag_execution:tagId`) plus deterministic top-level GTM entity
  normalization that preserves semantically ordered nested parameters.
- Corrected release order, Supabase lint syntax, browser-fallback contradiction
  and GA4/BigQuery interim-signoff language in canonical docs.

## Verification

- Task 3/GCP/GTM/template/CSP/commerce-evidence tests: 19 passed.
- Full `src/lib/tracking/**/*.test.ts`: 117 passed.
- Quick Preview capture through JSON-only `npm run --silent`: web workspace
  `113` against live `108` and server workspace `26` against live `23` are
  compiler/sync clean; both workspace change sets remain empty.
- `pnpm exec tsc --noEmit`: passed.
- `npm run tracking:sgtm-loaders:verify`: `/healthy`, `/gtm.js`, `/ns.html`
  and canonical `/gtag/js` all HTTP 200.
- Publish guard with fresh evidence and exact confirmation: expected fail-
  closed on the shared dirty worktree before any provider call.
- Hardening verifier: expected fail-closed with current live gaps enumerated,
  including absent Secret Manager resource/version, 0/5 capacity, metrics,
  alerts and budget API/filter. Secret material was not printed.
- Hardening apply command in default mode: printed dry-run plan only.
- `git diff --check`: passed after remediation.
- JSON and Node syntax checks: passed.

## Blocked verification

- The original Task 3 build attempt compiled and reached the documented
  missing-`SHOPIFY_ADMIN_API_TOKEN` page-data caveat. The remediation build
  attempt compiled successfully and completed `runAfterProductionCompile`, but
  did not progress past Next's TypeScript phase and was stopped after extended
  inactivity. Standalone `pnpm exec tsc --noEmit` is green.
- `supabase db push --linked --dry-run` is blocked because this worktree has no
  `SUPABASE_ACCESS_TOKEN`; no database mutation was attempted.
- The custom `.tpl` import/compile is intentionally deferred to the separately
  approved server-GTM workspace mutation and Quick Preview gate.
- GA4 BigQuery dataset `analytics_489598217` remains absent, so full BigQuery
  sign-off is blocked; GA4-only evidence is interim.

## Mutation statement

No GTM, Google Cloud, Vercel, Supabase, Shopify or other production mutation
was executed by Task 3.
