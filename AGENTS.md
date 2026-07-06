# PROJECT UTEKOS MAIN TEAM FILE

Follow these steps for each interaction:

1. User Identification:
   - You should assume that you are interacting with default_user
   - If you have not identified default_user, proactively try to do so.

2. Memory Retrieval:
   - Always begin your chat by saying only "Remembering..." and retrieve all relevant information from your knowledge graph
   - Always refer to your knowledge graph as your "memory"

3. Memory
   - While conversing with the user, be attentive to any new information that falls into these categories:
     a) Basic Identity (age, gender, location, job title, education level, etc.)
     b) Behaviors (interests, habits, etc.)
     c) Preferences (communication style, preferred language, etc.)
     d) Goals (goals, targets, aspirations, etc.)
     e) Relationships (personal and professional relationships up to 3 degrees of separation)

4. Memory Update:
   - If any new information was gathered during the interaction, update your memory as follows:
     a) Create entities for recurring organizations, people, and significant events
     b) Connect them to the current entities using relations
     c) Store facts about them as observations


## Nødvendig atferd

## 1. Metakognitiv Systemtenkning (Context-First Execution)

Se deg selv og koden din fra et objektivt tredjepersonsperspektiv
og forstå at ingen oppgave eksisterer i et vakuum. Før du
genererer en eneste linje med kode, må du danne deg en komplett
oversikt over det store bildet. Analyser hvordan din spesifikke
løsning vil påvirke hele systemarkitekturen, ytelsen og
forretningslogikken. Ved mangel på overordnet kontekst for å ta
en trygg beslutning, må din refleks være å stoppe opp og
etterspørre den. Du handler aldri i blinde.

## 2. Selvkalibrerende Presisjon

Du har en ekstrem bevissthet om egne grenser. Når du
identifiserer et potensielt kunnskapshull eller en usikkerhet i
komplekse integrasjoner, tetter du dette umiddelbart og proaktivt
ved å bruke dokumentasjon som din absolutt eneste kilde til
sannhet (Single Source of Truth). Du gjetter aldri på API-er
eller syntaks; du kalibrerer deg selv mot fasiten før du leverer,
noe som sikrer en urokkelig, feilfri standard hver gang.

## 3. WORLD CLASS EXCELLENCE

Hver funksjon, kompontent, fil eller mer omfattende løsning -
frontend, backend og webdesign - skal kunne betraktes som
`WORLD CLASS EXCELLENCE`. Dette kravet til ekstrem ytelse betyr
et kompromissløst fokus på:

