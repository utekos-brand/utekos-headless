# CE-1.5 — Pre-release cron and queue baseline

```text

Charter-version: 1.0.0

Roadmap: CE-1.5

Affected invariants: INV-007, INV-008, INV-018, INV-019, INV-020

Goal: prove the existing cron can safely own dispatch without request-triggered help

Non-goals: send events, change schedule/env/schema, claim rows manually, push/deploy, start CE-1.6

Primary role: canonical-event-release-auditor

Supporting access: read-only Vercel CLI/MCP; read-only pink-lens SQL aggregates

Start SHA (worktree HEAD): 5f8630aa395fe3df8c994af35b160454daf376d7

Audit timezone: Europe/Oslo (CEST, UTC+2)

Conclusion: GO_WITH_NONBLOCKING_OBSERVATIONS

```

## Governance snapshot

| Field | Value |

## | ------------------- |

|

| Preconditions | CE-1.4G owner ACCEPTED; frozen HEAD gates green
at CE-1.4G |

| Allowed write |
`docs/analytics/evidence/ce-1.5-pre-release-queue-baseline.md`
only |

| Worktree | `.worktrees/ce-1.5-queue-baseline` |

| Mutations performed | none (no
push/deploy/schema/env/schedule/runtime edits) |

| Secrets printed | none (`CRON_SECRET` presence only; no
PII/provider payloads selected) |

---

## 1. Git / candidate snapshot

**Captured:** 2026-07-21T08:17:24+02:00

**Source/tool:** `git` in `.worktrees/ce-1.5-queue-baseline`

| Check | Result |

| ------------------------------------- |
| ------------------------------------- |

| `git status --short --branch` | `## ce-1.5-queue-baseline`
(clean) |

| `git rev-parse HEAD` |
`5f8630aa395fe3df8c994af35b160454daf376d7` |

| Expected Start SHA | MATCH |

| `git rev-parse origin/main` |
`ee781aed52474eb6bdecee63e43ffabec9d0cea2` |

| **Rollback SHA (audit time)** |
`ee781aed52474eb6bdecee63e43ffabec9d0cea2` |

| `git log --oneline origin/main..HEAD` | 17 commits (CE-1.2 →
CE-1.4G isolation series) |

| `git diff --stat origin/main..HEAD` | 62 files, +1782 / −630 |

Candidate for CE-1.6 push/deploy is local HEAD `5f8630aa…` (not

yet on `origin/main`, not production-deployed). Production

currently tracks rollback SHA `ee781aed…`.

---

## 2. Static cron verification

**Captured:** 2026-07-21T08:17:40+02:00

**Source/tool:** worktree file read at Start SHA

### 2.1 `vercel.json`

- Cron path `/api/cron/provider-outbox-dispatch` schedule

  **`*/5 * * * *`** (exactly every five minutes).

- Project regions include **`arn1`**.

- No cache-layer rewrite for the cron path (only `/__sgtm` has

  forced `no-store` headers).

### 2.2 `src/app/api/cron/provider-outbox-dispatch/route.ts`

| Property | Evidence |

## | ----------------- |

|

| HTTP method | `GET` only (`export function GET`) |

| Auth | Fail-closed via `hasValidCronAuthorization`;
missing/invalid → **401** + `{ ok: false }` |

| Secret handling | Reads `process.env.CRON_SECRET`; never logged
in route |

| Cache headers | Explicit `Cache-Control: no-store` on 401 and
200 |

| Batch size | `CRON_BATCH_SIZE = 1` passed to
`runBatch({ maxItems: 1 })` |

| Worker invocation | Default `runBatch` =
`runRegisteredProviderOutboxBatch` |

| `maxDuration` | **60** (route export) |

| Redirects | None in route handler |

### 2.3 `hasValidCronAuthorization`

- Requires both `Authorization` header and configured secret.

- Constant-time compare of `Bearer ${cronSecret}`.

- Empty secret → unauthorized (`false`).

### 2.4 `runRegisteredProviderOutboxBatch` + registry

- Iterates **all** entries in `providerOutboxWorkerRegistry` with

  `Promise.all` (parallel per registered adapter key).

