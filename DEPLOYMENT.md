# Deployment And Migration Checklist

Status date: 2026-07-12

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

## Required Preflight

Run these before deciding the release order:

| Check | Command or source | Required conclusion |
| --- | --- | --- |
| Worktree scope | `git status --short` | Identify relevant files and ignore unrelated dirty files. |
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
| Shopify/Klarna/Sanity runtime | Confirm provider docs and required env. | Vercel. | Route/action smoke and provider response proof. |
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
7. Deploy to Vercel production.
8. Inspect the Vercel deployment until it is ready or failed.
9. Run post-deploy smoke checks for the changed surfaces.
10. Update [PLAN.md](PLAN.md) with the final deployment and migration
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
2. Confirm Vercel auth with `vercel whoami`.
3. Confirm the intended scope/team from the linked project file.
4. Ensure required Supabase migrations and provider/env changes are done
   first.
5. Run `pnpm exec tsc --noEmit` and relevant tests.
6. Deploy with `vercel deploy --prod -y --archive=tgz` or the approved
   project workflow.
7. Inspect with `vercel inspect <deployment-url>`.
8. If failed, fetch build logs and stop. Do not retry blindly.
9. If ready, verify the production domain and relevant runtime surfaces.

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

## sGTM Remediation Release Gate

This gate applies to the two-stage remediation described in
[`PLAN.md`](PLAN.md) and
[`src/lib/tracking/server-side-tagging.md`](src/lib/tracking/server-side-tagging.md).
Approval from an earlier telemetry release does not authorize these provider,
database, deployment, GTM, Shopify, or Cloud Run mutations.

### Current preflight status 2026-07-14

- The full local integration with the storefront/platform releases passed
  frozen install, 111 changed tests, changed-code ESLint, TypeScript, MCP build
  and doctors, and a Vercel-like production build with 99/99 static pages.
- Supabase linked history and lint are green. The dry-run contains exactly
  `20260712120000_add_tagging_observations_and_verified_dispatch_status.sql`;
  it has not been applied.
- The provider-dispatch report is green with 0 active failures, 0 unresolved
  dead letters and 0 alerts. Seven public sGTM/GTM loader endpoints are green.
- The hardening verifier remains deliberately red: the receipt secret and
  protected Vercel receipt env are absent, Cloud Run is still `0/5` instead of
  `3/10`, the dedicated service identity/mount is absent, and required uptime,
  logging metrics, alert policies and budget configuration are missing or
  drifted.
- Browser smoke with local GTM enabled proves duplicate Cookiebot loading while
  the live GTM configuration still contains web tag `126`. The app owns the
  single CMP loader; the coordinated GTM release must delete tag `126` before
  consent sign-off.
- A fresh Quick Preview capture is still required immediately before publish.
  The latest refresh attempt was blocked by DNS resolution for
  `tagmanager.googleapis.com`; no GTM resource was changed.

No Supabase migration, Vercel env change, Cloud Run change, GTM publish,
provider write or production deploy was performed by this preflight.

### Local preflight

```bash
node --import tsx --test src/lib/tracking/**/*.test.ts
pnpm exec tsc --noEmit
npm run build
npm run mcp:build
npm run mcp:doctor
npm run mcp:commerce-tracking:doctor
npm run tracking:sgtm-loaders:verify
npm run --silent tracking:gtm-quick-preview:capture > /tmp/utekos-gtm-quick-preview.json
GTM_PUBLISH_CONFIRM=I_APPROVE_GTM_PUBLISH GTM_QUICK_PREVIEW_EVIDENCE=/tmp/utekos-gtm-quick-preview.json npm run tracking:gtm-publish-guard
npm run tracking:sgtm-hardening:plan
npm run tracking:sgtm-hardening:verify
SUPABASE_NO_TELEMETRY=1 npx supabase migration list --linked
SUPABASE_NO_TELEMETRY=1 npx supabase db push --linked --dry-run
SUPABASE_NO_TELEMETRY=1 npx supabase db lint --linked --schema marketing,ops
```

The publish guard must fail closed until both `GTM_PUBLISH_CONFIRM` and fresh
Quick Preview evidence are supplied. The hardening verifier must remain a
read-only failure report until Cloud Run and Monitoring changes are explicitly
approved.

The Quick Preview file must be produced by the capture command. The guard
repeats the official `workspaces.quick_preview` call and compares compiler and
sync status, exact workspace changes, live fingerprints, resource digests,
workspace fingerprints and client `6`. It also requires a clean git worktree;
store evidence outside the repository.

### Receipt key contract

- Generate at least 32 random bytes and store their standard base64 encoding as
  `keys.receipt-key` in the Secret Manager-backed JSON file mounted into the
  tagging service.
