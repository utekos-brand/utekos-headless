create schema if not exists commerce;

comment on schema commerce is
  'Utekos commerce warehouse data, Shopify imports and order attribution views.';

create table if not exists commerce.shopify_graphql_requests (
  id uuid primary key default gen_random_uuid(),

  purpose text not null,
  request_kind text not null default 'generic_graphql'
    check (request_kind in ('generic_graphql', 'orders_page')),
  shop_domain text not null,
  api_version text not null default '2026-07',

  graphql_query text not null,
  variables jsonb not null default '{}'::jsonb,
  request_body jsonb not null default '{}'::jsonb,
  pg_net_request_id bigint unique,

  status text not null default 'sent'
    check (status in ('sent', 'collected', 'failed', 'graphql_error')),
  http_status_code integer,
  response_headers jsonb not null default '{}'::jsonb,
  response_body jsonb,
  graphql_errors jsonb not null default '[]'::jsonb,
  error_message text,

  requested_at timestamptz not null default now(),
  sent_at timestamptz,
  collected_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists shopify_graphql_requests_status_idx
  on commerce.shopify_graphql_requests (status, requested_at desc);

create index if not exists shopify_graphql_requests_kind_idx
  on commerce.shopify_graphql_requests (request_kind, requested_at desc);

create table if not exists commerce.shopify_order_snapshots (
  id uuid primary key default gen_random_uuid(),

  shop_domain text not null,
  shopify_order_id text not null,
  legacy_resource_id text,
  order_name text,

  created_at_shopify timestamptz,
  updated_at_shopify timestamptz,
  processed_at_shopify timestamptz,
  closed_at_shopify timestamptz,
  cancelled_at_shopify timestamptz,

  financial_status text,
  fulfillment_status text,
  customer_accepts_marketing boolean,
  customer_locale text,
  currency_code text,

  total_price_amount numeric,
  subtotal_price_amount numeric,
  total_tax_amount numeric,
  total_shipping_amount numeric,
  total_refunded_amount numeric,

  display_address jsonb not null default '{}'::jsonb,
  custom_attributes jsonb not null default '[]'::jsonb,
  customer_journey_summary jsonb not null default '{}'::jsonb,
  transactions jsonb not null default '[]'::jsonb,
  raw_payload jsonb not null default '{}'::jsonb,

  source_request_id uuid references commerce.shopify_graphql_requests(id)
    on delete set null,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (shop_domain, shopify_order_id)
);

create index if not exists shopify_order_snapshots_processed_idx
  on commerce.shopify_order_snapshots (processed_at_shopify desc)
  where processed_at_shopify is not null;

create index if not exists shopify_order_snapshots_updated_idx
  on commerce.shopify_order_snapshots (updated_at_shopify desc)
  where updated_at_shopify is not null;

create index if not exists shopify_order_snapshots_name_idx
  on commerce.shopify_order_snapshots (order_name)
  where order_name is not null;

create table if not exists commerce.shopify_order_line_items (
  id uuid primary key default gen_random_uuid(),

  shop_domain text not null,
  shopify_order_id text not null,
  shopify_line_item_id text not null,
  shopify_product_id text,
  shopify_variant_id text,
  product_handle text,
  product_title text,
  variant_title text,
  sku text,
  title text,
  quantity integer,
  current_quantity integer,
  discounted_total_amount numeric,
  currency_code text,
  raw_payload jsonb not null default '{}'::jsonb,

  source_request_id uuid references commerce.shopify_graphql_requests(id)
    on delete set null,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (shop_domain, shopify_line_item_id)
);

create index if not exists shopify_order_line_items_order_idx
  on commerce.shopify_order_line_items (shop_domain, shopify_order_id);

create index if not exists shopify_order_line_items_sku_idx
  on commerce.shopify_order_line_items (sku)
  where sku is not null;

create or replace function commerce.shopify_attribute_value(
  p_attributes jsonb,
  p_key text
)
returns text
language sql
stable
as $$
  select attribute ->> 'value'
  from jsonb_array_elements(
    case
      when jsonb_typeof(p_attributes) = 'array' then p_attributes
      else '[]'::jsonb
    end
  ) as attributes(attribute)
  where attribute ->> 'key' = p_key
  limit 1
$$;

create or replace function commerce.shopify_money_amount(p_money jsonb)
returns numeric
language sql
stable
as $$
  select nullif(p_money #>> '{shopMoney,amount}', '')::numeric
$$;

create or replace function commerce.normalize_shopify_domain(p_shop_domain text)
returns text
language sql
stable
as $$
  select lower(
    regexp_replace(
      regexp_replace(trim(p_shop_domain), '^https?://', '', 'i'),
      '/.*$',
      ''
    )
  )
$$;

create or replace function commerce.get_required_vault_secret(p_name text)
returns text
language plpgsql
security definer
set search_path = commerce, public
as $$
declare
  v_secret text;
begin
  if to_regclass('vault.decrypted_secrets') is null then
    raise exception 'Supabase Vault view vault.decrypted_secrets is missing';
  end if;

  execute
    'select decrypted_secret
       from vault.decrypted_secrets
      where name in ($1, upper($1))
      order by case when name = $1 then 0 else 1 end,
               updated_at desc nulls last,
               created_at desc
      limit 1'
    into v_secret
    using p_name;

  if v_secret is null or btrim(v_secret) = '' then
    raise exception 'Required Vault secret % is missing', p_name;
  end if;

  return v_secret;
end
$$;

create or replace function commerce.enqueue_shopify_admin_graphql(
  p_purpose text,
  p_query text,
  p_variables jsonb default '{}'::jsonb,
  p_shop_domain text default null,
  p_api_version text default '2026-07',
  p_request_kind text default 'generic_graphql'
)
returns uuid
language plpgsql
security definer
set search_path = commerce, public
as $$
declare
  v_id uuid := gen_random_uuid();
  v_shop_domain text;
  v_api_version text;
  v_token text;
  v_endpoint text;
  v_body jsonb;
  v_pg_net_request_id bigint;
begin
  if p_purpose is null or btrim(p_purpose) = '' then
    raise exception 'p_purpose is required';
  end if;

  if p_query is null or btrim(p_query) = '' then
    raise exception 'p_query is required';
  end if;

  if p_request_kind not in ('generic_graphql', 'orders_page') then
    raise exception 'Unsupported Shopify request kind: %', p_request_kind;
  end if;

  v_api_version := coalesce(nullif(p_api_version, ''), '2026-07');
  if v_api_version !~ '^[0-9]{4}-[0-9]{2}$' then
    raise exception 'Invalid Shopify API version: %', v_api_version;
  end if;

  v_shop_domain := commerce.normalize_shopify_domain(
    coalesce(
      nullif(p_shop_domain, ''),
      commerce.get_required_vault_secret('shopify_store_domain')
    )
  );
  v_token := commerce.get_required_vault_secret('shopify_admin_api_token');
  v_endpoint := format(
    'https://%s/admin/api/%s/graphql.json',
    v_shop_domain,
    v_api_version
  );
  v_body := jsonb_build_object(
    'query',
    p_query,
    'variables',
    coalesce(p_variables, '{}'::jsonb)
  );

  select net.http_post(
    url := v_endpoint,
    body := v_body,
    headers := jsonb_build_object(
      'Content-Type',
      'application/json',
      'X-Shopify-Access-Token',
      v_token
    ),
    timeout_milliseconds := 10000
  )
  into v_pg_net_request_id;

  insert into commerce.shopify_graphql_requests (
    id,
    purpose,
    request_kind,
    shop_domain,
    api_version,
    graphql_query,
    variables,
    request_body,
    pg_net_request_id,
    status,
    sent_at
  )
  values (
    v_id,
    p_purpose,
    p_request_kind,
    v_shop_domain,
    v_api_version,
    p_query,
    coalesce(p_variables, '{}'::jsonb),
    v_body,
    v_pg_net_request_id,
    'sent',
    now()
  );

  return v_id;
end
$$;

create or replace function commerce.enqueue_shopify_orders_page(
  p_after text default null,
  p_updated_at_min timestamptz default now() - interval '60 days',
  p_first integer default 50,
  p_query text default null,
  p_shop_domain text default null,
  p_api_version text default '2026-07'
)
returns uuid
language plpgsql
security definer
set search_path = commerce, public
as $$
declare
  v_first integer;
  v_search_query text;
  v_graphql_query text;
begin
  v_first := least(greatest(coalesce(p_first, 50), 1), 250);
  v_search_query := coalesce(
    nullif(p_query, ''),
    format(
      'updated_at:>%s',
      to_char(
        coalesce(p_updated_at_min, now() - interval '60 days') at time zone 'UTC',
        'YYYY-MM-DD"T"HH24:MI:SS"Z"'
      )
    )
  );

  v_graphql_query := $graphql$
    query UtekosShopifyOrderAttributionPage($first: Int!, $after: String, $query: String) {
      orders(first: $first, after: $after, query: $query, sortKey: UPDATED_AT) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          legacyResourceId
          name
          createdAt
          updatedAt
          processedAt
          closedAt
          cancelledAt
          currencyCode
          displayFinancialStatus
          displayFulfillmentStatus
          customerAcceptsMarketing
          customerLocale
          customAttributes {
            key
            value
          }
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          subtotalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          totalTaxSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          totalShippingPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          totalRefundedSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          displayAddress {
            zip
            province
            provinceCode
            country
            countryCodeV2
          }
          customerJourneySummary {
            customerOrderIndex
            daysToConversion
            ready
            firstVisit {
              occurredAt
              source
              sourceType
              sourceDescription
              referrerUrl
              landingPage
              referralCode
              utmParameters {
                source
                medium
                campaign
                term
                content
              }
            }
            lastVisit {
              occurredAt
              source
              sourceType
              sourceDescription
              referrerUrl
              landingPage
              referralCode
              utmParameters {
                source
                medium
                campaign
                term
                content
              }
            }
          }
          transactions {
            id
            kind
            status
            gateway
            processedAt
            amountSet {
              shopMoney {
                amount
                currencyCode
              }
            }
          }
          lineItems(first: 30) {
            nodes {
              id
              sku
              title
              quantity
              currentQuantity
              discountedTotalSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              product {
                id
                handle
                title
              }
              variant {
                id
                sku
                title
              }
            }
          }
        }
      }
    }
  $graphql$;

  return commerce.enqueue_shopify_admin_graphql(
    p_purpose := 'shopify_orders_attribution_page',
    p_query := v_graphql_query,
    p_variables := jsonb_build_object(
      'first',
      v_first,
      'after',
      p_after,
      'query',
      v_search_query
    ),
    p_shop_domain := p_shop_domain,
    p_api_version := p_api_version,
    p_request_kind := 'orders_page'
  );