- Live source count at Start SHA: **33** workers (24 `google:*`,

  8 `meta:*`, 1 `microsoft_uet:purchase`).

- Claim reclaim threshold (implemented in

  `postgresProviderOutboxStore.ts` `CLAIM_NEXT_QUERY`):

  `status = 'processing'` and

  `coalesce(last_attempt_started_at, updated_at) <= now() - interval '10 minutes'`.

- Claim uses `FOR UPDATE SKIP LOCKED` (overlap-safe).

**Static verdict:** schedule, fail-closed auth, no-store

responses, registered worker drain, and reclaim semantics match

the intended cron-only owner model. No Hobby/plan-limit

assumption made from static files alone.

---

## 3. Live Vercel baseline

### 3.1 Production deployment

| Field | Value | Timestamp / source |

| ------------------                                  |
| --------------------------------------------------- |
| --------------------------------------------------- |

| Project | `utekos-headless` /
`prj_MpZN3Z0PDp8rfwpdzAeplGe4Di0s` | 2026-07-21T08:18:19+02:00 —
plugin-vercel MCP + CLI |

| Team | `utekos-marketing-group` /
`team_0B8gWWIxT2hGVIJnK8CwanAi` | same |

| Production ID | `dpl_54ubTSu67h4cTxzarCNonWvQ2epH` | same |

| Production Git SHA | `ee781aed52474eb6bdecee63e43ffabec9d0cea2`
| MCP `list_deployments` / `get_deployment` |

| Ready state | `READY`, target `production` | same |

| Created (local) | 2026-07-21T00:09:47+02:00 |
`vercel inspect utekos.no` |

| Deploy regions | `arn1` | MCP `get_deployment` |

| Aliases | `utekos.no`, `www.utekos.no`, `feed.utekos.no`,
project aliases | `vercel inspect` |

### 3.2 Cron enabled state and schedule

**Captured:** 2026-07-21T08:18:19+02:00 /

2026-07-21T08:19:11+02:00

**Source/tool:** `vercel crons ls`; Vercel REST

`GET /v9/projects/...`

| Field | Value |

## | -------------------------- |

|

| Cron feature | Enabled (`disabledAt: null`) |

| `enabledAt` (UTC) | 2025-07-23T20:21:29.267Z |

| Bound deployment | `dpl_54ubTSu67h4cTxzarCNonWvQ2epH` |

| Live schedule (outbox) | `/api/cron/provider-outbox-dispatch` →
`*/5 * * * *` |

| Matches `vercel.json` | YES |

| Other crons (context only) | `google-data-manager-status`
`*/5`; meta quality `17 3` / `17 4` UTC |

| Team plan (live) | `billing.plan = pro`, `planIteration = plus`
(not Hobby) |

### 3.3 `CRON_SECRET` presence (no value)

**Captured:** 2026-07-21T08:18:19+02:00

**Source/tool:** `vercel env ls production|preview|development`

| Variable | Present | Environments |

| ------------- | ------- | -------------------------------- |

| `CRON_SECRET` | **yes** | Development, Preview, Production |

Tracking DB URL keys `SUPABASE_VERCEL_POSTGRES_URL` /

`SUPABASE_VERCEL_POSTGRES_URL_NON_POOLING` also present on

Production, Preview, Development (values not printed).

### 3.4 Invocations, status, cache, overlap

**Window A (MCP runtime logs, deploy-scoped ~2h):**

2026-07-21T04:19:16Z → 2026-07-21T06:19:16Z

**Source/tool:** plugin-vercel `get_runtime_logs`

- Successful cron GETs every ~5 minutes at `*:xx:31` UTC on

  deployment host, status **200**, `cache=BYPASS`.

- Sample: 06:15:31, 06:10:31, …, 04:20:31 UTC — single start per

  slot.

- **No overlapping concurrent cron starts observed** in this

  window (INV-019).

**Window B (status aggregation, deploy-scoped 24h):**

**Captured:** 2026-07-21T08:19:54+02:00

**Source/tool:** plugin-vercel `get_runtime_logs`

`group_by=statusCode` query `/api/cron/provider-outbox-dispatch`

| statusCode | count |

| ---------- | ----- |

