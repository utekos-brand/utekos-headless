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
  from net._http_collect_response(v_request.pg_net_request_id, async := p_async)
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

revoke all on function commerce.collect_shopify_graphql_response(uuid, boolean, boolean)
  from public, anon, authenticated;
grant execute on function commerce.collect_shopify_graphql_response(uuid, boolean, boolean)
  to service_role;
