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
- **Status:** `APPROVED` (owner-model portion amended by DEC-011
  then DEC-012 / CE-2.2B — pending ACCEPTED of DEC-012)
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
- **Konsekvens for roadmap/DoD:** CE-2.3A er neste; forblir
  fail-closed til released `shopify.app.toml` / app-identitet og
  eksplisitt Shopify mutation-godkjenning finnes.
  `STOP_ACTIVE_DOUBLE_COUNT_RISK` forblir interlock til purchase
  cutover + replay containment.
- **Godkjent av:** Prosjekteier (ACCEPTED 2026-07-21).

## DEC-011 — Amend DEC-010: shop-specific webhook owner for custom Admin app

- **Dato:** 2026-07-21
- **Status:** `SUPERSEDED_BY_DEC-012` (CE-2.2B)
- **Berører:** INV-002, INV-019, INV-021; SAFE-002; CE-2.2A;
  CE-2.3A Mode B; DEC-010
- **Tidligere beslutning, hvis relevant:** DEC-010 ACCEPTED
  valgte `APP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION` for
  purchase/refund.
- **Nytt funn og primærevidens:** Eier bekreftet produksjonsappen
  **Utekos Storefront** som custom app opprettet i Shopify Admin
  for shop `erling-7921.myshopify.com`. Slike apper kan ikke
  bruke `shopify.app.toml` / `shopify app deploy` for webhook-
  abonnementer. CE-2.3A Mode A stoppet korrekt med
  `STOP_WRONG_APP_OR_SHOP` fordi toml mangler.
- **Beslutning:**
  - purchase: `SHOP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION`
  - refund: `SHOP_SPECIFIC_WEBHOOK_PLUS_RECONCILIATION`
  - ADR-0006 amended accordingly; ADR-konklusjon forblir
    `APPROVED_WITH_PRECONDITIONS`
  - CE-2.3A Mode A: `NOT_APPLICABLE`
  - CE-2.3A Mode B: GraphQL Admin API `webhookSubscriptionCreate`
    / `webhookSubscriptionUpdate`
  - Påkrevd read-only identitet før mutation:
    `app.title = Utekos Storefront` og
    `shop.myshopifyDomain = erling-7921.myshopify.com`
  - Eksplisitt eiergodkjenning kreves før enhver Shopify-mutasjon
  - Uendret: canonical semantics, deterministic event IDs,
    reconciliation, browser/server cutover, provider ownership,
    replay interlocks
- **Alternativer:** beholde app-specific/toml (avvist — ikke
  mulig for custom Admin-app); reconciliation-only (uendret
  avvist).
- **Begrunnelse:** implementeringsmodellen må matche faktisk
  produksjonsapp-klasse; shop-specific Admin GraphQL er den
  støttede subscription-mekanismen.
- **Konsekvens for roadmap/DoD:** etter ACCEPTED av DEC-011 /
  CE-2.2A kan CE-2.3A gjenopptas i Mode B uten automatisk
  mutation. Mode A forblir `NOT_APPLICABLE`.
- **Godkjent av:** _pending owner ACCEPTED_

## DEC-012 — Shopify Admin notification webhooks own Purchase and Refund

- **Dato:** 2026-07-21
- **Status:** `PROPOSED_FOR_OWNER_APPROVAL`
- **Berører:** INV-002, INV-019, INV-021; SAFE-002; CE-2.2B;
  CE-2.3A; DEC-010; DEC-011; `STOP_ACTIVE_DOUBLE_COUNT_RISK`;
  `STOP_REFUND_2026_04_PAYLOAD_INCOMPATIBLE`
- **Tidligere beslutning, hvis relevant:** DEC-010
  (app-specific); DEC-011 (shop-specific GraphQL subscriptions —
  `SUPERSEDED_BY_DEC-012`).
- **Nytt funn og primærevidens:**
  - Live Admin notification webhooks (owner-created): Order
    payment →
    `https://utekos.no/api/shopify/webhooks/orders-paid`; Refund
    create →
    `https://utekos.no/api/shopify/webhooks/refunds-create`; both
    JSON, Webhook API `2026-04`, same shop-level signing secret →
    `SHOPIFY_WEBHOOK_SECRET`.
  - Notification webhooks returneres ikke av
    `webhookSubscriptions`; tom GraphQL-liste ≠ «ingen webhook».
  - CE-2.3A evidence
    `docs/analytics/evidence/ce-2.3a-notification-webhook-post-mutation-verification.md`
    (verifier APPROVE): technical conclusion
    `SUBSCRIPTIONS_ESTABLISHED_WITH_PAYLOAD_BLOCKER`.
  - `orders-paid` live and ledger-proven; `refunds-create`
    subscription live but canonical accept blocked by Zod vs
    2026-04 (`subtotal` number; `currency` null).
- **Beslutning:**
  - purchase:
    `SHOP_ADMIN_NOTIFICATION_WEBHOOK_PLUS_RECONCILIATION`
  - refund: `SHOP_ADMIN_NOTIFICATION_WEBHOOK_PLUS_RECONCILIATION`
  - ADR-0006 amended; konklusjon forblir
    `APPROVED_WITH_PRECONDITIONS`
  - `webhookSubscriptionCreate` / `Update`, `shopify.app.toml`,
    and `shopify app deploy` do **not** own these subscriptions
  - GraphQL create for these topics: **FORBIDDEN**
  - Mode A toml/deploy: `NOT_APPLICABLE`
  - Mode B GraphQL create: `FORBIDDEN`
  - `SHOPIFY_WEBHOOK_SECRET` remains the shop notification
    secret; app API secret must not replace it
  - Utekos Storefront Admin token: identity + reconciliation +
    future Admin API ops — does **not** represent notification
    webhooks
  - CE-2.3A governance status:
    `VERIFIED_AWAITING_GOVERNANCE_ACCEPTANCE`
  - Keep active: `STOP_ACTIVE_DOUBLE_COUNT_RISK`
  - Add active: `STOP_REFUND_2026_04_PAYLOAD_INCOMPATIBLE`
  - Unchanged: deterministic event IDs, reconciliation,
    browser/server cutover, provider ownership, replay
    interlocks; no runtime/schema change in CE-2.2B
- **Alternativer:** GraphQL shop-specific create (avvist —
  duplikatrisiko / feil surface); app-specific toml (avvist).
- **Begrunnelse:** owner-modellen må beskrive den faktiske
  management surface, HMAC-hemmeligheten og CE-2.3A-verifiserte
  destinations i produksjon.
- **Konsekvens for roadmap/DoD:** etter ACCEPTED av DEC-012 /
  CE-2.2B kan CE-2.3A governance ACCEPTED vurderes; refund
  schema-fiks og CE-2.3B krever separate startordrer. Ingen
  Shopify-/runtime-mutasjon i CE-2.2B.
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
