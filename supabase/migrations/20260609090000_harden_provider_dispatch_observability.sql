alter table ops.provider_dispatch_attempts
  add column if not exists consent_basis jsonb not null default '{}'::jsonb,
  add column if not exists data_quality jsonb not null default '{}'::jsonb,
  add column if not exists last_attempt_started_at timestamptz,
  add column if not exists latency_ms integer
    check (latency_ms is null or latency_ms >= 0);

create index if not exists provider_dispatch_attempts_dead_letter_idx
  on ops.provider_dispatch_attempts (updated_at desc)
  where status = 'dead_lettered';
