create table if not exists ops.tagging_observations (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  event_id text not null,
  event_name text not null,
  observation_type text not null
    check (observation_type in ('browser_dispatch', 'sgtm_ingress', 'tag_execution')),
  container_id text,
  container_version text,
  client_name text,
  tag_id text,
  tag_status text,
  tag_execution_time_ms integer
    check (tag_execution_time_ms is null or tag_execution_time_ms >= 0),
  observed_at timestamptz not null,
  received_at timestamptz not null default now()
);

alter table ops.tagging_observations
  drop constraint if exists tagging_observations_shape_check,
  add constraint tagging_observations_shape_check check (
    (
      observation_type = 'browser_dispatch'
      and container_id is null
      and container_version is null
      and client_name is null
      and tag_id is null
      and tag_status is null
      and tag_execution_time_ms is null
    )
    or (
      observation_type = 'sgtm_ingress'
      and container_id is not null
      and container_version is not null
      and client_name is not null
      and tag_id is null
      and tag_status is null
      and tag_execution_time_ms is null
    )
    or (
      observation_type = 'tag_execution'
      and container_id is not null
      and container_version is not null
      and client_name is not null
      and tag_id is not null
      and tag_status is not null
    )
  );

comment on table ops.tagging_observations is
  'PII-free browser and server GTM receipts. URLs, client ids, IP addresses and raw payloads are forbidden.';

create index if not exists tagging_observations_event_idx
  on ops.tagging_observations (event_id, observed_at desc);

create index if not exists tagging_observations_type_idx
  on ops.tagging_observations (observation_type, received_at desc);

alter table ops.tagging_observations enable row level security;
alter table ops.tagging_observations force row level security;
revoke all on table ops.tagging_observations from public, anon, authenticated, service_role;
grant select, insert on table ops.tagging_observations to service_role;

alter table ops.provider_dispatch_attempts
  add column if not exists payload_summary jsonb not null default '{}'::jsonb,
  add column if not exists request_id text,
  add column if not exists http_status integer,
  add column if not exists validation_result jsonb not null default '{}'::jsonb,
  add column if not exists response_semantics text;

alter table ops.provider_dispatch_attempts
  drop constraint if exists provider_dispatch_attempts_status_check,
  add constraint provider_dispatch_attempts_status_check
    check (status in (
      'pending',
      'processing',
      'succeeded',
      'accepted_unverified',
      'retry_scheduled',
      'failed',
      'dead_lettered',
      'skipped_unqualified'
    ));

alter table ops.provider_dispatch_attempts
  drop constraint if exists provider_dispatch_attempts_http_status_check,
  add constraint provider_dispatch_attempts_http_status_check
    check (http_status is null or http_status between 100 and 599);

alter table marketing.checkout_attribution_snapshots
  add column if not exists consent_provenance jsonb not null default '{}'::jsonb;

alter table marketing.checkout_attribution_snapshots force row level security;
alter table marketing.checkout_attribution_lookup_tokens force row level security;
revoke all on table marketing.checkout_attribution_snapshots from anon, authenticated;
revoke all on table marketing.checkout_attribution_lookup_tokens from anon, authenticated;
grant select, insert, update on table marketing.checkout_attribution_snapshots to service_role;
grant select, insert, update on table marketing.checkout_attribution_lookup_tokens to service_role;
