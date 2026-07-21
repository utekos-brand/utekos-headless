# CanonicalEvent Current Handoff

**Handoff-versjon:** 1.7.0 **Oppdatert:**
2026-07-21T16:25:01+02:00 **Gyldighet:** Verifiser Git-,
deployment- og livefakta før enhver handling

## 1. Les først

1. `AGENTS.md`
2. `FLOW.md`, `DEPLOYMENT.md`, `PLAN.md`
3. `docs/analytics/program-charter.md`
4. `docs/analytics/roadmap.md`
5. dette dokumentet
6. den konkrete autoritative task-filen

## 2. Git- og produksjonsstatus

- `origin/main`: `0a800b1ae169eab8af12c21b3595fe99a667d54c`
- expected parent for CE-2.2B:
  `998a22efd414309e1cb1187535cebc0768c9dac9`
- tip etter CE-2.2B: se `git rev-parse HEAD`
- lokale docs-commits **ikke pushet**
- produksjonsdeploy: `dpl_ETtmNLjSG4vjUSj1owVEUmhScEw1` READY

## 3. CE-2.2B — amend in progress

```text
purchase: SHOP_ADMIN_NOTIFICATION_WEBHOOK_PLUS_RECONCILIATION
refund:   SHOP_ADMIN_NOTIFICATION_WEBHOOK_PLUS_RECONCILIATION
DEC-012:  PROPOSED_FOR_OWNER_APPROVAL
```

Verified live purchase webhook:

```text
Admin → Settings → Notifications → Webhooks
Order payment → https://utekos.no/api/shopify/webhooks/orders-paid
JSON + shop notification secret → SHOPIFY_WEBHOOK_SECRET
```

Not visible in Admin API `webhookSubscriptions`. GraphQL create
for these topics is **FORBIDDEN**.

## 4. Prior decisions

- CE-2.2 ACCEPTED (app-specific) — superseded for implementation
- CE-2.2A (shop-specific GraphQL) — superseded by CE-2.2B /
  DEC-012
- Mode A toml: `NOT_APPLICABLE`
- Mode B GraphQL create: `FORBIDDEN` for
  orders-paid/refunds-create

## 5. CE-2.3A after CE-2.2B ACCEPTED

```text
orders-paid: verify only
refunds-create: plan manual Admin UI create (separate approval)
no automatic refund webhook creation
```

## 6. Interlocks

- SAFE-001 / DEV-018
- SAFE-002 (refund notification not yet established; purchase
  management surface now identified)
- SAFE-003
- `STOP_ACTIVE_DOUBLE_COUNT_RISK`

## 7. Rekkefølge

```text
CE-2.2B → verifier → owner ACCEPTED  ← HER
CE-2.3A verify/plan → … (no GraphQL create)
```

## 8. Ingen autorisasjon

- Shopify Admin UI mutation
- GraphQL webhookSubscriptionCreate/Update for these topics
- replacing SHOPIFY_WEBHOOK_SECRET with app API secret
- push/deploy
- automatic Mode B / refund webhook creation

## 9. Dokumentasjonsstatus

- CE-2.2B docs amend ready for verifier + owner ACCEPTED
- nok til å rette owner-modellen; ikke nok til Shopify-mutasjon