| 200 | 97 |

| 401 | 2 |

- **Last successful cron pattern:** continuous 200s on schedule

  through at least 06:15:31Z (MCP) and 08:15:31+02:00

  (`vercel logs`).

- **Failed cron invocations:** none attributed to Vercel cron

  auth in sampled windows. The **2× 401** on `utekos.no` at

  2026-07-21T08:19:34+02:00 are the auditor’s unauthorized probe

  (`curl` without `Authorization`) — expected fail-closed

  behavior.

- Error/warning level filter for the path over 24h: **no logs**.

**Unauthorized header probe (read-only):**

2026-07-21T08:19:33+02:00 —

`curl -X GET https://utekos.no/api/cron/provider-outbox-dispatch`

| Header / property | Observed |

| ----------------- | ------------------------------------------
|

| HTTP status | 401 |

| Body | `{"ok":false}` |

| `cache-control` | `no-store` |

| `x-vercel-cache` | `MISS` |

| `x-matched-path` | `/api/cron/provider-outbox-dispatch` |

| `x-vercel-id` | `arn1::arn1::…` |

| Redirects | `redirect_count=0` (`curl --max-redirs 0`) |

### 3.5 Function max duration and region

| Field | Value | Source |

## | ---------------------------------- |

| ---------------------------------- |

| Route `maxDuration` | **60s** | static route export |

| Deploy `config.functionTimeout` | 300s (project fluid default
ceiling) | Vercel REST deployment detail |

| Effective cron budget | **60s** (route export governs App
Router function) | Next.js route config + static read |

| Live execution region (probe) | **arn1** | `x-vercel-id`,
deploy `regions` |

| `vercel.json` regions | `arn1` | static |

| Project `serverlessFunctionRegion` | reported `iad1` with
`functionDefaultRegions` incl. `iad1`,`arn1` | REST project (note
vs live arn1) |

### 3.6 Runtime duration distribution (invocation wall-clock)

**Blocked surface:** Vercel MCP runtime log summaries and

`vercel logs --json` entries for this path do **not** expose

per-invocation wall-clock duration / p50/p95 for the cron

function in the tools available at audit time.

**Proxy metric (DB attempt latency, not cron wall-clock):**

2026-07-21T08:19:40+02:00 — pink-lens aggregates

| Window | n | p50 `latency_ms` | p95 | max |

| ----------------------- | ---- | ---------------- | ---- | ----
|

| `processed_at` last 24h | 1566 | 1885 | 3050 | 6260 |

Interpretation: individual provider attempts complete in a few

seconds; theoretical worst-case sequential cost is not applicable

because workers run in parallel (`Promise.all`). Wall-clock cron

duration remains **unobserved** → non-blocking observation (not

`NO_GO_UNKNOWN` alone, because auth/queue/capacity are otherwise

live-proven).

---

## 4. Live Supabase baseline (pink-lens)

### 4.1 Access path

| Item | Value |

## | ------------------- |

|

| Intended project | `hkoawfbomhnzupcsdggb` /
`supabase-pink-lens` / `eu-north-1` |

| plugin-supabase MCP | **blocked for pink-lens** —
`list_projects` only returned Atlas `ycqwilkchurgsldeimdi` |

| user-supabase MCP | **not available** in this session |

| Actual read path | Local `.env.local`
`SUPABASE_VERCEL_POSTGRES_URL_NON_POOLING` via `postgres` npm
client (read-only SELECT aggregates) |

| Host shape | pooler `aws-1-eu-north-1.pooler.supabase.com`;
user contains `postgres.hkoawfbomhnzupcsdggb` |

| Mutations | none |

| Payload/PII selects | none (`payload` / `response` / identity
fields never projected) |

**DB clock:** 2026-07-21T06:19:34.283Z (`UTC`) — source: SQL

`now()` / `current_setting('TIMEZONE')`

**Local capture:** 2026-07-21T08:19:36+02:00

### 4.2 Schema inspection first

`ops.provider_dispatch_attempts` columns (abbrev.):

`id`, `idempotency_key`, `provider`, `event_id`, `event_name`,

`status`, `attempt_count`, `next_attempt_at`, `last_error`,

