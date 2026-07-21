# CanonicalEvent Current Handoff

**Handoff-versjon:** 1.11.0 **Oppdatert:**
2026-07-21T17:40:00+02:00 **Gyldighet:** Verifiser Git-,
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
- ACCEPTED CE-2.3A-F1 tip: se `git rev-parse HEAD` after this
  status commit
- Accepted runtime SHA:
  `59c130c2ee9c93c3f62332fa03763d27e5168b05`
- lokale docs-commits **ikke pushet**
- produksjonsdeploy: `dpl_ETtmNLjSG4vjUSj1owVEUmhScEw1` READY

## 3. CE-2.2B / DEC-012 — ACCEPTED

```text
Purchase:
SHOP_ADMIN_NOTIFICATION_WEBHOOK_PLUS_RECONCILIATION

Refund:
SHOP_ADMIN_NOTIFICATION_WEBHOOK_PLUS_RECONCILIATION

DEC-012: APPROVED (ACCEPTED 2026-07-21)
Commit: b445e9f8c
Verifier: APPROVE
```

Authoritative live sources are Shopify Admin notification
webhooks signed with existing `SHOPIFY_WEBHOOK_SECRET`.

## 4. CE-2.3A / CE-2.3A-F1 — ACCEPTED

```text
CE-2.3A-F1: ACCEPTED
Conclusion: REFUND_2026_04_COMPATIBILITY_FIXED
Accepted runtime SHA: 59c130c2e
STOP_REFUND_2026_04_PAYLOAD_INCOMPATIBLE: CLOSED
STOP_ACTIVE_DOUBLE_COUNT_RISK: fortsatt ACTIVE
```

Prior CE-2.3A (unchanged technical base):

```text
Conclusion: SUBSCRIPTIONS_ESTABLISHED_WITH_PAYLOAD_BLOCKER
Evidence: docs/analytics/evidence/ce-2.3a-notification-webhook-post-mutation-verification.md
orders-paid: active + production-proven
refunds-create: active subscription
Both: JSON + Webhook API 2026-04 + same SHOPIFY_WEBHOOK_SECRET
```

## 5. Prior decisions

- CE-2.2 ACCEPTED (app-specific) — superseded for implementation
- CE-2.2A / DEC-011 — `SUPERSEDED_BY_DEC-012`
- Mode A toml: `NOT_APPLICABLE`
- Mode B GraphQL create: `FORBIDDEN` for these topics

## 6. Interlocks / blockers (still active)

```text
STOP_ACTIVE_DOUBLE_COUNT_RISK
SAFE-001 / DEV-018
SAFE-002
SAFE-003
```

Closed:

```text
STOP_REFUND_2026_04_PAYLOAD_INCOMPATIBLE
```

## 7. Rekkefølge

```text
CE-2.2B / DEC-012 ACCEPTED ✓
CE-2.3A ACCEPTED_WITH_PAYLOAD_BLOCKER ✓
CE-2.3A-F1 ACCEPTED ✓
CE-2.3B — next authorized task (expected parent = this status tip)
```

## 8. Ingen autorisasjon uten ny startordre

- push/deploy
- Shopify Admin mutation
- GraphQL webhookSubscriptionCreate/Update for these topics
- CE-2.3C without CE-2.3B owner acceptance

## 9. Dokumentasjonsstatus

- CE-2.3A-F1 er eiergodkjent og statusregistrert
- CE-2.3B er neste autoriserte task
- `STOP_ACTIVE_DOUBLE_COUNT_RISK` forblir ACTIVE
