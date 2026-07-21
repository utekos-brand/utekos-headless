# CanonicalEvent Current Handoff

**Handoff-versjon:** 1.9.0 **Oppdatert:**
2026-07-21T17:20:00+02:00 **Gyldighet:** Verifiser Git-,
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
- expected parent for this CE-2.2B amend:
  `0787af63a25fe71375b555854e8384743c9020f5`
- tip: se `git rev-parse HEAD` after commit
- lokale docs-commits **ikke pushet**
- produksjonsdeploy: `dpl_ETtmNLjSG4vjUSj1owVEUmhScEw1` READY

## 3. CE-2.2B — awaiting owner ACCEPTED (DEC-012)

```text
Purchase:
SHOP_ADMIN_NOTIFICATION_WEBHOOK_PLUS_RECONCILIATION

Refund:
SHOP_ADMIN_NOTIFICATION_WEBHOOK_PLUS_RECONCILIATION

DEC-012 — Shopify Admin notification webhooks own Purchase and Refund
Status: PROPOSED_FOR_OWNER_APPROVAL
```

Live destinations (owner-created; CE-2.3A verified):

```text
Order payment → /api/shopify/webhooks/orders-paid
Refund create → /api/shopify/webhooks/refunds-create
JSON + Webhook API 2026-04 + SHOPIFY_WEBHOOK_SECRET
```

Not owned by `webhookSubscriptionCreate`, `shopify.app.toml`, or
`shopify app deploy`. Utekos Storefront Admin token is for
reconciliation/identity — not notification-webhook ownership.

## 4. CE-2.3A — VERIFIED_AWAITING_GOVERNANCE_ACCEPTANCE

```text
Technical conclusion: SUBSCRIPTIONS_ESTABLISHED_WITH_PAYLOAD_BLOCKER
Evidence: docs/analytics/evidence/ce-2.3a-notification-webhook-post-mutation-verification.md
Verifier: APPROVE
orders-paid: live + technically verified
refunds-create: live subscription; accept path schema-blocked
```

## 5. Prior decisions

- CE-2.2 ACCEPTED (app-specific) — superseded for implementation
- CE-2.2A / DEC-011 — `SUPERSEDED_BY_DEC-012`
- Mode A toml: `NOT_APPLICABLE`
- Mode B GraphQL create: `FORBIDDEN` for these topics

## 6. Interlocks / blockers

```text
STOP_ACTIVE_DOUBLE_COUNT_RISK
STOP_REFUND_2026_04_PAYLOAD_INCOMPATIBLE
SAFE-001 / DEV-018
SAFE-002
SAFE-003
```

## 7. Rekkefølge

```text
CE-2.2B / DEC-012 owner ACCEPTED  ← HER
CE-2.3A governance ACCEPTED (optional after DEC-012)
Refund schema remediation — separate start order only
CE-2.3B — separate start order only
```

## 8. Ingen autorisasjon

- Shopify Admin UI mutation
- GraphQL webhookSubscriptionCreate/Update for these topics
- replacing SHOPIFY_WEBHOOK_SECRET with app API secret
- runtime / refund schema code changes in this task
- push/deploy
- CE-2.3B / schema fix without new start order

## 9. Dokumentasjonsstatus

- Nok til CE-2.2B / DEC-012 eiergodkjenning
- CE-2.3A teknisk verifisert; governance ACCEPTED venter på
  DEC-012
- Ikke nok til CE-2.3B eller schema-fiks
