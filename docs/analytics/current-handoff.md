# CanonicalEvent Current Handoff

**Handoff-versjon:** 1.8.0 **Oppdatert:**
2026-07-21T16:40:00+02:00 **Gyldighet:** Verifiser Git-,
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
- tip før CE-2.3A evidence: `6d60c8e4c5cc5edf164b4de691f05907defa42e2`
- lokale docs-commits **ikke pushet**
- produksjonsdeploy: `dpl_ETtmNLjSG4vjUSj1owVEUmhScEw1` READY

## 3. CE-2.2B — awaiting owner ACCEPTED

```text
purchase: SHOP_ADMIN_NOTIFICATION_WEBHOOK_PLUS_RECONCILIATION
refund:   SHOP_ADMIN_NOTIFICATION_WEBHOOK_PLUS_RECONCILIATION
DEC-012:  PROPOSED_FOR_OWNER_APPROVAL
```

## 4. CE-2.3A — evidence complete (not ACCEPTED)

Owner manually created both Admin notification webhooks. Agent ran
**read-only** post-mutation verification.

```text
Conclusion: SUBSCRIPTIONS_ESTABLISHED_WITH_PAYLOAD_BLOCKER
Evidence: docs/analytics/evidence/ce-2.3a-notification-webhook-post-mutation-verification.md
```

Blockers for final ACCEPTED:

```text
CE-2.2B / DEC-012 owner ACCEPTED
CE-2.3A evidence verifier APPROVE
Refund 2026-04 payload schema remediation (later code task)
```

## 5. Prior decisions

- CE-2.2 ACCEPTED (app-specific) — superseded for implementation
- CE-2.2A — superseded by CE-2.2B / DEC-012
- Mode A toml: `NOT_APPLICABLE`
- Mode B GraphQL create: `FORBIDDEN` for orders-paid/refunds-create

## 6. Interlocks

- SAFE-001 / DEV-018
- SAFE-002 (refund subscription attested; accept path payload-blocked)
- SAFE-003
- `STOP_ACTIVE_DOUBLE_COUNT_RISK`

## 7. Rekkefølge

```text
CE-2.2B owner ACCEPTED  ← still required
CE-2.3A evidence verifier → owner review (no ACCEPTED yet)
CE-2.3B only after explicit start order
```

## 8. Ingen autorisasjon

- Shopify Admin UI mutation
- GraphQL webhookSubscriptionCreate/Update for these topics
- replacing SHOPIFY_WEBHOOK_SECRET with app API secret
- push/deploy
- CE-2.3B / schema fix without new start order

## 9. Dokumentasjonsstatus

- Nok evidens til CE-2.3A teknisk konklusjon
- Ikke nok til CE-2.3A ACCEPTED før CE-2.2B/DEC-012 ACCEPTED
  + verifier APPROVE
