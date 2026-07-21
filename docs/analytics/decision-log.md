# CanonicalEvent Decision Log

**Format:** append-only  
**Regel:** eksisterende beslutningstekst omskrives ikke. Feil
eller endring får ny oppføring som refererer den gamle.

## Statusverdier

- `PROPOSED`
- `APPROVED`
- `REJECTED`
- `SUPERSEDED_BY_<ID>`
- `INCIDENT_CONTAINMENT`

## DEC-001 — Én canonical pipeline og én generisk provider-outbox

- **Dato:** 2026-07-20
- **Status:** `APPROVED_BASELINE`
- **Berører:** INV-001, INV-005, INV-006, INV-007, INV-017
- **Beslutning:** Behold og fullfør eksisterende canonical
  ledger/outbox og generisk providerregistry. Nye events skal
  ikke få egne stores, queues eller crons uten providerkrav.
- **Alternativer vurdert:** per-event/per-provider pipelines;
  direkte providersend i route handler; ekstern queue i stedet
  for Postgres outbox.
- **Begrunnelse:** atomisk persistence, idempotent retry, felles
  operasjonell modell, mindre duplisering og enklere
  event/providerutvidelse.
- **Konsekvens:** streng eventCatalog, typed mapping,
  transaksjonsgrense, migrations og observability er sentrale.
- **Detalj:** ADR-0001.

## DEC-002 — Governance control plane med eksplisitt endringskontroll

- **Dato:** 2026-07-20
- **Status:** `PROPOSED_FOR_OWNER_APPROVAL`
- **Berører:** INV-020, INV-021, INV-022
- **Beslutning:** Charter, roadmap, decision log, machine state
  og handoff får forskjellige roller. Charteret endres kun etter
  change request.
- **Begrunnelse:** `PLAN.md` og `FLOW.md` er verdifulle, men
  blander historikk, mål og volatile produksjonsfakta. Et
  komprimert kontekstvindu må kunne rekonstruere oppdraget uten
  chat.
- **Konsekvens:** alle analyticsoppgaver får governance header og
  sluttrapport; roadmap oppdateres kun etter godkjent resultat.
- **Detalj:** ADR-0002.

## DEC-003 — Cron-only som første dispatch-isolasjonsmodus

- **Dato:** 2026-07-20
- **Status:** `APPROVED_FOR_PHASE_1`
- **Berører:** INV-007, INV-008, INV-018
- **Beslutning:** Fjern global registry-drain fra browser/webhook
  request path. Eksisterende cron eier dispatch under
  stabilisering.
- **Alternativ:** targeted immediate dispatch av attempt-ID-ene
  opprettet i transaksjonen.
- **Begrunnelse:** minste reversible endring uten
  schema-/storeendring; eksisterende femminutters cron er
  verifisert. Targeted mode vurderes bare dersom målt latency/SLO
  krever det.
- **Konsekvens:** requesten gjør kun validate + atomic accept.
  Queue capacity og event-to-provider latency må
  produksjonsmåles.
- **Detalj:** ADR-0003.

## DEC-004 — Cursor er defense-in-depth, ikke eneste kontrollplan

- **Dato:** 2026-07-20
- **Status:** `PROPOSED_FOR_OWNER_APPROVAL`
- **Berører:** INV-020, INV-022
- **Beslutning:** `.cursor/rules` auto-attacher styringskontekst
  og `.cursor/agents` tilbyr smale roller. Root `AGENTS.md` og
  committede docs er alltid fallback.
- **Begrunnelse:** regler/subagents forbedrer kontekststyring,
  men funksjon og tilgjengelighet kan variere mellom
  Cursor-versjoner, modus og miljø.
- **Konsekvens:** alle subagentprompts kan kjøres manuelt;
  manglende Task-tool er aldri tillatelse til å hoppe over gates.
- **Detalj:** ADR-0002 og `cursor-operating-model.md`.

## DEC-005 — Én write-agent per aktiv mikrooppgave

- **Dato:** 2026-07-20
- **Status:** `PROPOSED_FOR_OWNER_APPROVAL`
- **Berører:** INV-022
- **Beslutning:** Read-only research kan parallelliseres; bare én
  agent kan endre den aktive taskens branch/worktree og tillatte
  filer.
- **Begrunnelse:** parallelle skrivere skaper skjult scope drift,
  konflikter og vanskelig evidens/review.
- **Konsekvens:** implementer, verifier og release auditor er
  separate roller.

## DEC-006 — Meta purchase replay er fail-closed

- **Dato:** 2026-07-20
- **Status:** `INCIDENT_CONTAINMENT`
- **Berører:** INV-003, INV-013, INV-015, INV-019
- **Funn:** kjent backfill bruker nye event-ID-er for
  eksisterende purchases.
- **Beslutning:** Ingen merge/execution/provider write før
  replaykontrakten bevarer original/deterministisk event identity
  og bounded dry-run er bevist.
