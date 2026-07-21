# CanonicalEvent Current Handoff

**Handoff-versjon:** 1.5.0 **Oppdatert:**
2026-07-21T15:45:25+02:00 **Gyldighet:** Verifiser Git-,
deployment- og livefakta før enhver handling

## 1. Les først

1. `AGENTS.md`
2. `FLOW.md`, `DEPLOYMENT.md`, `PLAN.md` og øvrige obligatoriske
   rotfiler
3. `docs/analytics/program-charter.md`
4. `docs/analytics/roadmap.md`
5. dette dokumentet
6. den konkrete autoritative task-filen

Task-filer under `docs/analytics/tasks/` er autoritative.

## 2. Git- og produksjonsstatus

- `origin/main`: `0a800b1ae169eab8af12c21b3595fe99a667d54c`
- lokal `main` tip: `2c0c3c6fd67dc9a4098fac71c8f20d7046828f2e`
  (før ACCEPTED-statuscommit)
- lokal `main`: **9 commits ahead of `origin/main`** (docs-only;
  ikke pushet)
- produksjons-SHA: `0a800b1ae169eab8af12c21b3595fe99a667d54c`
- produksjonsdeploy: `dpl_ETtmNLjSG4vjUSj1owVEUmhScEw1` **READY**
- rollback-SHA: `ee781aed52474eb6bdecee63e43ffabec9d0cea2`

## 3. CE-2.2 — ACCEPTED

```text
ACCEPTED @ 2c0c3c6fd67dc9a4098fac71c8f20d7046828f2e
ADR-0006 / DEC-010
purchase: APP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION
refund:   APP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION
conclusion: APPROVED_WITH_PRECONDITIONS
```

`STOP_ACTIVE_DOUBLE_COUNT_RISK` forblir aktiv interlock.

## 4. CE-2.1 / CE-GOV-001A / Phase 1 — ACCEPTED

Uendret. Se tidligere handoff-seksjoner i git-historikk ved
behov.

## 5. CE-2.3A — START BLOKKERT (fail-closed)

Task:

```text
docs/analytics/tasks/
CE-2.3A-establish-selected-shopify-webhook-subscriptions.md
```

Mode fra ADR-0006: **Mode A**
(`APP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION`).

Tillatt fil: `shopify.app.toml` only.

### Stop conclusion

```text
STOP_WRONG_APP_OR_SHOP
```

(alternativt/samtidig: mangler frigitt produksjons-app-config)

Begrunnelse (CE-2.1 + repo preflight 2026-07-21):

- `shopify.app.toml` **finnes ikke** i repository
- task Mode A: _Stop if shopify.app.toml is not the released
  production app configuration_
- Partner/released app version forblir **UNKNOWN** (SAFE-002)
- Live `orders-paid` leveres allerede fra ukjent app-specific
  eier — å opprette en ny toml uten bevist released config
  risikerer duplikat-subscriptions
  (`STOP_DUPLICATE_SUBSCRIPTIONS`)

### Ikke gjort

- ingen `shopify.app.toml` opprettet
- ingen Shopify mutation
- ingen `shopify app deploy`
- CE-2.3B / CE-2.3C ikke startet

### Eier må levere før CE-2.3A kan fortsette

1. Identitet for den **frigitte** produksjonsappen som allerede
   leverer (eller skal eie) `orders/paid` / `refunds/create` (app
   name/gid, client_id, shop).
2. Eksisterende Partner/CLI `shopify.app.toml` (eller eksplisitt
   godkjenning til å bootstrap en ny toml som _blir_ released
   config).
3. Godkjent webhook `api_version` (ADR peker ikke eksplisitt;
   CE-2.1 Admin-lesninger brukte `2025-07`).
4. Eksplisitt godkjenning i handoff for:
   - toml-commit
   - senere `shopify app deploy` / subscription mutation
5. Bekreftelse på at vi ikke lager parallell subscription mot
   samme URI fra en annen app.

Expected parent når CE-2.3A gjenopptas: lokal tip etter ACCEPTED-
statuscommit (kjør `git rev-parse HEAD`).

## 6. Aktive interlocks

- SAFE-001 / DEV-018
- SAFE-002 (uendret — app owner unproven)
- SAFE-003
- `STOP_ACTIVE_DOUBLE_COUNT_RISK`

## 7. Rekkefølge

```text
CE-2.3A  ← BLOKKERT til eier leverer app-config/mutation-godkjenning
CE-2.3B
CE-2.3C
CE-2.4 …
```

## 8. Ingen autorisasjon

- push/deploy
- Shopify subscription create/update/delete
- `shopify app deploy`
- bootstrap av `shopify.app.toml` uten punktene i §5
- CE-2.3B/C

## 9. Dokumentasjonsstatus

- CE-2.2: **ACCEPTED**
- CE-2.3A: autorisert å starte, men **fail-closed stop** på
  manglende released `shopify.app.toml` / app-identitet
- nok docs til å stanse korrekt; ikke nok til Mode
  A-implementasjon
