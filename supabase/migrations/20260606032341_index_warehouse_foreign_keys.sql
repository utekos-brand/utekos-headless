create index if not exists attribution_events_lead_id_idx
  on marketing.attribution_events (lead_id)
  where lead_id is not null;

create index if not exists partner_referrals_partner_source_id_idx
  on partner.referrals (partner_source_id)
  where partner_source_id is not null;
