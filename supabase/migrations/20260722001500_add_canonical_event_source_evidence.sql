create table if not exists marketing.canonical_event_source_evidence (
  id uuid primary key default gen_random_uuid(),
  canonical_event_id text not null,
  canonical_event_name text not null,
  canonical_idempotency_key text not null,
  observation_key text not null unique,
  source_system text not null,
  source_method text not null,
  source_object_type text not null,
  source_object_id text not null,
  source_topic text not null,
  source_delivery_id text,
  source_event_id text,
  source_api_version text not null,
  source_triggered_at timestamptz not null,
  source_observed_at timestamptz not null,
  observation_count integer not null default 1
    check (observation_count >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint canonical_event_source_evidence_ledger_fkey
    foreign key (canonical_idempotency_key)
    references marketing.event_ledger(idempotency_key)
    on delete restrict
);

comment on table marketing.canonical_event_source_evidence is
  'Provider-neutral commerce source correlation. Raw bodies, authentication material and customer data are forbidden.';

create index if not exists canonical_event_source_evidence_event_idx
  on marketing.canonical_event_source_evidence (
    canonical_event_id,
    source_observed_at desc
  );

create index if not exists canonical_event_source_evidence_object_idx
  on marketing.canonical_event_source_evidence (
    source_system,
    source_object_type,
    source_object_id,
    source_observed_at desc
  );

create index if not exists canonical_event_source_evidence_source_event_idx
  on marketing.canonical_event_source_evidence (
    source_system,
    source_event_id
  )
  where source_event_id is not null;

alter table marketing.canonical_event_source_evidence
  enable row level security;
alter table marketing.canonical_event_source_evidence
  force row level security;

grant usage on schema marketing to service_role;
revoke all on table marketing.canonical_event_source_evidence
  from public, anon, authenticated, service_role;
grant select, insert, update
  on table marketing.canonical_event_source_evidence
  to service_role;