- Set `SGTM_CREDENTIALS` on the tagging service to the mounted file path.
- Store that exact base64 value as the protected Vercel Preview/Production
  secret `SGTM_RECEIPT_HMAC_KEY_BASE64`.
- Never commit either the raw key, base64 value, credentials file, or generated
  signature.
- Rotate both surfaces together; smoke the receipt route before retiring the
  previous key.

The apply tool is dry-run by default. Its mutating phases are deliberately
separate and each requires the exact confirmation printed by
`tracking:sgtm-hardening:plan`: `receipt-secret-preview` may create the Secret
Manager resource or add its first version and then configures Preview;
`vercel-production` reuses that version; `cloud-secret` only mounts the existing
enabled secret through the runtime identity; Budget API enablement and
operational capacity/monitoring remain separate. An existing enabled version is
always reused. An existing secret with zero versions can receive its first
version only under the `receipt-secret-preview` confirmation. Access, parsing,
disabled-version or ambiguous-not-found errors fail closed and never authorize
automatic replacement or rotation. Same-name monitoring drift fails closed and
must be reconciled explicitly.

Vercel does not expose a protected environment value through its list API, so
the read-only hardening verifier can prove presence/type/target but cannot prove
cross-surface key equality. Equality between the mounted Secret Manager key and
Vercel is proven by the signed Preview receipt smoke before GTM publication;
signature failure blocks the release.

### Release 1: privacy containment

Requires one explicit approval that names all of these actions:

1. Disable Google user-provided-data capabilities and automatic DOM detection.
2. Disable GA4 user-provided-data collection and enable email redaction.
3. Create the server-container global PII exclude transformation, constrain the
   purchase trigger to the intended MP client, and preserve client `6`.
4. Remove browser `purchase` from the web-container commerce trigger.
5. Run Quick Preview and publish both containers.

Rollback may target only the latest privacy-safe version. It must never restore
UPD collection or browser purchase ownership.

### Release 2: runtime, warehouse, GTM, and operations

Run in this order, with a separate explicit approval at every numbered mutation
gate:

1. Apply `20260712120000_add_tagging_observations_and_verified_dispatch_status.sql`
   to the canonical Supabase project, then lint and dump the schemas again.
2. Run the separately approved `receipt-secret-preview` hardening phase with
   `SGTM_HARDENING_APPLY=I_APPROVE_RECEIPT_SECRET_AND_VERCEL_PREVIEW`. It
   creates the Secret Manager resource or its first version only when absent,
   otherwise reuses the enabled latest key, and sets
   `SGTM_RECEIPT_HMAC_KEY_BASE64` in Vercel Preview only. Deploy and test Preview
   without unapproved events.
3. Run the separately approved `vercel-production` phase to reuse that exact
   key in Production only, then deploy Vercel Production and wait for `READY`.
4. Run the separately approved `cloud-secret` phase. It must find an existing,
   enabled, valid secret version; it creates only the dedicated Cloud Run
   service identity/IAM binding, mounts the key file at the exact configured
   path using version `latest`, and sets `SGTM_CREDENTIALS`. Prove the receipt
   endpoint from Preview before a monitoring tag can be published.
5. Quick Preview and publish the web container first, then the server container,
   only after runtime compatibility and the secret mount are proven.
6. Set Cloud Run service-level min/max instances to `3/10`, preserve concurrency
   `80`, and create the approved uptime, exact alert policies and 80/100 budget.
7. Create the Shopify `refunds/create` subscription or App Pixel only after the
   corresponding Shopify mutation is explicitly approved.
8. Run production smoke; a real order, refund, or live tracking event needs its
   own concrete approval and test identifier.

The live event smokes are intentionally not part of a default deploy command:

```bash
TRACKING_SMOKE_BASE_URL=https://utekos.no npm run tracking:smoke
TRACKING_SMOKE_BASE_URL=https://utekos.no npm run tracking:commerce-smoke
```

### CSP enforcement gate

Keep `Content-Security-Policy-Report-Only` for at least the 24-hour observation
window. The policy has a same-origin, size-limited report endpoint that logs
only directive and host names. Do not enforce until normal navigation,
checkout, Cookiebot, Meta, Microsoft, Clarity, PostHog and sGTM show no
unexplained critical violations. Enforcement is a separate production change;
it must not add a nonce design that forces the entire storefront to dynamic
rendering.

Final sign-off requires the 24-hour observation window and matching control
event evidence in GA4, Supabase, Cloud Run and GTM. GA4 BigQuery is a separate
blocking sign-off item while `analytics_489598217` is absent; GA4-only evidence
is explicitly interim and must not be represented as BigQuery proof.

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
