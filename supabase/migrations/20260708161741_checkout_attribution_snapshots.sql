create table if not exists marketing.checkout_attribution_snapshots (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  primary_storage_token text,
  storage_tokens text[] not null default '{}'::text[],
  cart_id text,
  checkout_url text,
  event_id text,
  ga_client_id text,
  ga_session_id text,
  gclid text,
  gbraid text,
  wbraid text,
  msclkid text,
  dclid text,
  fbp text,
  fbc text,
  external_id text,
  email_hash text,
  client_ip_address text,
  client_user_agent text,
  user_data_quality jsonb not null default '{}'::jsonb,
  user_data jsonb not null default '{}'::jsonb,
  raw_payload jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null,
  first_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint checkout_attribution_snapshots_storage_tokens_check
    check (cardinality(storage_tokens) > 0)
);

create unique index if not exists checkout_attribution_snapshots_event_id_idx
  on marketing.checkout_attribution_snapshots (event_id)
  where event_id is not null;

create index if not exists checkout_attribution_snapshots_cart_id_idx
  on marketing.checkout_attribution_snapshots (cart_id, updated_at desc)
  where cart_id is not null;

create index if not exists checkout_attribution_snapshots_ga_client_idx
  on marketing.checkout_attribution_snapshots (ga_client_id, updated_at desc)
  where ga_client_id is not null;

create index if not exists checkout_attribution_snapshots_paid_click_idx
  on marketing.checkout_attribution_snapshots (gclid, gbraid, wbraid, msclkid, dclid)
  where gclid is not null
    or gbraid is not null
    or wbraid is not null
    or msclkid is not null
    or dclid is not null;

create table if not exists marketing.checkout_attribution_lookup_tokens (
  token text primary key,
  snapshot_id uuid not null
    references marketing.checkout_attribution_snapshots(id)
    on delete cascade,
  token_kind text not null default 'unknown'
    check (token_kind in ('checkout_key', 'checkout_token', 'cart_token', 'cart_id', 'unknown')),
  first_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists checkout_attribution_lookup_tokens_snapshot_idx
  on marketing.checkout_attribution_lookup_tokens (snapshot_id, updated_at desc);

alter table marketing.checkout_attribution_snapshots enable row level security;
alter table marketing.checkout_attribution_lookup_tokens enable row level security;

revoke all on table marketing.checkout_attribution_snapshots from anon, authenticated;
revoke all on table marketing.checkout_attribution_lookup_tokens from anon, authenticated;

grant usage on schema marketing to service_role;
grant select, insert, update on marketing.checkout_attribution_snapshots to service_role;
grant select, insert, update on marketing.checkout_attribution_lookup_tokens to service_role;
