revoke execute on function analytics.archive_event_ledger_batch(integer)
  from public, anon, authenticated;

grant execute on function analytics.archive_event_ledger_batch(integer)
  to service_role;