`response`, `created_at`, `updated_at`, `processed_at`,

`payload`, `consent_basis`, `data_quality`,

`last_attempt_started_at`, `latency_ms`, `dispatch_mode`,

`skip_reason`, `payload_summary`, `request_id`, `http_status`,

`validation_result`, `response_semantics`.

Key constraints/indexes:

- PK `id`

- UNIQUE `(provider, idempotency_key)`

- CHECK constraints on `status`, `dispatch_mode`,

  `attempt_count`, `http_status`, `latency_ms`

- Queue index on `(status, next_attempt_at, created_at)` for

  `pending` / `retry_scheduled`

`ops.dead_letter_events` includes `resolved_at`,

`resolution_code`, `resolution_note`, `resolved_by` (unresolved =

`resolved_at IS NULL`).

### 4.3 Aggregates (no raw rows / payloads)

#### Status totals

| status | n |

| -------------------------------------------- | ----- |

| succeeded | 18447 |

| accepted_unverified | 3041 |

| skipped_unqualified | 927 |

| pending / retry / processing / dead_lettered | **0** |

#### Provider × status

| provider | accepted_unverified | skipped_unqualified |
succeeded |

| ------------- | ------------------- | ------------------- |
| ------------- | ------------------- | ------------------- |

| google | 1007 | 494 | 5156 |

| meta | 2033 | 210 | 13291 |

| microsoft_uet | 1 | 223 | 0 |

Full provider × event_name × status matrix was queried live (many

legacy PascalCase names coexist with snake_case). Counts only; no

payloads retained in this evidence file.

#### Due / reclaim / windows (`dispatch_mode = 'server_retry'` where noted)

| Metric | Value |

## |

| --------------------- |

| Due `pending`/`retry_scheduled` (`next_attempt_at` null or ≤
now) | **0** |

| `pending_total` / `retry_scheduled_total` / future scheduled |
0 / 0 / 0 |

| Oldest due age | **n/a** (no due rows) |

| `processing` now | **0** |

| Stale processing (>10 minutes reclaim threshold) | **0** |

| Created last 5m / 15m / 1h | 0 / 0 / 0 |

| Completed (`processed_at`) last 5m / 15m / 1h | 0 / 0 / 2 |

| `retry_scheduled` / `dead_lettered` attempts | 0 / 0 |

#### Dead letters

| Metric | Value |

| ------------------------------- | ----- |

| `ops.dead_letter_events` rows | 1127 |

| unresolved (`resolved_at` null) | **0** |

| resolved | 1127 |

Sources (counts only): `google` 637, `tracking:google` 418,

`tracking:meta` 72.

#### Google provider-confirmed status backlog

| Metric | Value |

| -------------------------------- | ------------------ |

| `google` + `accepted_unverified` | **1007** |

| Oldest age (from `updated_at`) | ~595825 s (~6.9 d) |

| Newest age | ~258 s |

This is a **status-reconciliation** backlog (companion cron

`/api/cron/google-data-manager-status`), **not** a due dispatch

backlog. Dispatch due count remains 0.

#### Idempotency

| Metric | Value |

## |

| ------- |

| Duplicate `(provider, event_name, idempotency_key)` groups with
count > 1 | **0** |

| UNIQUE `(provider, idempotency_key)` | present |

---

## 5. Capacity assessment

Assumptions from live+static sources (33 workers unless proven

otherwise — **proven 33**):

| Input | Value |

| --------------------------------- |
| --------------------------------- |

| Workers per cron invocation | **33** (registry parallel
`Promise.all`) |

| Per-worker batch size | **1** (`CRON_BATCH_SIZE`) |

| Max claims / 5-minute window | ≤ **33** |

| Max claims / hour (upper bound) | ≤ **396** if every worker
always finds work |

| Observed attempts created / 5m | **0** |

| Observed due rows | **0** |

| Observed oldest due age | **n/a** |

| Observed cron wall-clock duration | **unavailable** (blocked
metric) |

| Route time budget | 60s |

| Attempt latency proxy (24h) | p95 ≈ 3.05s; max 6.26s |

**Estimated drain capacity:** with due=0, current production can

