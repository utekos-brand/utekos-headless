
create table if not exists marketing.shopify_customers (
  shopify_customer_id text primary key,
  email text,
  phone text,
  first_name text,
  last_name text,
  orders_count bigint not null default 0 check (orders_count >= 0),
  total_spent numeric(18, 2) not null default 0 check (total_spent >= 0),
  currency_code text,
  shopify_created_at timestamptz not null,
  shopify_updated_at timestamptz,
  synced_at timestamptz not null default now()
);

create index if not exists shopify_customers_email_idx
  on marketing.shopify_customers (lower(email))
  where email is not null;

create index if not exists shopify_customers_phone_idx
  on marketing.shopify_customers (phone)
  where phone is not null;

create index if not exists shopify_customers_created_at_idx
  on marketing.shopify_customers (shopify_created_at desc);

alter table marketing.shopify_customers enable row level security;
alter table marketing.shopify_customers force row level security;

revoke all on marketing.shopify_customers from anon, authenticated;
grant usage on schema marketing to service_role;
grant select, insert, update, delete on marketing.shopify_customers to service_role;

create or replace view marketing.shopify_customers_overview
with (security_invoker = true)
as
select
  shopify_customer_id,
  nullif(trim(concat_ws(' ', first_name, last_name)), '') as customer_name,
  email,
  phone,
  orders_count,
  total_spent,
  currency_code,
  shopify_created_at,
  shopify_updated_at,
  synced_at
from marketing.shopify_customers;

revoke all on marketing.shopify_customers_overview from anon, authenticated;
grant select on marketing.shopify_customers_overview to service_role;
;
