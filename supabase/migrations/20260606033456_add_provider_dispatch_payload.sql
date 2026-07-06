alter table ops.provider_dispatch_attempts
  add column if not exists payload jsonb not null default '{}'::jsonb;
