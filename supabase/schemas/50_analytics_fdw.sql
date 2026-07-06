-- Iceberg analytics bucket foreign data wrapper.
-- Vault secrets are provisioned by Supabase when the analytics bucket is connected.
-- Foreign table import runs only when the catalog namespace exists.

create schema if not exists analytics;

comment on schema analytics is
  'Foreign tables over the analytics-bucket Iceberg catalog for long-term analytical queries.';

do $analytics_fdw$
declare
  v_access_key_id text;
  v_secret_access_key text;
  v_token text;
  v_bucket_arn text;
begin
  if not exists (select 1 from pg_extension where extname = 'wrappers') then
    raise notice 'wrappers extension is not installed; skipping analytics_bucket_fdw setup';
    return;
  end if;

  select id::text
  into v_access_key_id
  from vault.secrets
  where name = 'analytics_bucket_fdw_vault_aws_access_key_id';

  select id::text
  into v_secret_access_key
  from vault.secrets
  where name = 'analytics_bucket_fdw_vault_aws_secret_access_key';

  select id::text
  into v_token
  from vault.secrets
  where name = 'analytics_bucket_fdw_vault_token';

  select id::text
  into v_bucket_arn
  from vault.secrets
  where name = 'analytics_bucket_fdw_vault_aws_s3table_bucket_arn';

  if v_access_key_id is null
    or v_secret_access_key is null
    or v_token is null
    or v_bucket_arn is null then
    raise notice 'analytics bucket vault secrets are missing; skipping analytics_bucket_fdw setup';
    return;
  end if;

  if not exists (
    select 1
    from pg_foreign_data_wrapper
    where fdwname = 'iceberg_wrapper'
  ) then
    execute '
      create foreign data wrapper iceberg_wrapper
        handler iceberg_fdw_handler
        validator iceberg_fdw_validator
    ';
  end if;

  if not exists (
    select 1
    from pg_foreign_server
    where srvname in ('analytics_bucket_fdw', 'analytics_bucket_fdw_server')
  ) then
    execute format(
      $sql$
        create server analytics_bucket_fdw
          foreign data wrapper iceberg_wrapper
          options (
            vault_aws_access_key_id %L,
            vault_aws_secret_access_key %L,
            vault_token %L,
            aws_s3table_bucket_arn %L,
            catalog_uri %L,
            warehouse %L,
            "s3.endpoint" %L
          )
      $sql$,
      v_access_key_id,
      v_secret_access_key,
      v_token,
      v_bucket_arn,
      'https://hkoawfbomhnzupcsdggb.storage.supabase.co/storage/v1/iceberg',
      'analytics-bucket',
      'https://hkoawfbomhnzupcsdggb.storage.supabase.co/storage/v1/s3'
    );
  end if;
end
$analytics_fdw$;

-- Import foreign tables when the Iceberg namespace is available.
do $import_analytics$
declare
  v_server_name text;
begin
  select srvname
  into v_server_name
  from pg_foreign_server
  where srvname in ('analytics_bucket_fdw_server', 'analytics_bucket_fdw')
  order by case srvname when 'analytics_bucket_fdw_server' then 0 else 1 end
  limit 1;

  if v_server_name is null then
    return;
  end if;

  if exists (
    select 1
    from information_schema.schemata
    where schema_name = 'analytics'
      and catalog_name = current_database()
  ) and not exists (
    select 1
    from information_schema.tables
    where table_schema = 'analytics'
      and table_type = 'FOREIGN'
  ) then
    begin
      execute format(
        'import foreign schema "default" from server %I into analytics',
        v_server_name
      );
    exception
      when others then
        raise notice 'analytics foreign schema import skipped: %', sqlerrm;
    end;
  end if;
end
$import_analytics$;

-- Cold-storage mirror for ledger rows until Iceberg write support is available.
create table if not exists analytics.event_ledger_archive (
  id uuid primary key,
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
  created_at timestamptz not null,
  archived_at timestamptz not null default now()
);

create index if not exists event_ledger_archive_occurred_at_idx
  on analytics.event_ledger_archive (occurred_at desc);

create or replace function analytics.archive_event_ledger_batch(p_batch_size integer default 500)
returns integer
language plpgsql
security definer
set search_path = analytics, marketing, public
as $$
declare
  v_archived integer := 0;
begin
  with candidates as (
    select
      l.id,
      l.event_id,
      l.event_name,
      l.idempotency_key,
      l.anonymous_id,
      l.external_id,
      l.source_url,
      l.consent,
      l.user_data_quality,
      l.payload,
      l.occurred_at,
      l.created_at
    from marketing.event_ledger l
    where l.occurred_at < now() - interval '30 days'
      and not exists (
        select 1
        from analytics.event_ledger_archive a
        where a.id = l.id
      )
    order by l.occurred_at asc
    limit greatest(p_batch_size, 1)
  ),
  inserted as (
    insert into analytics.event_ledger_archive (
      id,
      event_id,
      event_name,
      idempotency_key,
      anonymous_id,
      external_id,
      source_url,
      consent,
      user_data_quality,
      payload,
      occurred_at,
      created_at
    )
    select
      id,
      event_id,
      event_name,
      idempotency_key,
      anonymous_id,
      external_id,
      source_url,
      consent,
      user_data_quality,
      payload,
      occurred_at,
      created_at
    from candidates
    on conflict (id) do nothing
    returning 1
  )
  select count(*)::integer into v_archived from inserted;

  return v_archived;
end;
$$;

do $schedule_archive$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron')
    and not exists (
      select 1
      from cron.job
      where jobname = 'archive_event_ledger_batch'
    ) then
    perform cron.schedule(
      'archive_event_ledger_batch',
      '15 3 * * *',
      $cron$select analytics.archive_event_ledger_batch(1000);$cron$
    );
  end if;
exception
  when others then
    raise notice 'archive_event_ledger_batch cron schedule skipped: %', sqlerrm;
end
$schedule_archive$;

alter table analytics.event_ledger_archive enable row level security;
