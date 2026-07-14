# Deployment And Migration Checklist

Status date: 2026-07-14

This is the mandatory release checklist for Utekos Headless. Use it
before every deploy, production mutation, provider change, GTM publish,
tracking change, database migration, or operational tooling change.

The purpose is simple: no runtime change should reach production before
its required database, provider, environment, and verification steps are
known and completed in the correct order.

## Golden Rules

- Never deploy Vercel runtime code before required Supabase production
  schema changes are applied and verified.
- Never run `supabase db reset --linked`, destructive SQL, blind diffs,
  or drop-generating migration output against production.
- Never hand-edit generated MCP files such as `mcp.json`,
  `.vscode/mcp.json`, or `.cursor/mcp.json`.
- Never publish GTM, mutate provider resources, change campaigns,
  change budgets, change Shopping catalogs, deploy Microsoft Ads
  Scripts, mutate Shopify catalog data, or deploy production without
  explicit user approval for that concrete action.
- Treat Meta, Google, and Microsoft as equal first-class ad platforms
  whenever they are active.
- Treat row counts as evidence only when source, status, reason,
  unresolved/resolved state, and replay policy are visible.

## Canonical Git And Vercel Release Model

- `origin/main` is the only canonical production source reference.
- Local `main` must be clean and point to the same commit as
  `origin/main`. Do not develop or create commits directly on local
  `main`.
- Intentional work belongs on a named branch created from the latest
  `origin/main`. A branch being ahead is expected; a local `main`
  being ahead, behind after synchronization, dirty, or diverged is
  not.
- Linked worktrees are working directories, not additional production
  references. Use them only for concurrent active tasks, base their
  branches on current `origin/main`, and remove them when the task is
  committed or archived.
- `npm run repo:sync` is the only local main synchronization command.
  It fetches and prunes `origin`, then performs a fast-forward only
  when local `main` is clean and behind. It never stages, commits,
  pushes, merges divergent history, or deploys.
- `scripts/deploy/sync-and-deploy.mjs` is retired and exits fail-closed.
  It must never be restored as a combined stage/commit/push/direct-
  deploy command.
- The standard Vercel path is GitHub-based: a pushed candidate branch
  receives a preview, and an explicitly approved pull-request merge to
  `main` creates production. Do not run a second direct Vercel
  production deployment for the same release.

### Local integration audit 2026-07-14

The isolated Git operations, Microsoft Merchant, PostHog SDK, Klarna
product-card, storefront accessibility, MCP operations and source
hygiene releases were merged into a temporary local audit branch from
the current `origin/main`. There were no merge conflicts. Frozen
install without a minimum-release-age bypass, Next route type
generation, 14/14 targeted tests, MCP generation with 52 servers,
MCP/commerce doctors, ESLint for every changed code file, TypeScript
and a Vercel-like production build with 96/96 routes passed. The
temporary audit ref was removed after recording the result. It was not
pushed, deployed or treated as an alternative production reference.

This audit proves code-level compatibility. It does not replace the
Klarna provider preview gate, production environment verification,
Supabase migration ordering for the separate sGTM release, or explicit
approval for push, merge and production deployment.

### Remaining candidate classification 2026-07-14

