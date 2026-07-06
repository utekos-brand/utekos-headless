create schema if not exists marketing;
create schema if not exists partner;
create schema if not exists ops;

comment on schema marketing is 'Utekos marketing, leads, campaign and consent data.';
comment on schema partner is 'Utekos partner attribution and partner-specific flows.';
comment on schema ops is 'Operational logs, integration events and internal audit data.';