# Dedikert Plan: Utekos Commercial Intelligence & Agentic Operations

## Sammendrag

Dokumentasjonsstatus: Tilstrekkelig for planlegging. Vercel
Workflows, PostHog Workflows, Supabase, GA4 BigQuery og
eksisterende repo-/runtime-status er sjekket på dokumentasjons-
og read-only-nivå. Ingen mutasjoner skal inngå i dette
plansteget.

Opprett `COMMERCIAL_INTELLIGENCE_PLAN.md` i repo-root. Planen
skal være overordnet styringsdokument for hvordan Utekos går fra
“samle data” til aktiv kommersiell innsikt, automatisert
observasjon, bedre brukerforståelse, trygg kundehjelp og
forbedret kapitalallokering.

Valgte prinsipper:

- Supabase er primær sannhet og orkestreringsanker.
- Agenter/MCP er read-only + forslag i v1.
- PostHog brukes aktivt til CRO, produktinnsikt, session replay,
  workflows og senere signals/scouts.
- Vercel Workflows brukes for robuste, flertrinns
  runtime-prosesser der appen selv eier logikken.
- Kundeservicechatboten skal gi trygghet, produktforståelse og
  bedre brukervennlighet, ikke være en masete selger.

## Målarkitektur

- Supabase: kanonisk operasjonelt lager for kunder, ordre,
  sessions, attribution, consent, provider-dispatch, alerts,
  agentfunn og beslutningslogg.
- BigQuery: tung GA4-/ads-/batchanalyse. GA4 BigQuery-link er
  aktiv, men `analytics_489598217` venter fortsatt på første
  eksport.
- PostHog: produktanalyse, funnel, web vitals, replay, heatmaps,
  surveys, workflows og kundeinnsikt.
- Redis: kortlevd checkout/runtime state, med Supabase snapshot
  som varig fasit.
- Vercel Workflows: durable app-prosesser som backfills,
  agent-jobber, chatbot-evalueringer og eksterne API-kall.
- MCP: kontrollrommet. Agenter leser Supabase, PostHog, Vercel,
  Shopify, Sentry og annonseflater, og lager prioriterte forslag
  med bevis.
- Chatbot: egen innsiktskilde og kundeopplevelsesflate, koblet
  til produktdata, FAQ, ordre-/supportintensjon og observasjon av
  friksjon.

## Implementeringsspor

- Lag `COMMERCIAL_INTELLIGENCE_PLAN.md` med nåstatus,
  målarkitektur, roadmap, gates og eierskap per integrasjon.
- Rett `FLOW.md` og `PLAN.md` slik at de reflekterer siste
  produksjonsdeploy, checkout snapshot, Shopify-historikk og GA4
  BigQuery-link.
- Definer Supabase read models for:
  - customer/order/product/session/attribution
  - provider health og dead letters
  - identifier coverage og purchase delivery
  - page/product/campaign performance
  - agent findings og anbefalinger
- Når GA4-datasettet finnes, koble BigQuery til Supabase
  read-only og bygg kuraterte modeller, ikke rå GA4-dump i
  appflyten.
- Bygg PostHog-flater:
  - produktfunnel
  - checkoutfunnel
  - landingssideprestasjon
  - UTM/kampanjeadferd
  - replay-shortlist
  - web vitals mot intent
- Bruk PostHog Workflows først til interne signaler/drafts, ikke
  kundevendte automasjoner, før eventgrunnlaget er robust.
- Bruk Vercel Workflows til langvarige, idempotente prosesser som
  trenger pause/resume, retries og appnær businesslogikk.
- Planlegg chatbot som egen v1:
  - produkt- og kjøpshjelp
  - trygghet, størrelser, materialer, bruk, vask, levering og
    retur
  - intensjonslogging til Supabase/PostHog
  - eskalering til menneske ved usikkerhet
  - ingen provider-/ordre-mutasjoner uten auth og eksplisitt gate

## Prioritert Roadmap

- P0: Datakvalitet og provider delivery
  - dead-letter-klassifisering
  - Microsoft UET CAPI-token
  - full purchase smoke
  - identifier coverage for `client_id`, `fbp`, `fbc`, `msclkid`,
    paid click IDs

- P1: Kommersiell datamodell
  - Shopify + Supabase customer/order/product/readiness-modeller
  - GA4 BigQuery → Supabase read models
  - campaign/source/session-attribution
  - geografi, postnummer, landsdel, repeat/revenue-modeller

- P1: Operasjonell overvåkning
  - Supabase health views og alerts
  - PostHog warehouse health der Meta/Bing Ads allerede er koblet
  - Vercel deployment/runtime checks
  - Sentry issue/probe-status
  - MCP-agent som daglig oppsummerer avvik og foreslår tiltak

- P2: CRO og brukerforståelse
  - PostHog dashboards/funnels
  - replay-prioritering
  - heatmaps/rageclick/dead-click analyse
  - survey-plan for kjøpsbarrierer og etterkjøpsinnsikt
  - chatbot-intent som ny kvalitativ datakilde

- P3: Agentic operations
  - MCP-verktøy for “hva feiler nå?”
  - agentrapporter med bevis fra Supabase/PostHog/Vercel/Sentry
  - PostHog Signals/scouts når datagrunnlaget finnes
  - workflows som lager drafts/rapporter, men ikke publiserer
    eller muterer providers

- P4: Utvidelser
  - Klarna/Search & Compare og Shops-innsikt
  - Google Ads/Microsoft Ads dypere read-only ytelsesmodeller
  - ClickHouse først ved faktisk query-/volumflaskehals
  - Stripe/Klarna direkte kun hvis Shopify ikke dekker
    betalingsspørsmålene

## Gates Og Tester

- Dokumentendring: `git diff --check`, direkte inspeksjon av
  `COMMERCIAL_INTELLIGENCE_PLAN.md`, `FLOW.md`, `PLAN.md`.
- Supabase: migration history, schema lint, RLS/grants,
  read-model query proof.
- BigQuery: `analytics_489598217` må finnes før wrapper/read
  models bygges.
- PostHog: eventvolum må vise stabile `utekos_*` commerce-events
  før workflows/scouts brukes til beslutninger.
- Vercel Workflows: kun planlegges nå; implementasjon krever egen
  docs-gate, install-/env-gate og deploy-godkjenning.
- Chatbot: må ha eval/safety/privacy-gate før live bruk; alle
  intents og gaps logges uten PII-lekkasje.
- Agent/MCP: v1 er read-only + forslag. Provider writes, GTM
  publish, campaign changes, schema mutation og dead-letter
  replay krever separat eksplisitt godkjenning.

## Antakelser

- Supabase-ledet orkestrering er valgt.
- Agenter kan diagnostisere og foreslå, men ikke handle autonomt
  i v1.
- Chatboten skal øke trygghet, forståelse, konvertering og
  brukervennlighet uten aggressivt salg.
- `COMMERCIAL_INTELLIGENCE_PLAN.md` er riktig plassering fordi
  nye filer under `/docs/` ignoreres.
- PostHog, Vercel Workflows og MCP skal brukes mer, men først med
  tydelige roller og verifikasjonsporter.

## Kilder

- Vercel Workflows: https://vercel.com/docs/workflows
- Vercel Workflow Concepts:
  https://vercel.com/docs/workflows/concepts
- Vercel Queues Concepts: https://vercel.com/docs/queues/concepts
- PostHog Workflows-skill og PostHog MCP inventory
- Supabase BigQuery Wrapper:
  https://supabase.com/docs/guides/database/extensions/wrappers/bigquery
- GA4 BigQuery Export:
  https://support.google.com/analytics/answer/9823238