end
$$;

create or replace function commerce.import_shopify_orders_from_response(
  p_request_id uuid
)
returns integer
language plpgsql
security definer
set search_path = commerce, public
as $$
declare
  v_imported integer := 0;
begin
  if not exists (
    select 1
    from commerce.shopify_graphql_requests
    where id = p_request_id
      and response_body #> '{data,orders,nodes}' is not null
  ) then
    return 0;
  end if;

  with request as (
    select
      id,
      shop_domain,
      response_body
    from commerce.shopify_graphql_requests
    where id = p_request_id
  ),
  order_nodes as (
    select
      request.id as request_id,
      request.shop_domain,
      order_node
    from request
    cross join lateral jsonb_array_elements(
      request.response_body #> '{data,orders,nodes}'
    ) as orders(order_node)
  ),
  upserted_orders as (
    insert into commerce.shopify_order_snapshots (
      shop_domain,
      shopify_order_id,
      legacy_resource_id,
      order_name,
      created_at_shopify,
      updated_at_shopify,
      processed_at_shopify,
      closed_at_shopify,
      cancelled_at_shopify,
      financial_status,
      fulfillment_status,
      customer_accepts_marketing,
      customer_locale,
      currency_code,
      total_price_amount,
      subtotal_price_amount,
      total_tax_amount,
      total_shipping_amount,
      total_refunded_amount,
      display_address,
      custom_attributes,
      customer_journey_summary,
      transactions,
      raw_payload,
      source_request_id,
      synced_at,
      updated_at
    )
    select
      shop_domain,
      order_node ->> 'id',
      order_node ->> 'legacyResourceId',
      order_node ->> 'name',
      nullif(order_node ->> 'createdAt', '')::timestamptz,
      nullif(order_node ->> 'updatedAt', '')::timestamptz,
      nullif(order_node ->> 'processedAt', '')::timestamptz,
      nullif(order_node ->> 'closedAt', '')::timestamptz,
      nullif(order_node ->> 'cancelledAt', '')::timestamptz,
      order_node ->> 'displayFinancialStatus',
      order_node ->> 'displayFulfillmentStatus',
      (order_node ->> 'customerAcceptsMarketing')::boolean,
      order_node ->> 'customerLocale',
      coalesce(
        order_node #>> '{totalPriceSet,shopMoney,currencyCode}',
        order_node #>> '{subtotalPriceSet,shopMoney,currencyCode}',
        order_node ->> 'currencyCode'
      ),
      commerce.shopify_money_amount(order_node -> 'totalPriceSet'),
      commerce.shopify_money_amount(order_node -> 'subtotalPriceSet'),
      commerce.shopify_money_amount(order_node -> 'totalTaxSet'),
      commerce.shopify_money_amount(order_node -> 'totalShippingPriceSet'),
      commerce.shopify_money_amount(order_node -> 'totalRefundedSet'),
      coalesce(order_node -> 'displayAddress', '{}'::jsonb),
      coalesce(order_node -> 'customAttributes', '[]'::jsonb),
      coalesce(order_node -> 'customerJourneySummary', '{}'::jsonb),
      coalesce(order_node -> 'transactions', '[]'::jsonb),
      order_node,
      request_id,
      now(),
      now()
    from order_nodes
    where order_node ->> 'id' is not null
    on conflict (shop_domain, shopify_order_id) do update set
      legacy_resource_id = excluded.legacy_resource_id,
      order_name = excluded.order_name,
      created_at_shopify = excluded.created_at_shopify,
      updated_at_shopify = excluded.updated_at_shopify,
      processed_at_shopify = excluded.processed_at_shopify,
      closed_at_shopify = excluded.closed_at_shopify,
      cancelled_at_shopify = excluded.cancelled_at_shopify,
      financial_status = excluded.financial_status,
      fulfillment_status = excluded.fulfillment_status,
      customer_accepts_marketing = excluded.customer_accepts_marketing,
      customer_locale = excluded.customer_locale,
      currency_code = excluded.currency_code,
      total_price_amount = excluded.total_price_amount,
      subtotal_price_amount = excluded.subtotal_price_amount,
      total_tax_amount = excluded.total_tax_amount,
      total_shipping_amount = excluded.total_shipping_amount,
      total_refunded_amount = excluded.total_refunded_amount,
      display_address = excluded.display_address,
      custom_attributes = excluded.custom_attributes,
      customer_journey_summary = excluded.customer_journey_summary,
      transactions = excluded.transactions,
      raw_payload = excluded.raw_payload,
      source_request_id = excluded.source_request_id,
      synced_at = excluded.synced_at,
      updated_at = excluded.updated_at
    returning 1
  )
  select count(*)::integer into v_imported
  from upserted_orders;

  with request as (
    select
      id,
      shop_domain,
      response_body
    from commerce.shopify_graphql_requests
    where id = p_request_id
  ),
  order_nodes as (
    select
      request.id as request_id,
      request.shop_domain,
      order_node
    from request
    cross join lateral jsonb_array_elements(
      request.response_body #> '{data,orders,nodes}'
    ) as orders(order_node)
  ),
  line_item_nodes as (
    select
      request_id,
      shop_domain,
      order_node ->> 'id' as shopify_order_id,
      line_item
    from order_nodes
    cross join lateral jsonb_array_elements(
      coalesce(order_node #> '{lineItems,nodes}', '[]'::jsonb)
    ) as line_items(line_item)
  )
  insert into commerce.shopify_order_line_items (
    shop_domain,
    shopify_order_id,
    shopify_line_item_id,
    shopify_product_id,
    shopify_variant_id,
    product_handle,
    product_title,
    variant_title,
    sku,
    title,
    quantity,
    current_quantity,
    discounted_total_amount,
    currency_code,
    raw_payload,
    source_request_id,
    synced_at,
    updated_at
  )
  select
    shop_domain,
    shopify_order_id,
    line_item ->> 'id',
    line_item #>> '{product,id}',
    line_item #>> '{variant,id}',
    line_item #>> '{product,handle}',
    line_item #>> '{product,title}',
    line_item #>> '{variant,title}',
    coalesce(line_item ->> 'sku', line_item #>> '{variant,sku}'),
    line_item ->> 'title',
    nullif(line_item ->> 'quantity', '')::integer,
    nullif(line_item ->> 'currentQuantity', '')::integer,
    commerce.shopify_money_amount(line_item -> 'discountedTotalSet'),
    line_item #>> '{discountedTotalSet,shopMoney,currencyCode}',
    line_item,
    request_id,
    now(),
    now()
  from line_item_nodes
  where line_item ->> 'id' is not null
  on conflict (shop_domain, shopify_line_item_id) do update set
    shopify_order_id = excluded.shopify_order_id,
    shopify_product_id = excluded.shopify_product_id,
    shopify_variant_id = excluded.shopify_variant_id,
    product_handle = excluded.product_handle,
    product_title = excluded.product_title,
    variant_title = excluded.variant_title,
    sku = excluded.sku,
    title = excluded.title,
    quantity = excluded.quantity,
    current_quantity = excluded.current_quantity,
    discounted_total_amount = excluded.discounted_total_amount,
    currency_code = excluded.currency_code,
    raw_payload = excluded.raw_payload,
    source_request_id = excluded.source_request_id,
    synced_at = excluded.synced_at,
    updated_at = excluded.updated_at;

  return v_imported;
end
$$;

create or replace function commerce.collect_shopify_graphql_response(
  p_request_id uuid,
  p_async boolean default false,
  p_import_orders boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = commerce, public
as $$
declare
  v_request commerce.shopify_graphql_requests%rowtype;
  v_collect_status text;
  v_collect_message text;
  v_http_status_code integer;
  v_response_headers jsonb;
  v_response_body_text text;
  v_response_body jsonb;
  v_graphql_errors jsonb := '[]'::jsonb;
  v_imported_orders integer := 0;
begin
  select *
  into v_request
  from commerce.shopify_graphql_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Shopify GraphQL request % was not found', p_request_id;
  end if;

  if v_request.pg_net_request_id is null then
    raise exception 'Shopify GraphQL request % has no pg_net request id', p_request_id;
  end if;

  select
    result.status,
    result.message,
    (result.response).status_code,
    coalesce((result.response).headers, '{}'::jsonb),
    (result.response).body
  into
    v_collect_status,
    v_collect_message,
    v_http_status_code,
    v_response_headers,
    v_response_body_text
  from net.http_collect_response(v_request.pg_net_request_id, async := p_async)
    as result;

  if v_collect_status is distinct from 'SUCCESS' then
    update commerce.shopify_graphql_requests
    set
      status = 'failed',
      error_message = coalesce(v_collect_message, 'pg_net response is not ready or failed'),
      updated_at = now()
    where id = p_request_id;

    return jsonb_build_object(
      'ok',
      false,
      'status',
      v_collect_status,
      'message',
      v_collect_message
    );
  end if;

  begin
    v_response_body := coalesce(v_response_body_text, '{}')::jsonb;
  exception
    when others then
      update commerce.shopify_graphql_requests
      set
        status = 'failed',
        http_status_code = v_http_status_code,
        response_headers = v_response_headers,
        error_message = 'Shopify response body was not valid JSON',
        collected_at = now(),
        updated_at = now()
      where id = p_request_id;

      return jsonb_build_object(
        'ok',
        false,
        'status',
        'invalid_json',
        'http_status_code',
        v_http_status_code
      );
  end;

  v_graphql_errors := coalesce(v_response_body -> 'errors', '[]'::jsonb);

  update commerce.shopify_graphql_requests
  set
    status = case
      when v_http_status_code between 200 and 299
        and jsonb_array_length(v_graphql_errors) = 0
        then 'collected'
      when jsonb_array_length(v_graphql_errors) > 0
        then 'graphql_error'
      else 'failed'
    end,
    http_status_code = v_http_status_code,
    response_headers = v_response_headers,
    response_body = v_response_body,
    graphql_errors = v_graphql_errors,
    error_message = case
      when v_http_status_code between 200 and 299
        and jsonb_array_length(v_graphql_errors) = 0
        then null
      when jsonb_array_length(v_graphql_errors) > 0
        then 'Shopify GraphQL returned errors'
      else format('Shopify HTTP status %s', v_http_status_code)
    end,
    collected_at = now(),
    updated_at = now()
  where id = p_request_id;

  if p_import_orders
    and v_http_status_code between 200 and 299
    and jsonb_array_length(v_graphql_errors) = 0
    and v_response_body #> '{data,orders,nodes}' is not null then
    v_imported_orders := commerce.import_shopify_orders_from_response(p_request_id);
  end if;

  return jsonb_build_object(
    'ok',
    v_http_status_code between 200 and 299
      and jsonb_array_length(v_graphql_errors) = 0,
    'http_status_code',
    v_http_status_code,
    'graphql_error_count',
    jsonb_array_length(v_graphql_errors),
    'imported_orders',
    v_imported_orders,
    'has_next_page',
    v_response_body #>> '{data,orders,pageInfo,hasNextPage}',
    'end_cursor',
    v_response_body #>> '{data,orders,pageInfo,endCursor}'
  );
end
$$;

create or replace view commerce.shopify_orders_page_status
with (security_invoker = true)
as
select
  id,
  purpose,
  request_kind,
  shop_domain,
  api_version,
  status,
  http_status_code,
  requested_at,
  sent_at,
  collected_at,
  variables ->> 'query' as shopify_search_query,
  response_body #>> '{data,orders,pageInfo,hasNextPage}' as has_next_page,
  response_body #>> '{data,orders,pageInfo,endCursor}' as end_cursor,
  jsonb_array_length(coalesce(graphql_errors, '[]'::jsonb)) as graphql_error_count,
  error_message
from commerce.shopify_graphql_requests
where request_kind = 'orders_page';

create or replace view commerce.shopify_order_attribution_readiness
with (security_invoker = true)
as
select
  id,
  shop_domain,
  shopify_order_id,
  order_name,
  processed_at_shopify,
  financial_status,
  fulfillment_status,
  currency_code,
  total_price_amount,
  subtotal_price_amount,
  total_refunded_amount,
  display_address ->> 'zip' as postal_code,
  display_address ->> 'provinceCode' as province_code,
  display_address ->> 'countryCodeV2' as country_code,
  customer_accepts_marketing,
  commerce.shopify_attribute_value(custom_attributes, '_ga_client_id') as ga_client_id,
  commerce.shopify_attribute_value(custom_attributes, '_ga_session_id') as ga_session_id,
  commerce.shopify_attribute_value(custom_attributes, '_fbp') as fbp,
  commerce.shopify_attribute_value(custom_attributes, '_fbc') as fbc,
  commerce.shopify_attribute_value(custom_attributes, 'gclid') as gclid,
  commerce.shopify_attribute_value(custom_attributes, 'gbraid') as gbraid,
  commerce.shopify_attribute_value(custom_attributes, 'wbraid') as wbraid,
  commerce.shopify_attribute_value(custom_attributes, 'msclkid') as msclkid,
  commerce.shopify_attribute_value(custom_attributes, 'dclid') as dclid,
  (
    commerce.shopify_attribute_value(custom_attributes, '_ga_client_id') is not null
  ) as has_ga_client_id,
  (
    commerce.shopify_attribute_value(custom_attributes, '_fbp') is not null
    or commerce.shopify_attribute_value(custom_attributes, '_fbc') is not null
  ) as has_meta_browser_ids,
  (
    commerce.shopify_attribute_value(custom_attributes, 'gclid') is not null
    or commerce.shopify_attribute_value(custom_attributes, 'gbraid') is not null
    or commerce.shopify_attribute_value(custom_attributes, 'wbraid') is not null
  ) as has_google_click_id,
  (
    commerce.shopify_attribute_value(custom_attributes, 'msclkid') is not null
  ) as has_microsoft_click_id,
  (
    (commerce.shopify_attribute_value(custom_attributes, '_ga_client_id') is not null)::integer
    + (commerce.shopify_attribute_value(custom_attributes, '_ga_session_id') is not null)::integer
    + (commerce.shopify_attribute_value(custom_attributes, '_fbp') is not null)::integer
    + (commerce.shopify_attribute_value(custom_attributes, '_fbc') is not null)::integer
    + (commerce.shopify_attribute_value(custom_attributes, 'gclid') is not null)::integer
    + (commerce.shopify_attribute_value(custom_attributes, 'gbraid') is not null)::integer
    + (commerce.shopify_attribute_value(custom_attributes, 'wbraid') is not null)::integer
    + (commerce.shopify_attribute_value(custom_attributes, 'msclkid') is not null)::integer
    + (commerce.shopify_attribute_value(custom_attributes, 'dclid') is not null)::integer
  ) as match_signal_count,
  case
    when commerce.shopify_attribute_value(custom_attributes, '_ga_client_id') is null
      then 'missing_ga_client_id'
    when commerce.shopify_attribute_value(custom_attributes, '_fbp') is null
      and commerce.shopify_attribute_value(custom_attributes, '_fbc') is null
      then 'missing_meta_browser_ids'
    when commerce.shopify_attribute_value(custom_attributes, 'gclid') is null
      and commerce.shopify_attribute_value(custom_attributes, 'gbraid') is null
      and commerce.shopify_attribute_value(custom_attributes, 'wbraid') is null
      and commerce.shopify_attribute_value(custom_attributes, 'msclkid') is null
      then 'missing_paid_click_id'
    else 'ready_for_provider_repair'
  end as primary_attribution_gap,
  customer_journey_summary #>> '{firstVisit,source}' as first_visit_source,
  customer_journey_summary #>> '{lastVisit,source}' as last_visit_source,
  customer_journey_summary #>> '{lastVisit,utmParameters,campaign}' as last_visit_utm_campaign,
  synced_at
from commerce.shopify_order_snapshots;

alter table commerce.shopify_graphql_requests enable row level security;
alter table commerce.shopify_order_snapshots enable row level security;
alter table commerce.shopify_order_line_items enable row level security;

revoke all on schema commerce from public, anon, authenticated;
grant usage on schema commerce to service_role;

revoke all on all tables in schema commerce from public, anon, authenticated;
grant select, insert, update, delete on all tables in schema commerce to service_role;

revoke all on all functions in schema commerce from public, anon, authenticated;
grant execute on all functions in schema commerce to service_role;
