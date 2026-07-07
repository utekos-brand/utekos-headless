create table if not exists ops.integration_events (
  id uuid primary key default gen_random_uuid(),

  provider text not null,
  event_type text not null,

  status text not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  error_message text,

  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists integration_events_status_idx
  on ops.integration_events (status, created_at);

create index if not exists integration_events_provider_idx
  on ops.integration_events (provider, created_at desc);

create table if not exists ops.provider_dispatch_attempts (
  id uuid primary key default gen_random_uuid(),

  idempotency_key text not null,
  provider text not null,
  event_id text,
  event_name text,
  payload jsonb not null default '{}'::jsonb,

  status text not null default 'pending'
    check (status in ('pending', 'processing', 'succeeded', 'retry_scheduled', 'failed', 'dead_lettered', 'skipped_unqualified')),
  attempt_count integer not null default 0
    check (attempt_count >= 0),
  next_attempt_at timestamptz,
  last_error text,
  response jsonb not null default '{}'::jsonb,
  consent_basis jsonb not null default '{}'::jsonb,
  data_quality jsonb not null default '{}'::jsonb,
  dispatch_mode text not null default 'server_retry'
    check (dispatch_mode in ('server_retry', 'server_direct', 'client_observed')),
  skip_reason text,
  last_attempt_started_at timestamptz,
  latency_ms integer
    check (latency_ms is null or latency_ms >= 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  processed_at timestamptz,

  unique (provider, idempotency_key)
);

create index if not exists provider_dispatch_attempts_queue_idx
  on ops.provider_dispatch_attempts (status, next_attempt_at, created_at)
  where status in ('pending', 'retry_scheduled');

create index if not exists provider_dispatch_attempts_event_idx
  on ops.provider_dispatch_attempts (event_id, provider)
  where event_id is not null;

create index if not exists provider_dispatch_attempts_provider_status_idx
  on ops.provider_dispatch_attempts (provider, status, updated_at desc);

create index if not exists provider_dispatch_attempts_skipped_idx
  on ops.provider_dispatch_attempts (provider, skip_reason, updated_at desc)
  where status = 'skipped_unqualified';

create table if not exists ops.slo_incidents (
  id uuid primary key default gen_random_uuid(),

  incident_key text not null unique,
  severity text not null
    check (severity in ('critical', 'high', 'medium', 'low')),
  workload text not null,
  status text not null default 'open'
    check (status in ('open', 'investigating', 'mitigated', 'resolved')),
  description text not null,
  metadata jsonb not null default '{}'::jsonb,

  opened_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists slo_incidents_status_idx
  on ops.slo_incidents (status, severity, opened_at desc);

create table if not exists ops.dead_letter_events (
  id uuid primary key default gen_random_uuid(),

  source text not null,
  reason text not null,
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  resolution_code text,
  resolution_note text,
  resolved_by text,

  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists dead_letter_events_unresolved_idx
  on ops.dead_letter_events (created_at)
  where resolved_at is null;

create table if not exists ops.web_vitals (
  id uuid primary key default gen_random_uuid(),

  metric_id text not null,
  name text not null,
  value double precision not null,
  delta double precision,
  rating text
    check (rating in ('good', 'needs-improvement', 'poor')),
  pathname text,
  href text,
  referrer text,
  navigation_type text,
  attribution jsonb,
  entries jsonb not null default '[]'::jsonb,
  reported_at timestamptz not null,

  created_at timestamptz not null default now()
);

create index if not exists web_vitals_name_reported_at_idx
  on ops.web_vitals (name, reported_at desc);

create index if not exists web_vitals_pathname_reported_at_idx
  on ops.web_vitals (pathname, reported_at desc)
  where pathname is not null;

create table if not exists ops.integration_job_leases (
  job_name text primary key,
  lease_owner text not null,
  acquired_at timestamptz not null default now(),
  expires_at timestamptz not null,
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists integration_job_leases_expires_at_idx
  on ops.integration_job_leases (expires_at);

create or replace view ops.provider_dispatch_health
with (security_invoker = true)
as
select
  provider,
  status,
  dispatch_mode,
  skip_reason,
  count(*)::bigint as row_count,
  max(updated_at) as last_updated_at,
  max(processed_at) as last_processed_at
from ops.provider_dispatch_attempts
group by provider, status, dispatch_mode, skip_reason;

create or replace view ops.dead_letter_summary
with (security_invoker = true)
as
select
  source,
  reason,
  count(*) filter (where resolved_at is null)::bigint as unresolved_count,
  count(*)::bigint as total_count,
  max(created_at) as latest_created_at,
  max(resolved_at) as latest_resolved_at
from ops.dead_letter_events
group by source, reason;
