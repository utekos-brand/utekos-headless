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

create index if not exists website_visitor_events_visitor_idx
  on marketing.website_visitor_events (visitor_id, occurred_at desc);

create index if not exists website_visitor_events_session_idx
  on marketing.website_visitor_events (session_id, occurred_at desc)
  where session_id is not null;

create index if not exists website_visitor_events_pathname_idx
  on marketing.website_visitor_events (pathname, occurred_at desc)
  where pathname is not null;

alter table marketing.website_visitor_events enable row level security;
