create table if not exists marketing.campaign_insights (
  id uuid primary key default gen_random_uuid(),
  campaign_id text not null,
  campaign_name text,
  adset_id text,
  adset_name text,
  ad_id text,
  ad_name text,
  date_start date not null,
  date_stop date not null,
  impressions integer not null default 0,
  clicks integer not null default 0,
  spend numeric not null default 0,
  cpc numeric,
  ctr numeric,
  roas numeric,
  demographics jsonb not null default '{}'::jsonb,
  raw_payload jsonb not null default '{}'::jsonb,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (
    campaign_id,
    adset_id,
    ad_id,
    date_start,
    date_stop
  )
);

create index if not exists campaign_insights_campaign_date_idx
  on marketing.campaign_insights (campaign_id, date_start desc);

alter table marketing.campaign_insights enable row level security;

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

alter table ops.integration_job_leases enable row level security;

alter table ops.provider_dispatch_attempts
  add column if not exists consent_basis jsonb not null default '{}'::jsonb,
  add column if not exists data_quality jsonb not null default '{}'::jsonb,
  add column if not exists last_attempt_started_at timestamptz,
  add column if not exists latency_ms integer,
  add column if not exists dispatch_mode text not null default 'server_retry',
  add column if not exists skip_reason text;

alter table ops.provider_dispatch_attempts
  drop constraint if exists provider_dispatch_attempts_status_check,
  add constraint provider_dispatch_attempts_status_check
    check (status in ('pending', 'processing', 'succeeded', 'retry_scheduled', 'failed', 'dead_lettered', 'skipped_unqualified'));

alter table ops.provider_dispatch_attempts
  drop constraint if exists provider_dispatch_attempts_dispatch_mode_check,
  add constraint provider_dispatch_attempts_dispatch_mode_check
    check (dispatch_mode in ('server_retry', 'server_direct', 'client_observed'));

alter table ops.provider_dispatch_attempts
  drop constraint if exists provider_dispatch_attempts_latency_ms_check,
  add constraint provider_dispatch_attempts_latency_ms_check
    check (latency_ms is null or latency_ms >= 0);

create index if not exists provider_dispatch_attempts_provider_status_idx
  on ops.provider_dispatch_attempts (provider, status, updated_at desc);

create index if not exists provider_dispatch_attempts_skipped_idx
  on ops.provider_dispatch_attempts (provider, skip_reason, updated_at desc)
  where status = 'skipped_unqualified';

alter table ops.dead_letter_events
  add column if not exists resolution_code text,
  add column if not exists resolution_note text,
  add column if not exists resolved_by text;

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