- `codex/release-mcp-operations` contains only MCP configuration,
  operational servers, safe placeholder templates and their runbooks.
  It deliberately excludes the broad candidate's unused Google package
  expansion. The official Google Analytics MCP runtime is pinned at
  0.6.0 and verified against the current
  [Google Analytics MCP setup](https://developers.google.com/analytics/devguides/MCP).
- `codex/release-source-hygiene` contains a comment removal and the
  single-semicolon correction in migration `20260711190423`. That
  migration version already exists locally and remotely, so this branch
  must not trigger a schema push. Linked application-schema lint passes.
- The `posthog-js@1.399.2` minimum-release-age exclusion from the broad
  candidate was rejected. Frozen install now succeeds without bypassing
  the repository's supply-chain age policy.
- Every path from `codex/production-candidate-20260714` is therefore
  classified. The branch remains an archive, not a deploy unit.

## Required Preflight

Run these before deciding the release order:

| Check | Command or source | Required conclusion |
| --- | --- | --- |
| Canonical refs | `npm run repo:sync`, then `git rev-parse main origin/main` | Both refs resolve to the same commit before a new candidate branch is created. |
| Worktree scope | `git status --short` | Identify every intentional changed file and classify whether it is verified, pending verification, or a local artifact. |
| Runtime diff | `git diff --name-only` | Identify whether app runtime, Supabase, env, MCP, GTM, scripts, or docs changed. |
| Supabase history | `SUPABASE_NO_TELEMETRY=1 npx supabase migration list --linked` | Know exactly which local migrations are missing remote and which remote migrations are missing local. |
| Supabase schema proof | `SUPABASE_NO_TELEMETRY=1 npx supabase db dump --linked --schema ops,marketing --file /tmp/utekos-linked-ops-marketing-schema.sql` | Confirm production has the columns, constraints, tables, and views the runtime will use. |
| MCP config | `npm run mcp:build && npm run mcp:doctor` | Generated MCP output is derived from templates and has no inline secret findings. |
| Commerce MCP | `npm run mcp:commerce-tracking:doctor` | Read-only provider diagnostics and docs map are coherent. |
| Typecheck | `pnpm exec tsc --noEmit` | Runtime types pass. |
| Targeted tests | Use the tests touching changed runtime modules. | Changed behavior is covered. |
| Lint | `npm run lint` | Run when useful, but document existing unrelated repo debt if it is not a clean gate. |

## Change Matrix

| Change type | Must migrate or configure before Vercel deploy | Must deploy | Must verify after |
| --- | --- | --- | --- |
| Supabase schema read/write from runtime | Apply required migration to `hkoawfbomhnzupcsdggb`; verify schema dump contains new objects. | Vercel after Supabase. | `db lint`, schema dump grep, targeted runtime smoke. |
| Tracking runtime writes to `ops.provider_dispatch_attempts` | Ensure required columns, constraints, statuses, and views exist. | Vercel after Supabase. | Provider rows, skip classification, dead-letter summary. |
| PostHog client/runtime tracking | Ensure Cookiebot statistics consent is mapped and env vars are present. | Vercel. | Consent-gated init, no autocapture drift, masked replay, safe events only. |
| Google/Meta/Microsoft provider diagnostics | Configure local/provider credentials outside generated files. | Usually no Vercel deploy unless runtime changed. | Read-only probes and provider dashboard/API status. |
| MCP server/template changes | Update committed templates, then regenerate generated files locally. | No app deploy unless app runtime changed. | `mcp:build`, `mcp:doctor`, relevant MCP doctor. |
| GTM or sGTM behavior | Verify current docs, container IDs, workspace state, and consent model. | GTM publish only with explicit approval; Vercel if app loader changed. | GTM Preview, sGTM endpoints, production tracking smoke. |
| Vercel env vars | Pull/inspect env state and document changed keys. | Redeploy Vercel after env change. | Deployment inspect, runtime logs, route smoke. |
| Dead-letter replay runtime | No Supabase migration required when only app cron/route changes. | Vercel after code merge. | `/api/cron/replay-dead-letter` returns `401` (not `404`); `npm run ops:provider-dispatch-report`. |
| Microsoft UET CAPI env | Set UET tag ApiToken (Conversions API auth) in Vercel Production. | Redeploy after env change. | Purchase row not `missing_capi_token`; see Microsoft env gate. |
| Shopify/Klarna/Sanity runtime | Confirm provider docs, required env and provider-side allowed origins. | Vercel. | Route/action smoke, visible provider UI and provider response proof. |
| Docs-only root docs | No migration. | No production deploy required unless the deploy is used to publish docs. | `git diff --check` and direct file inspection. |

## Production Release Order

1. Read [AGENTS.md](AGENTS.md), [PLAN.md](PLAN.md), this file, and
   relevant local or official provider docs.
2. Classify every changed file as one of: runtime, Supabase schema,
   provider config, env/config, MCP/tooling, GTM, docs-only, ignored
   local artifact.
3. Run preflight checks and record blockers.
4. If Supabase runtime dependencies changed, apply production
   migrations first.
5. Verify Supabase production schema and migration history.
6. Run local verification again after migration.
7. Push the named candidate branch only after explicit push approval;
   inspect the Git-triggered Vercel preview.
8. Run preview smoke checks for the changed surfaces and record the
   result.
9. Merge the pull request to `main` only after explicit production
   approval. This GitHub merge is the production trigger.
10. Inspect the Git-triggered Vercel production deployment until it is
    ready or failed. Do not run a duplicate direct CLI deployment.
11. Run post-deploy smoke checks for the changed surfaces.
12. Run `npm run repo:sync` from the clean local `main` checkout and
    verify `main` equals `origin/main`.
13. Update [PLAN.md](PLAN.md) with the final deployment and migration
    status.

## Supabase Production Gate

Use this gate for any change touching `supabase/`, `src/types/supabase/`,
`src/lib/tracking/warehouse/`, server-side tracking writes, database
views, jobs, leases, dead letters, or audit rows.

Required sequence:

1. `SUPABASE_NO_TELEMETRY=1 npx supabase migration list --linked`
2. Read the local migration SQL that is expected to run.
3. Dump the relevant remote schemas to `/tmp` and grep for required
   objects.
4. If remote has migration-history drift, repair history only when the
   schema state proves the target migration is already applied or
   intentionally absent.
5. Prefer `SUPABASE_NO_TELEMETRY=1 npx supabase db push --linked
   --dry-run` before any actual push.
6. Run `SUPABASE_NO_TELEMETRY=1 npx supabase db push --linked` only
   after explicit production approval.
7. Run `SUPABASE_NO_TELEMETRY=1 npx supabase db lint --linked --schema
   marketing,ops,analytics`.
8. Dump or query production schema again to prove required objects
   exist.

Current tracking warehouse project:

- Canonical project: `hkoawfbomhnzupcsdggb` (`supabase-pink-lens`,
  eu-north-1)
- Legacy/atlas project: `ycqwilkchurgsldeimdi`; do not use for
  tracking warehouse deployment.

For the 2026-07-07 telemetry hardening, Vercel production must not be
deployed until production has:

- `ops.provider_dispatch_attempts.dispatch_mode`
- `ops.provider_dispatch_attempts.skip_reason`
- status check including `skipped_unqualified`
- `ops.provider_dispatch_health`
- `ops.dead_letter_summary`
- `marketing.campaign_insights`
- `ops.integration_job_leases`
- dead-letter resolution fields

## Vercel Production Gate

Use this gate for any Next.js runtime, route, action, tracking client,
server tracking, env, or build-affecting change.

### Cookiebot and sGTM env (Preview + Production)

Set these in Vercel before or with the Cookiebot deploy. Remove legacy
Usercentrics keys after verification.

| Key | Required | Canonical value | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_TRACKING_SGTM_ORIGIN` | Recommended | `https://cloud.server.utekos.no` | First-party sGTM origin for GTM loader and noscript. Hostname-only `cloud.server.utekos.no` is accepted and normalized to `https://` at runtime. No trailing slash. |
| `NEXT_PUBLIC_GOOGLE_GTM_ID` | Yes | `GTM-5TWMJQFP` | Web container loaded from sGTM origin. |
| `NEXT_PUBLIC_COOKIEBOT_DOMAIN_GROUP_ID` | Optional | `f2145160-1ac5-4859-8385-36dc6327495f` | Defaults in code when unset. |
| `GOOGLE_BROWSER_EVENT_TRANSPORT` | Prod | `sgtm` | Only after sGTM + GTM Preview + production smoke pass. |
| `NEXT_PUBLIC_ENABLE_GTM_IN_DEV` | Local only | `1` | For local `tracking:smoke`; do not set in Production. |

Remove after migration:

- `NEXT_PUBLIC_USERCENTRICS_SGTM_ORIGIN`
- `NEXT_PUBLIC_USERCENTRICS_SETTINGS_ID`
- `NEXT_PUBLIC_USERCENTRICS_*_SERVICE_NAME`

Redeploy Vercel after any env change. Verify with:

```bash
TRACKING_SMOKE_BASE_URL=https://utekos.no npm run tracking:smoke
```

Required sequence:

1. Confirm project link with `.vercel/project.json` or `.vercel/repo.json`.
2. Confirm the Vercel project is connected to
   `utekos-brand/utekos-headless` and tracks `main` as its production
   branch.
3. Confirm Vercel inspection auth with `vercel whoami` when the CLI is
   available, and confirm the intended scope/team from the linked
   project file.
4. Ensure required Supabase migrations and provider/env changes are done
   first.
5. Run `pnpm exec tsc --noEmit` and relevant tests.
6. Push the named candidate branch only after explicit approval and
   inspect its Git-triggered preview.
7. Merge the approved pull request to `main`; do not run a direct
   `vercel deploy --prod` for the same release.
8. Inspect the Git-triggered production deployment with
   `vercel inspect <deployment-url>` or the Vercel dashboard.
9. If failed, fetch build logs and stop. Do not retry blindly.
10. If ready, verify the production domain and relevant runtime surfaces.

### Klarna Express Checkout gate (Preview + Production)

Klarna Express Checkout is not verified by the presence of its SDK or
an empty container. The release must prove that Klarna renders the
actual button and accepts the configured origin.

Required before preview sign-off:

1. Verify that `NEXT_PUBLIC_KLARNA_CLIENT_ID` contains the intended
   Klarna Client Identifier in both Vercel Preview and Production. Do
   not print the value in logs or documentation.
2. Verify in Klarna that the exact preview origin and
   `https://utekos.no` are allowed for that Client Identifier.
3. Keep a single Klarna SDK library load per document. Multiple product
   cards may initialize separate containers through the shared loader.
4. Run the Vercel build. `prebuild` must fail closed when the Client
   Identifier is empty in a Vercel build.
5. In the Git-triggered preview, verify desktop and mobile DOM,
   screenshot, console and network. At least one eligible product must
   show a visible «Pay with Klarna» button; an SDK request or empty
   container alone is a failed gate.
6. Exercise provider authorization only with an approved test flow and
   confirm the expected completion/redirect response without creating
   an unintended live order.

Current status 2026-07-14: production fails the visible-button gate.
`/produkter` has no product-card integration, while the product-detail
container remains empty despite the SDK loading. The local candidate
passes responsive rendering with a controlled SDK stub, but provider
acceptance remains blocked until the environment and allowed origins
are verified in a real preview.

## Tracking And Paid-Media Post-Deploy

Run only the checks that match the changed surface, but never mark a
provider OK without provider-specific proof.

| Surface | Required proof |
| --- | --- |
| Consent | Cookiebot state, accept/deny/withdraw behavior, default-denied Consent Mode, and no optional provider identifiers before consent. |
| Google | dataLayer/sGTM evidence, GA4/Ads status as applicable, no native Ads double count. |
| Meta | Pixel browser evidence, CAPI/provider row, Dataset Quality read-only probe when credentials permit. |
| Microsoft UET | Browser network or queue evidence, UET CAPI purchase row/status for purchase flows. |
| Microsoft UET CAPI env | UET tag ApiToken env set in Vercel Production; not `MICROSOFT_ADS_ACCESS_TOKEN`. |
| Dead-letter replay | `/api/cron/replay-dead-letter` deployed (`401` without secret); optional approved replay run; `ops.dead_letter_summary` unresolved count trends down when replay succeeds. |
| Microsoft Ads | OAuth `msads.manage`, developer token, CustomerId, AccountId, account/campaign/Ad Insight read-only probes. |
| Microsoft Shopping | Merchant Center store/catalog/product read-only status. |
| Microsoft Clarity | Advertising Dashboard/UET linkage readiness and Consent API V2 `ad_Storage`/`analytics_Storage`. |
| PostHog | Consent-gated init, manual pageview/product events, no autocapture drift, masked replay only. |
| Supabase | `marketing.event_ledger`, `ops.provider_dispatch_attempts`, `ops.provider_dispatch_health`, `ops.dead_letter_summary`. |

## Microsoft Environment Gate (UET tag token vs Ads API OAuth)

Microsoft [Conversions API](https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13)
authorization is documented as **UET tagID + token**:

```http
POST https://capi.uet.microsoft.com/v1/{tagId}/events
Authorization: Bearer <ApiToken>
```

The **ApiToken** is the `UetTagAuthKey` returned by Campaign Management
[`GetUetTagAuthKey`](https://learn.microsoft.com/en-us/advertising/campaign-management-service/getuettagauthkey?view=bingads-13)
using OAuth + developer token. That is the same credential our runtime sends
as `Authorization: Bearer …` in `sendMicrosoftUetPurchase`. It is **not**
`MICROSOFT_ADS_ACCESS_TOKEN` (OAuth for Campaign Management / Ads API).

| Credential | Typical env keys | Used for |
| --- | --- | --- |
| **UET tag ApiToken** (Conversions API auth) | `MICROSOFT_UET_CAPI_ACCESS_TOKEN`, `MICROSOFT_UET_CAPI_TOKEN`, `UTEKOS_MICROSOFT_UET_CAPI_TOKEN`, `MICROSOFT_ADS_UET_CAPI_TOKEN` | `sendMicrosoftUetPurchase` → `capi.uet.microsoft.com` |
| **Microsoft Ads OAuth** | `MICROSOFT_ADS_ACCESS_TOKEN`, `MICROSOFT_ADS_REFRESH_TOKEN` | Ads API, MCP campaign probes |
| **Ads API developer token** | `MICROSOFT_ADS_DEVELOPER_TOKEN` | Ads API request header only |

Runtime resolution:
[`microsoftUetCapiTokenEnvKeys.ts`](src/lib/tracking/microsoft-uet/microsoftUetCapiTokenEnvKeys.ts).
`MICROSOFT_ADS_ACCESS_TOKEN` is intentionally **excluded** — OAuth
does not substitute for the UET tag ApiToken on the Conversions API
endpoint.

### Obtain UET tag ApiToken

**Runtime (production):** when OAuth env is complete, `sendMicrosoftUetPurchase`
refreshes OAuth and calls `GetUetTagAuthKey` on each dispatch window (short
in-memory cache; forced refresh on 401/403). Rotated `refresh_token` values are
kept in-process for the serverless instance lifetime.

**Bootstrap / local:** after OAuth app registration and token exchange:

```bash
npm run microsoft-ads:fetch-uet-auth-key
```

Writes `MICROSOFT_UET_CAPI_ACCESS_TOKEN` to `.env.local` / `.env.mcp.local` as
fallback when OAuth refresh fails.

**Alternative:** Microsoft Advertising UI → UET tag → **Use Conversions API** →
copy token into the same env key.

Optional cache TTL override: `MICROSOFT_UET_CAPI_TOKEN_CACHE_TTL_SECONDS`
(default 600).

### Vercel Production requirement

Before marking Microsoft UET purchase OK:

1. Set **one** UET tag ApiToken env key in Vercel Production (prefer
   `MICROSOFT_UET_CAPI_ACCESS_TOKEN` or `MICROSOFT_UET_CAPI_TOKEN`).
2. Redeploy production.
3. Verify purchase audit is not `skip_reason=missing_capi_token`:

```bash
npm run ops:provider-dispatch-report
```

Prod evidence on 2026-07-07: order `shopify_order_6946151268600` was
`skipped_unqualified` / `missing_capi_token` while OAuth Ads tokens
were present in local env — confirms `MICROSOFT_ADS_ACCESS_TOKEN` is
not the UET tag ApiToken Microsoft documents for Conversions API auth.

## Dead-Letter Replay Release Gate

Applies when deploying
[`replay-dead-letter`](src/app/api/cron/replay-dead-letter/route.ts) and
Microsoft UET `server_retry` enqueue/dispatch.

Preflight:

```bash
node --import tsx --test src/lib/tracking/warehouse/replayDeadLetterSchedule.test.ts
node --import tsx --test src/lib/tracking/warehouse/replayDeadLetterEvents.test.ts
node --import tsx --test src/lib/tracking/google/buildGA4BrowserEventParams.test.ts
node --import tsx --test src/lib/tracking/microsoft-uet/microsoftUetCapiTokenEnvKeys.test.ts
node --import tsx --test src/lib/tracking/microsoft-uet/shouldEnqueueMicrosoftUetRetry.test.ts
pnpm exec tsc --noEmit
```

`/api/cron/replay-dead-letter` is manual-only. It must not be listed in
`vercel.json` under `crons`; the route remains available for a separately
approved one-time invocation. Never leave `DEAD_LETTER_REPLAY_ENABLED=1`
as the normal production state.

Post-deploy (no secret):

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://utekos.no/api/cron/replay-dead-letter
# Expect 401 when route exists; 404 means not deployed.
npm run ops:provider-dispatch-report
```

After removing an accidental recurring schedule, inspect at least one full
previous schedule interval in Vercel logs and confirm that no new scheduled
`403` calls appear.

First production replay run requires **explicit user approval** (provider
dispatch). Do not blindly replay Google dead letters with reason
`Missing client_id` — they need attribution repair, not replay.

## No-Go Conditions

Stop the release when any of these are true:

- Production runtime expects a database object that production does not
  have.
- Migration history is unclear and the schema state has not been
  inspected.
- A provider write would be required but has not been explicitly
  approved.
- GTM publish would be required but has not been explicitly approved.
- Vercel build fails or `vercel inspect` does not reach a ready state.
- Tracking verification would send live events and no explicit approval
  or test event id exists.
- Microsoft UET CAPI purchase is expected in production but no UET tag
  ApiToken env key is set in Vercel Production.
- `/api/cron/replay-dead-letter` returns `404` when the release
  includes dead-letter replay and the route should be live.
- Secret-like values appear in generated MCP files, tracked files, or
  examples.

## Current Approved Release

Approved by user in this thread on 2026-07-07:

- Supabase production mutation for telemetry hardening.
- Vercel production deploy after Supabase production is verified.

Execution status for this release:

- Supabase production migration history was repaired after schema proof.
- Supabase production migrations
  `20260612120000_add_integration_job_leases.sql` and
  `20260707111433_harden_provider_dispatch_audit_statuses.sql` were
  applied.
- Supabase production verification passed: migration list matches
  local, required telemetry objects exist, required provider dispatch
  constraints exist, and `db lint` for `marketing,ops,analytics`
  returns no schema errors.
- Vercel production deploy is approved for this release and must be
  inspected until `READY` before the release is considered complete.

Still not approved by default:

- Provider writes.
- GTM publish.
- Campaign, budget, audience, creative, Shopping catalog, Shopify
  catalog, or Microsoft Ads Scripts mutations.
