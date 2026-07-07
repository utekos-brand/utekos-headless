# Deployment And Migration Checklist

Status date: 2026-07-07

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
| PostHog client/runtime tracking | Ensure Usercentrics service name and env vars are present. | Vercel. | Consent-gated init, no autocapture drift, masked replay, safe events only. |
| Google/Meta/Microsoft provider diagnostics | Configure local/provider credentials outside generated files. | Usually no Vercel deploy unless runtime changed. | Read-only probes and provider dashboard/API status. |
| MCP server/template changes | Update committed templates, then regenerate generated files locally. | No app deploy unless app runtime changed. | `mcp:build`, `mcp:doctor`, relevant MCP doctor. |
| GTM or sGTM behavior | Verify current docs, container IDs, workspace state, and consent model. | GTM publish only with explicit approval; Vercel if app loader changed. | GTM Preview, sGTM endpoints, production tracking smoke. |
| Vercel env vars | Pull/inspect env state and document changed keys. | Redeploy Vercel after env change. | Deployment inspect, runtime logs, route smoke. |
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
| Consent | Usercentrics state, accept/deny/withdraw behavior, no optional providers before consent. |
| Google | dataLayer/sGTM evidence, GA4/Ads status as applicable, no native Ads double count. |
| Meta | Pixel browser evidence, CAPI/provider row, Dataset Quality read-only probe when credentials permit. |
| Microsoft UET | Browser network or queue evidence, UET CAPI purchase row/status for purchase flows. |
| Microsoft Ads | OAuth `msads.manage`, developer token, CustomerId, AccountId, account/campaign/Ad Insight read-only probes. |
| Microsoft Shopping | Merchant Center store/catalog/product read-only status. |
| Microsoft Clarity | Advertising Dashboard/UET linkage readiness and Consent API V2 `ad_Storage`/`analytics_Storage`. |
| PostHog | Consent-gated init, manual pageview/product events, no autocapture drift, masked replay only. |
| Supabase | `marketing.event_ledger`, `ops.provider_dispatch_attempts`, `ops.provider_dispatch_health`, `ops.dead_letter_summary`. |

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