- **Konsekvens:** SAFE-001 gjelder uavhengig av
  roadmaprekkefølge.

## DEC-007 — Shopify webhookroute er ikke lik produksjonsowner

- **Dato:** 2026-07-20
- **Status:** `APPROVED_EVIDENCE_CLASSIFICATION`
- **Berører:** INV-002, INV-019
- **Funn:** inspected app-tokenets app har ingen webhook
  subscriptions, mens purchase finnes via browserroute/backfill.
- **Beslutning:** `purchase`/`refund` beskrives ikke som
  webhook-eid før source, subscription og delivery er bevist
  eller alternativ owner vedtas.
- **Konsekvens:** SAFE-002 og fase 2.

## DEC-008 — CE-1.4C7 allowlist includes optional specialized-handler deps

- **Dato:** 2026-07-21
- **Status:** `APPROVED`
- **Berører:** INV-007, INV-008, INV-021, INV-022; task CE-1.4C7
- **Tidligere beslutning, hvis relevant:** CE-1.4B made shared
  factory `runBatch?`/`scheduleAfter?` optional; CE-1.4C1–C4 left
  specialized handler dependency fields required while runtime
  became collect-only.
- **Nytt funn og primærevidens:** Route-only CE-1.4C7 cannot
  typecheck while specialized handler types still require
  `runBatch`/`scheduleAfter`.
- **Beslutning:** Expand CE-1.4C7 allowlist to the four
  specialized handlers solely to mark those fields optional.
  Runtime remains collect-only. Shared factory, generator, tests,
  docs and providers stay out of scope. Owner direction
  2026-07-21: proceed with the correct unblock.
- **Alternativer:** separate microtask for handler types; keep
  dead required fields and block CE-1.4C7; cast in routes.
- **Begrunnelse:** matches factory pattern; enables the
  documented collect-only route call without behavioral change.
- **Konsekvens for roadmap/DoD:** CE-1.4C7 may complete; CE-1.4E
  still waits on CE-1.4C + CE-1.4C7 + CE-1.4D acceptance.
- **Godkjent av:** Prosjekteier (explicit
  proceed-with-correct-fix).

## DEC-010 — Authoritative Purchase and Refund owners

- **Dato:** 2026-07-21
- **Status:** `PROPOSED_FOR_OWNER_APPROVAL`
- **Berører:** INV-001, INV-002, INV-003, INV-010, INV-014,
  INV-015, INV-017, INV-020, INV-021; SAFE-001, SAFE-002,
  DEV-018; `STOP_ACTIVE_DOUBLE_COUNT_RISK`
- **Tidligere beslutning, hvis relevant:** DEC-006 (Meta purchase
  replay fail-closed); DEC-007 (webhookroute ≠ produksjonsowner);
  CE-2.1 ACCEPTED (`MULTIPLE_SOURCES` / `NO_SOURCE` /
  `STOP_ACTIVE_DOUBLE_COUNT_RISK`); CE-GOV-001A ACCEPTED (ADR
  `0006` / DEC-010-nummerering).
- **Nytt funn og primærevidens:** CE-2.1 inventory —
  shop-specific subscriptions = 0; live `orders-paid` HTTP;
  ledger purchase fra webhook/server/ops_backfill; tre
  `transaction_id`-overlapp med distinct `event_id`; refund = 0.
- **Beslutning:**
  - purchase: `APP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION`
  - refund: `APP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION`
  - ADR-konklusjon: `APPROVED_WITH_PRECONDITIONS`
  - Detaljer:
    `docs/analytics/adr/0006-purchase-refund-authoritative-owners.md`
- **Alternativer:** `SHOP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION`
  (avvist — 0 shop-specific, live app-path);
  `RECONCILIATION_ONLY` (avvist som eneste owner);
  `TEMPORARY_COMPATIBILITY_SOURCE_WITH_CUTOVER` (avvist som varig
  owner — aktiv double-count-vektor).
- **Begrunnelse:** målarkitektur krever verified Shopify
  delivery; live trafikk peker på app-specific path;
  reconciliation dekker missede deliveries; server/ops_backfill
  som konkurrerende owners må fryses til CE-2.6-kontrakt.
- **Konsekvens for roadmap/DoD:** etter eier-ACCEPTED kan CE-2.3A
  starte; `STOP_ACTIVE_DOUBLE_COUNT_RISK` forblir interlock til
  purchase cutover + replay containment; ingen runtime/Shopify-
  mutasjon i denne beslutningen.
- **Godkjent av:** _pending owner ACCEPTED_

## Mal for ny beslutning

```text
## DEC-NNN — Tittel

- Dato:
- Status:
- Berører:
- Tidligere beslutning, hvis relevant:
- Nytt funn og primærevidens:
- Beslutning:
- Alternativer:
- Begrunnelse:
- Konsekvens for roadmap/DoD:
- Godkjent av:
```