idle-drain safely. Upper bound 33 claims/5m leaves large headroom

versus observed create rate 0/5m and 0/1h.

**Safety margin:** **ample** for current production load.

Residual risk is post-CE-1.6 traffic shape after request-path

dispatch removal (acceptance continues; only ownership of drain

changes). That risk is why CE-1.6 still requires a controlled

production event — not a CE-1.5 capacity NO-GO.

Plan support: live Pro/Plus team with crons enabled and executing

every five minutes — **no invented Hobby cron limit**.

---

## 6. Exact blockers and observations

### Blocking for CE-1.5 conclusion?

None of the following force `NO_GO_AUTH`, `NO_GO_QUEUE_HEALTH`,

or `NO_GO_CAPACITY`.

### Non-blocking observations

1. **Cron wall-clock duration distribution unavailable** from

   Vercel MCP / `vercel logs --json` at audit time (only DB

   `latency_ms` proxy).

2. **plugin-supabase MCP cannot see pink-lens**; aggregates used

   direct SQL via local env URL with project-ref user check.

3. **Google `accepted_unverified` = 1007** needs ongoing status

   cron attention; separate from outbox due health.

4. Production still runs **`ee781aed…`**, not candidate

   `5f8630aa…` (expected pre-release).

5. Project `serverlessFunctionRegion` metadata mentions `iad1`

   while live cron/probe evidence is **arn1** (aligned with

   `vercel.json`).

6. Auditor unauthorized GETs produced the only observed 401s in

   the 24h status rollup.

### Exact blocked verification

| Surface | Status |

| --------------------------------------------- |
| --------------------------------------------- |

| Vercel cron invocation wall-clock histograms | **blocked**
(tooling/field absent) |

| plugin-supabase / user-supabase pink-lens MCP | **blocked**
(Atlas-only / missing server) |

| Print `CRON_SECRET` | **intentionally not done** |

---

## 7. Release advice (not execution authorization)

| Question | Answer |

## | -------------------------------------------------- |

|

| Required conclusion enum |
**`GO_WITH_NONBLOCKING_OBSERVATIONS`** |

| Controlled production event required after deploy? | **YES**
(CE-1.6 gate; one known `event_id`) |

| Recommended observation window | **≥ 60 minutes / ≥ 12 cron
cycles** post-deploy; watch due age, processing/stale, 200 vs
non-200 cron status, Google `accepted_unverified` trend |

| Rollback SHA | `ee781aed52474eb6bdecee63e43ffabec9d0cea2` |

| Push/deploy authorized by this task? | **NO** |

| Start CE-1.6 automatically? | **NO** — requires separate owner
instruction |

### Why not `GO_FOR_CE_1_6A`

Cron auth, schedule, queue due health, reclaim emptiness,

idempotency, and capacity headroom are live-green, but invocation

wall-clock duration remains unobserved and Google status backlog

is non-zero. Per task rules, that is recorded as

**`GO_WITH_NONBLOCKING_OBSERVATIONS`** rather than inventing

duration numbers or ignoring the blocked metric.

### Why not `NO_GO_*`

- Auth: secret present on Production/Preview/Development;

  unauthorized → 401 no-store; scheduled invocations return 200.

- Queue health: due=0, processing=0, stale=0, unresolved dead

  letters=0, no idempotency duplicate groups.

- Capacity: observed load ≪ 33 claims/5m upper bound.

- Unknown: insufficient alone — core live surfaces were obtained.

---

## 8. Verification performed

- Git snapshot + clean worktree at Start SHA

- Static read of cron route, registry, claim SQL, `vercel.json`,

  auth helper

- Vercel MCP: project, deployments, deployment detail, runtime

  logs

- Vercel CLI: `crons ls`, `env ls`, `inspect`, `logs --json`,

  team billing plan

- Unauthorized production GET header probe (no secret)

- Pink-lens read-only SQL: columns/constraints/indexes then

  aggregates only

## 9. Dokumentasjonsstatus

Enough charter/roadmap/handoff/task context and live evidence

were available to complete CE-1.5. Remaining gaps are explicitly

listed under blocked verification and do not authorize CE-1.6

push/deploy by themselves.
