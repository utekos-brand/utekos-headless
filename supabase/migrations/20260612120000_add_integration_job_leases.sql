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
