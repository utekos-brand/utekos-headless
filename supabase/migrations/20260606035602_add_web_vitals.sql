create table if not exists ops.web_vitals (
  id uuid primary key default gen_random_uuid(),
  metric_id text not null,
  name text not null,
  value double precision not null,
  delta double precision,
  rating text
    check (rating in ('good', 'needs-improvement', 'poor')),
  pathname text,
  href text,
  referrer text,
  navigation_type text,
  attribution jsonb,
  entries jsonb not null default '[]'::jsonb,
  reported_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists web_vitals_name_reported_at_idx
  on ops.web_vitals (name, reported_at desc);

create index if not exists web_vitals_pathname_reported_at_idx
  on ops.web_vitals (pathname, reported_at desc)
  where pathname is not null;

alter table ops.web_vitals enable row level security;
