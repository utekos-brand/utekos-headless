
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
from marketing.shopify_customers
where orders_count > 0
  and total_spent > 500
  and currency_code = 'NOK';

comment on view marketing.shopify_customers_overview is
  'Unhashed Shopify customer overview limited to customers with at least one order and lifetime Shopify amountSpent above NOK 500.';

revoke all on marketing.shopify_customers_overview from anon, authenticated;
grant select on marketing.shopify_customers_overview to service_role;
;
