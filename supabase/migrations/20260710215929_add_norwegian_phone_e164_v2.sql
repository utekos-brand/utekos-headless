
alter table marketing.shopify_customers
add column phone_e164 text
generated always as (
  case
    when phone is null or btrim(phone) = '' then null
    when regexp_replace(phone, '[^0-9]', '', 'g') ~ '^[0-9]{8}$'
      then '+47' || regexp_replace(phone, '[^0-9]', '', 'g')
    when regexp_replace(phone, '[^0-9]', '', 'g') ~ '^47[0-9]{8}$'
      then '+' || regexp_replace(phone, '[^0-9]', '', 'g')
    when regexp_replace(phone, '[^0-9]', '', 'g') ~ '^0047[0-9]{8}$'
      then '+' || substring(
        regexp_replace(phone, '[^0-9]', '', 'g')
        from 3
      )
    else null
  end
) stored;

alter table marketing.shopify_customers
add constraint shopify_customers_phone_e164_format
check (
  phone_e164 is null
  or phone_e164 ~ '^\+47[0-9]{8}$'
);

create index if not exists shopify_customers_phone_e164_idx
  on marketing.shopify_customers (phone_e164)
  where phone_e164 is not null;

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
  synced_at,
  phone_e164
from marketing.shopify_customers
where orders_count > 0
  and total_spent > 500
  and currency_code = 'NOK';

comment on column marketing.shopify_customers.phone_e164 is
  'Generated Norwegian E.164 number. The original Shopify phone value remains unchanged.';

revoke all on marketing.shopify_customers_overview from anon, authenticated;
grant select on marketing.shopify_customers_overview to service_role;
;
