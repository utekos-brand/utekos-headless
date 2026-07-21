# CanonicalEvent Current Handoff

**Handoff-versjon:** 1.4.0 **Oppdatert:**
2026-07-21T10:05:00+02:00 **Gyldighet:** Verifiser Git-,
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
Chatmeldinger skal ikke overstyre taskens mål, avgrensning,
tillatte filer, start-SHA eller stop conditions.

## 2. Git- og produksjonsstatus ved overlevering

Følgende status er rapportert under CE-2.2 docs-only owner
decision (før verifier/owner ACCEPTED av denne committen):

- `origin/main`: `0a800b1ae169eab8af12c21b3595fe99a667d54c`
- forventet parent for CE-2.2:
  `9923c5adea249eb3e2d88bfa0856569ef4be1cb4`
- CE-2.2 worktree tip: se `git rev-parse HEAD` etter commit
- lokale evidens-/governance-commits er **ikke pushet**
- produksjons-SHA: `0a800b1ae169eab8af12c21b3595fe99a667d54c`
- produksjonsdeploy: `dpl_ETtmNLjSG4vjUSj1owVEUmhScEw1`
- produksjonsstatus: **READY**
- produksjonsaliaser:

  - `utekos.no`
  - `www.utekos.no`
  - `feed.utekos.no`

- rollback-SHA før fase-1-deploy:
  `ee781aed52474eb6bdecee63e43ffabec9d0cea2`

Kjør før enhver handling:

```bash
git fetch origin
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
git rev-list --left-right --count origin/main...HEAD
git log --oneline --decorate -8
git worktree list --porcelain
```

Stopp dersom lokal HEAD ikke er forventet parent, `origin/main`
har beveget seg, eller en annen worktree eier samme filer.

## 3. CE-1.6B / CE-1.6C / Phase 1 — ACCEPTED

Fase 1 er eiergodkjent
(`PHASE_1_ACCEPTED_WITH_NONBLOCKING_OBSERVATIONS`).
Produksjonsdeploy forblir `0a800b1ae…` /
`dpl_ETtmNLjSG4vjUSj1owVEUmhScEw1`.

## 4. CE-2.1 — ACCEPTED

```text
ACCEPTED @ 95e8d38090e97e4aa0fe08def47d8be01173d8a2
purchase: MULTIPLE_SOURCES
refund: NO_SOURCE
program: STOP_ACTIVE_DOUBLE_COUNT_RISK
```

Evidens:

```text
docs/analytics/evidence/
ce-2.1-shopify-commerce-delivery-source-inventory.md
```

## 5. CE-GOV-001A — ACCEPTED

```text
ACCEPTED @ 9923c5adea249eb3e2d88bfa0856569ef4be1cb4
ADR target: 0006
Decision target: DEC-010
```

Kun CE-2.2-taskfilen ble renummerert. Ingen owner-ADR ble skrevet
i CE-GOV-001A.

## 6. CE-2.2 — docs decision; venter verifier + eier-ACCEPTED

Worktree: `.worktrees/ce-2.2-purchase-refund-owners`

Foreslått beslutning (ADR-0006 / DEC-010):

```text
purchase: APP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION
refund:   APP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION
conclusion: APPROVED_WITH_PRECONDITIONS
```

Tillatte filer i CE-2.2-commit:

```text
docs/analytics/adr/0006-purchase-refund-authoritative-owners.md
docs/analytics/decision-log.md
docs/analytics/current-handoff.md
```

`STOP_ACTIVE_DOUBLE_COUNT_RISK` forblir aktiv interlock til
purchase cutover + replay containment. Det er hovedproblemet
beslutningen binder cutover for — ikke en stans av CE-2.2.

## 7. Aktive avvik og interlocks

- SAFE-001 / DEV-018 — Meta purchase replay / distinct event_ids
- SAFE-002 — Shopify app-specific owner unproven until CE-2.3A
- SAFE-003 — Google native ads owner unknown
- `STOP_ACTIVE_DOUBLE_COUNT_RISK` — webhook ∩ server overlaps

## 8. Nåværende rekkefølge

```text
CE-2.2
→ fresh verifier
→ owner acceptance  ← HER etter denne committen

CE-2.3A
→ explicit owner start only after CE-2.2 ACCEPTED
```

Ingen agent fortsetter automatisk til CE-2.3A.

## 9. Push-status

Lokale CE-1.6C / CE-2.1 / CE-GOV-001A / CE-2.2 docs-commits skal
ikke pushes isolert uten eksplisitt eierinstruks (docs-only
redeploy-risiko).

## 10. Ingen autorisasjon

Denne handoffen gir ikke godkjenning til:

- push eller produksjonsdeploy;
- Shopify subscription-opprettelse/-endring;
- runtime/schema/env-endring;
- replay, backfill, resend;
- GTM/provider/campaign-mutasjon;
- oppstart av CE-2.3A før CE-2.2 er eiergodkjent.

## 11. Neste agentinstruks

1. Fresh verifier av CE-2.2-commit (kun de tre tillatte filene).
2. Eier-ACCEPTED av ADR-0006 / DEC-010.
3. Deretter eksplisitt eierordre for CE-2.3A.

## 12. Dokumentasjonsstatus

- CE-2.1: ACCEPTED
- CE-GOV-001A: ACCEPTED @ `9923c5ade`
- CE-2.2: foreslått docs-pakke; venter verifier + eier-ACCEPTED
- CE-2.3A: ikke startet
- remote baseline: `0a800b1ae169eab8af12c21b3595fe99a667d54c`
