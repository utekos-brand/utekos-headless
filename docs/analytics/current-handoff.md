# CanonicalEvent Current Handoff

**Handoff-versjon:** 1.6.0 **Oppdatert:**
2026-07-21T16:04:12+02:00 **Gyldighet:** Verifiser Git-,
deployment- og livefakta før enhver handling

## 1. Les først

1. `AGENTS.md`
2. `FLOW.md`, `DEPLOYMENT.md`, `PLAN.md` og øvrige obligatoriske
   rotfiler
3. `docs/analytics/program-charter.md`
4. `docs/analytics/roadmap.md`
5. dette dokumentet
6. den konkrete autoritative task-filen

## 2. Git- og produksjonsstatus

- `origin/main`: `0a800b1ae169eab8af12c21b3595fe99a667d54c`
- expected parent for CE-2.2A:
  `96b1ac84f83d36bcc0c5d72c8d5b2d226d42527d`
- CE-2.2A tip: se `git rev-parse HEAD` etter commit
- lokale docs-commits er **ikke pushet**
- produksjonsdeploy: `dpl_ETtmNLjSG4vjUSj1owVEUmhScEw1` **READY**
  @ `0a800b1ae…`

## 3. CE-2.2 — ACCEPTED (owner model amended by CE-2.2A)

```text
ACCEPTED @ 2c0c3c6fd67dc9a4098fac71c8f20d7046828f2e
```

Original DEC-010 chose app-specific; **CE-2.2A** amends to
shop-specific for the custom Admin app.

## 4. CE-2.2A — amend in progress (this commit)

```text
purchase: SHOP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION
refund:   SHOP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION
Mode A:   NOT_APPLICABLE
Mode B:   REQUIRED (GraphQL webhookSubscriptionCreate/Update)
DEC-011:  PROPOSED_FOR_OWNER_APPROVAL
```

Production app fact:

```text
App: Utekos Storefront (custom Admin app)
Shop domain: erling-7921.myshopify.com
```

No webhook subscriptions created in CE-2.2A. No Mode B start.

## 5. CE-2.3A — awaiting CE-2.2A ACCEPTED; then Mode B only

Previous Mode A block (`STOP_WRONG_APP_OR_SHOP` / missing toml)
is explained by app class: Mode A is now `NOT_APPLICABLE`.

After CE-2.2A ACCEPTED, CE-2.3A may implement Mode B scripts —
still **without** mutation until explicit owner mutation approval
and identity match:

```text
app.title = Utekos Storefront
shop.myshopifyDomain = erling-7921.myshopify.com
```

## 6. Aktive interlocks

- SAFE-001 / DEV-018
- SAFE-002 (subscription not yet established under amended model)
- SAFE-003
- `STOP_ACTIVE_DOUBLE_COUNT_RISK`

## 7. Rekkefølge

```text
CE-2.2A
→ fresh verifier
→ owner ACCEPTED  ← HER

CE-2.3A Mode B (script commit)
→ verifier
→ owner ACCEPTED
→ separate explicit mutation approval
```

## 8. Ingen autorisasjon

- Shopify subscription create/update/delete
- `shopify.app.toml` / `shopify app deploy`
- push/deploy
- automatic Mode B start or mutation after this amend

## 9. Dokumentasjonsstatus

- CE-2.2A docs amend ready for verifier + owner ACCEPTED
- nok til å rette owner-modellen; ikke nok til å mutere Shopify
