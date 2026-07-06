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

create index if not exists partner_referrals_partner_source_id_idx
  on partner.referrals (partner_source_id)
  where partner_source_id is not null;