- **Arkitektur:** Streng semantikk, HTML-maksimering og absolutt
  overholdelse av DRY-prinsippet (Don't Repeat Yourself).
- **Ytelse:** Minimalisering av DOM-henvendelser, optimaliserte
  renders og lynrask kodeutførelse.

## 4. Absolutt Universell Utforming

Når du foreslår eller koder UI/UX-komponenter, trumfer
tilgjengelighet alltid estetikk og visuelle trender. Løsningene
dine skal alltid oppfylle minimum WCAG 2.2 Level AA. Du skal
eksplisitt ivareta kontrast, lesbarhet for fargeblinde, støtte
for skjermlesere, og sikre at ingen kritisk informasjon
utelukkende formidles via farge.

---

## Operating Contract

This file is the authoritative operating contract for all agents
working in this repository. Read this file first, then `PLAN.md`,
`/Users/kristofferohnstadhjelmeland/main-documentation/agents.txt`,
`/Users/kristofferohnstadhjelmeland/main-documentation/sitemap.xml`
`/Users/kristofferohnstadhjelmeland/main-documentation/README.md`,
`/Users/kristofferohnstadhjelmeland/main-documentation/llms.txt`,
and the relevant local documentation before changing code or
giving architectural recommendations.

Every user-facing response must include `Dokumentasjonsstatus:`
and explicitly say whether the current work has enough updated
documentation and runtime context to proceed. If the answer is
no, stop, identify the missing source, and fetch or request it
before implementation.

### `Zero-Assumption Protocol`

See .codex/rules/

- Do not assume current APIs, framework behavior, provider
  requirements, tracking semantics, or deployment state.
- Final delivery must list verification performed and any blocked
  verification. Uverified UI, tracking, provider, deployment, or
  data-flow changes are not acceptable deliverables.
- If any folders or paths seems missing, tell the user and never
  continue the task before its found. The reason for not seeing
  it may be beacuse its hidden under .gitognore or .cursorignore.

Code and architecture rules:

- Never use `useMemo` or `useCallback`; React Compiler is
  enabled.
- Prefer domain-oriented files and one function/component per
  file when touching related code.
- Keep code clean and self-explanatory. Do not add internal
  narration comments unless they prevent real misunderstanding.
- Validate all external data, tool inputs, route inputs, and
  agent schemas with Zod or an existing stricter local contract.
- Do not hand-edit generated MCP files such as `mcp.json`,
  `.vscode/mcp.json`, or `.cursor/mcp.json`.

Verification gates:

- UI work requires browser/runtime verification: console,
  network, DOM/snapshot, screenshot, responsive viewport, and
  contrast/WCAG when visual or brand-critical.
- Tracking work requires real provider-oriented verification
  paths: consent state, dataLayer/browser event, server
  ledger/queue, provider response, and external dashboard/API
  status where credentials permit.
- Next.js, React, Vercel AI SDK, OpenAI, Shopify, Supabase,
  analytics, consent, and ad-platform changes require current
  local or official documentation.
- Production deploy, GTM publish, PR merge, provider-resource
  mutation, ad campaign creation, Shopify catalog mutation, and
  Supabase schema mutation require explicit user confirmation and
  must not be hidden behind a default agent profile.

Brand and business-critical posture:

- Utekos brand elements, tracking fidelity, product data, consent
  handling, and paid-media events are business-critical surfaces.
- Prefer fail-closed behavior, never silent degradation when
  legal, tracking, revenue, or brand correctness is uncertain.
- Distinctive brand assets, colors, type, tone of voice, and
  category entry points must be checked against project sources
  before implementation.

flowchart TD start[Oppgave om main-documentation] -->
agents[agents.txt] agents --> specialized{Spesialisert domene?}
specialized -->|Next.js| nextjs[official-docs/llms.txt]
specialized -->|Google| google[google/agents.txt] specialized
-->|Consent| uc[usercentrics/agents.txt] specialized -->|Motion|
motion[25-motion/agents.txt] specialized -->|Nei / usikker|
llms[llms.txt] nextjs --> companion[*.llm.md] google -->
companion uc --> companion motion --> companion llms -->
companion

### Required env for core storefront E2E

- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`

These are pre-provisioned in the Cloud Agent environment. Pull
additional secrets with `vercel env pull .env.local` if the
project is linked.

### Production build caveat

`npm run build` fails without `SHOPIFY_ADMIN_API_TOKEN` because
cron routes import `src/lib/shopify/admin.ts` at module load. Dev
mode (`npm run dev`) works with Storefront credentials only.

### Lint and tests

- Lint: `npm run lint` (ESLint; repo has pre-existing violations)
- No Jest/Playwright test suite in-repo; smoke-test via browser
  against `/`, `/produkter`, and `/produkter/[handle]`

### Optional local database

```bash
npm run db:start   # Supabase local stack
npm run db:reset   # apply migrations
```

### Cloud Run sGTM env (production)

See
[src/lib/tracking/server-side-tagging.md](src/lib/tracking/server-side-tagging.md).
Minimum:

- `NEXT_PUBLIC_USERCENTRICS_SGTM_ORIGIN=https://cloud.server.utekos.no`
- `NEXT_PUBLIC_GOOGLE_GTM_ID=GTM-5TWMJQFP`
- `gtm-preview` and `gtm-server` are recreated in Google Cloud
  project `project-c683eb2c-20ae-4ec2-ac3`, region
  `europe-west1`.
- The new direct Cloud Run `gtm-server` URL is verified:
  `https://gtm-server-rojbi5yl5q-ew.a.run.app`.
- `cloud.server.utekos.no` has the required Cloud Run DNS target:
  `cloud.server.utekos.no CNAME ghs.googlehosted.com`.
- New domain mapping exists in `project-c683eb2c-20ae-4ec2-ac3`
  and routes to `gtm-server`.
- As of 2026-06-19 22:00 UTC, Cloud Run domain mapping is ready:
  `Ready=True`, `CertificateProvisioned=True`,
  `DomainRoutable=True`.
- Production endpoints are verified on `cloud.server.utekos.no`:
  `/healthy`, `uc-consent-signals.js`, `gtm.js?id=GTM-5TWMJQFP`,
  `ns.html?id=GTM-5TWMJQFP`, and `gtag/js?id=GT-MKRLF5WK` return
  HTTP 200.
- Resilient GTM script URL is defaulted in
  `googleTagManagerConfig.ts`; keep
  `NEXT_PUBLIC_GTM_RESILIENT_SCRIPT_URL` unset unless a freshly
  verified first-party loader is intentionally introduced.
- `GOOGLE_BROWSER_EVENT_TRANSPORT=sgtm` only after Cloud Run
  `/healthy`, `uc-consent-signals.js`, `gtm.js`, `ns.html`,
  canonical `gtag/js`, GTM Preview, and production tracking smoke
  pass.
- `NEXT_PUBLIC_ENABLE_GTM_IN_DEV=1` for local GTM smoke only

Operational note: the old project `nifty-structure-490519-u6`
returned Google Frontend 500/503 because billing was disabled. Do
not re-enable or link billing in that old project unless the user
explicitly asks for that cost-bearing provider mutation.

### Tracking warehouse (Supabase)

- **Kanonisk tracking-lager:** `hkoawfbomhnzupcsdggb`
  (`supabase-pink-lens`, eu-north-1). Appen kobler via
  `SUPABASE_VERCEL_POSTGRES_URL_NON_POOLING`.
- **Legacy/atlas-prosjekt:** `ycqwilkchurgsldeimdi` skal ikke
  brukes for tracking-lageret. Eldre `POSTGRES_*`-variabler peker
  fortsatt dit og er kun fallback.
- **MCP:** Bruk prosjekt-scoped `user-supabase` (bundet til
  `hkoawfbomhnzupcsdggb`). `plugin-supabase-supabase` er
  org-scoped til Utekos Atlas og gir permission-denied mot
  pink-lens.
- **Skjema:** `marketing`, `ops`, `partner`, `analytics`. Ledger:
  `marketing.event_ledger`. Kø: `ops.provider_dispatch_attempts`.
  Meta quality: `marketing.meta_quality_snapshots` via
  `/api/cron/sync-meta-insights`.
- **Iceberg:** `analytics_bucket_fdw` over `analytics-bucket` med
  vault-creds. Kald lagring: `analytics.event_ledger_archive` +
  `archive_event_ledger_batch` (pg_cron).
- **Server GA4:** Direkte Measurement Protocol for server-events.
  sGTM eier fortsatt consent-gated browser-GTM via
  `cloud.server.utekos.no`.
- **PostHog:** Én consent-gatet init via `@posthog/react` og
  `portal.utekos.no` i `DeferredTrackingBundle`. Ingen Vercel
  `/relay-MAhe`-relay i aktiv flyt.

### Local MCP and secrets

MCP servers are generated from committed templates — not
hand-edited in `mcp.json` or `.vscode/settings.json`.

```bash
cp .env.mcp.example .env.mcp.local   # first-time setup
npm run mcp:build                    # writes mcp.json + .vscode/mcp.json
npm run mcp:doctor                   # validate env + credential files
```

See [docs/local-secrets.md](docs/local-secrets.md) for the full
layering (`.env.local` vs `.env.mcp.local` vs
`src/api/lib/cloud-credentials/`).
