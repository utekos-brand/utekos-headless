create extension if not exists "pgcrypto" with schema extensions;
create extension if not exists "pg_net" with schema extensions;
create extension if not exists "wrappers" with schema extensions;
create extension if not exists "pg_cron";

create schema if not exists marketing;
create schema if not exists partner;
create schema if not exists ops;

comment on schema marketing is 'Utekos marketing, leads, campaign and consent data.';
comment on schema partner is 'Utekos partner attribution and partner-specific flows.';
comment on schema ops is 'Operational logs, integration events and internal audit data.';

create table if not exists marketing.leads (
  id uuid primary key default gen_random_uuid(),
  email text,
  phone text,
  first_name text,
  last_name text,
  source text not null default 'unknown',
  campaign text,
  medium text,
  content text,
  term text,
  consent_marketing boolean not null default false,
  consent_source text,
  consented_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on marketing.leads (created_at desc);
create index if not exists leads_email_idx on marketing.leads (email) where email is not null;

create table if not exists marketing.attribution_events (
  id uuid primary key default gen_random_uuid(),
  anonymous_id text,
  lead_id uuid references marketing.leads(id) on delete set null,
  source text,
  medium text,
  campaign text,
  content text,
  term text,
  landing_path text,
  referrer text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists attribution_events_created_at_idx
  on marketing.attribution_events (created_at desc);
create index if not exists attribution_events_anonymous_id_idx
  on marketing.attribution_events (anonymous_id)
  where anonymous_id is not null;

create table if not exists marketing.consent_snapshots (
  id uuid primary key default gen_random_uuid(),
  anonymous_id text,
  external_id text,
  categories jsonb not null default '{}'::jsonb,
  source text not null default 'website',
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists consent_snapshots_anonymous_id_idx
  on marketing.consent_snapshots (anonymous_id, occurred_at desc)
  where anonymous_id is not null;
create index if not exists consent_snapshots_external_id_idx
  on marketing.consent_snapshots (external_id, occurred_at desc)
  where external_id is not null;

create table if not exists marketing.event_ledger (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  event_name text not null,
  idempotency_key text not null unique,
  anonymous_id text,
  external_id text,
  source_url text,
  consent jsonb not null default '{}'::jsonb,
  user_data_quality jsonb not null default '{}'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists event_ledger_event_id_idx on marketing.event_ledger (event_id);
create index if not exists event_ledger_event_name_idx
  on marketing.event_ledger (event_name, occurred_at desc);
create index if not exists event_ledger_created_at_idx
  on marketing.event_ledger (created_at desc);

create table if not exists marketing.meta_quality_snapshots (
  id uuid primary key default gen_random_uuid(),
  dataset_id text not null,
  event_name text,
  event_match_quality numeric,
  event_coverage numeric,
  dedup_key_feedback jsonb not null default '{}'::jsonb,
  data_freshness jsonb not null default '{}'::jsonb,
  raw_payload jsonb not null default '{}'::jsonb,
  measured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists meta_quality_snapshots_dataset_idx
  on marketing.meta_quality_snapshots (dataset_id, measured_at desc);

create table if not exists partner.sources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists partner.referrals (
  id uuid primary key default gen_random_uuid(),
  partner_source_id uuid references partner.sources(id) on delete set null,
  anonymous_id text,
  landing_path text,
  referrer text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists partner_referrals_created_at_idx
  on partner.referrals (created_at desc);
create index if not exists partner_referrals_anonymous_id_idx
  on partner.referrals (anonymous_id)
  where anonymous_id is not null;

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
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'succeeded', 'retry_scheduled', 'failed', 'dead_lettered')),
  attempt_count integer not null default 0
    check (attempt_count >= 0),
  next_attempt_at timestamptz,
  last_error text,
  response jsonb not null default '{}'::jsonb,
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
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists dead_letter_events_unresolved_idx
  on ops.dead_letter_events (created_at)
  where resolved_at is null;

alter table marketing.leads enable row level security;
alter table marketing.attribution_events enable row level security;
alter table marketing.consent_snapshots enable row level security;
alter table marketing.event_ledger enable row level security;
alter table marketing.meta_quality_snapshots enable row level security;
alter table partner.sources enable row level security;
alter table partner.referrals enable row level security;
alter table ops.integration_events enable row level security;
alter table ops.provider_dispatch_attempts enable row level security;
alter table ops.slo_incidents enable row level security;
alter table ops.dead_letter_events enable row level security;
