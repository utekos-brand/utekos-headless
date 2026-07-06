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
create index if not exists leads_email_idx on marketing.leads (email)
where email is not null;
create table if not exists marketing.attribution_events (
  id uuid primary key default gen_random_uuid(),
  anonymous_id text,
  lead_id uuid references marketing.leads(id) on delete
  set null,
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
create index if not exists attribution_events_created_at_idx on marketing.attribution_events (created_at desc);
create index if not exists attribution_events_anonymous_id_idx on marketing.attribution_events (anonymous_id)
where anonymous_id is not null;
create index if not exists attribution_events_lead_id_idx on marketing.attribution_events (lead_id)
where lead_id is not null;
create table if not exists marketing.website_visitor_events (
  id uuid primary key default gen_random_uuid(),
  source_project text not null default 'utekos-headless',
  visitor_id text not null,
  session_id text,
  pathname text,
  referrer text,
  user_agent text,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists website_visitor_events_visitor_idx on marketing.website_visitor_events (visitor_id, occurred_at desc);
create index if not exists website_visitor_events_session_idx on marketing.website_visitor_events (session_id, occurred_at desc)
where session_id is not null;
create index if not exists website_visitor_events_pathname_idx on marketing.website_visitor_events (pathname, occurred_at desc)
where pathname is not null;
create table if not exists marketing.consent_snapshots (
  id uuid primary key default gen_random_uuid(),
  anonymous_id text,
  external_id text,
  categories jsonb not null default '{}'::jsonb,
  source text not null default 'website',
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists consent_snapshots_anonymous_id_idx on marketing.consent_snapshots (anonymous_id, occurred_at desc)
where anonymous_id is not null;
create index if not exists consent_snapshots_external_id_idx on marketing.consent_snapshots (external_id, occurred_at desc)
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
create index if not exists event_ledger_event_name_idx on marketing.event_ledger (event_name, occurred_at desc);
create index if not exists event_ledger_created_at_idx on marketing.event_ledger (created_at desc);
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
create index if not exists meta_quality_snapshots_dataset_idx on marketing.meta_quality_snapshots (dataset_id, measured_at desc);
create table if not exists marketing.campaign_insights (
  id uuid primary key default gen_random_uuid(),
  campaign_id text not null,
  campaign_name text,
  adset_id text,
  adset_name text,
  ad_id text,
  ad_name text,
  date_start date not null,
  date_stop date not null,
  impressions integer not null default 0,
  clicks integer not null default 0,
  spend numeric not null default 0,
  cpc numeric,
  ctr numeric,
  roas numeric,
  demographics jsonb not null default '{}'::jsonb,
  raw_payload jsonb not null default '{}'::jsonb,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(
    campaign_id,
    adset_id,
    ad_id,
    date_start,
    date_stop
  )
);
create index if not exists campaign_insights_campaign_date_idx on marketing.campaign_insights (campaign_id, date_start desc);
