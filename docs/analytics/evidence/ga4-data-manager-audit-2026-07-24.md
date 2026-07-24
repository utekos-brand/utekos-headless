# GA4- og Data Manager-revisjon — 24. juli 2026

## Konklusjon

Google Analytics brukes i dag til innsamling, attribusjon, annonsekoblinger,
kostnadsimport og rapportering, men oppsettet er ikke beslutningsklart. GA4 har
en fungerende Data Manager-integrasjon. En eldre Measurement Protocol-avsender
har sendt mangelfulle kjøp og skapt de tre hastevarslene i nettstrømmen. Den
tilhørende hemmeligheten er nå tilbakekalt i GA4 og fjernet fra Vercel, slik at
fremtidige kall med den gamle legitimasjonen blir avvist.

Measurement Protocol skal ikke repareres. Den skal fjernes. Data Manager API er
allerede den kanoniske servertransporten og må være eneste servereier av
`purchase`, med nettlesertaggen som samtykkestyrt sesjonskilde og samme
transaksjons-ID for deduplisering.

## Omfang og direkte tilgang

Revisjonen har hatt direkte lesetilgang til:

- GA4-konto `355541076`, egenskap `489598217` og nettstrøm `11228676020`;
- GA4 Data API for hendelser, nøkkelhendelser, inntekter, målgrupper og
  trafikkilder;
- GA4-administrasjonen for diagnostikk, dataimport, produktkoblinger,
  nettstrøminnstillinger og Measurement Protocol-hemmeligheter;
- Shopify-administrasjonen for Customer Events;
- Vercel-konfigurasjonens variabelnavn, uten å lese verdiene;
- Supabase-tabellene `marketing.event_ledger` og
  `ops.provider_dispatch_attempts`;
- kildekoden for nettleserinnsamling, Shopify-webhooks, kanonisk hendelseslager,
  Data Manager-mapping, leveringskø og statusavstemming.

## Kontostatus

| Område | Verifisert status | Vurdering |
|---|---|---|
| Egenskap | Utekos Marketing Group \| Analytics, NOK, Europe/Oslo | Riktig grunnoppsett |
| Google Ads | To aktive koblinger, annonsetilpasning på | Tilkoblet, men nøkkelhendelser er feilklassifisert |
| Merchant Center | Konto `5806691920` koblet | Riktig |
| Search Console | Domenet `utekos.no` koblet til nettstrømmen | Riktig |
| BigQuery | Kobling finnes, men forventet datasett `analytics_489598217` mangler | Koblingen leverer ikke brukbar eksport |
| Egendefinerte dimensjoner | Ingen | Hendelsesparametere kan ikke utnyttes godt i GA4-rapporter |
| Egendefinerte beregninger | Ingen | Samme analysebegrensning |
| Målgrupper | Kun `All Users` og `Purchasers` observert | Mangler høyintensjons- og ekskluderingsmålgrupper |
| Forbedret måling | Aktiv | Riktig, men krever ryddig hendelsestaksonomi |
| E-post-/URL-redigering | Ikke aktiv | Personvern- og datakvalitetsgap |

## Hendelser og nøkkelhendelser

Perioden 25. april–23. juli 2026 inneholder blant annet 22 715 sidevisninger,
7 111 produktvisninger, 769 `add_to_cart`, 250 `begin_checkout` og 183
`purchase`-hendelser.

Nøkkelhendelsesoppsettet er feil:

| Nøkkelhendelse | Antall | Vurdering |
|---|---:|---|
| `scroll` | 4 088 | Skal ikke være nøkkelhendelse |
| `add_to_cart` | 769 | Mikrohendelse, ikke forretningsresultat |
| `begin_checkout` | 250 | Mikrohendelse, ikke forretningsresultat |
| `purchase` | 183 | Skal være primær nøkkelhendelse |
| `form_start` | 31 | Skal ikke være nøkkelhendelse |
| `form_submit` | 2 | Må avklares mot reell kvalifisert lead |

`generate_lead` har ti hendelser, men er ikke nøkkelhendelse. Dagens oppsett
overdrev tidligere antallet konverteringer og kunne gi annonseplattformene et
svakt optimaliseringssignal. `scroll`, `add_to_cart`, `begin_checkout`,
`form_start` og `form_submit` er nå deaktivert som nøkkelhendelser, mens
`purchase` er beholdt. For budgivning bør `purchase` være primær, mens
en dokumentert kvalifisert `generate_lead` kan være sekundær. Rulling,
handlekurv og checkout skal brukes til trakt, målgrupper og diagnostikk.

Hendelsesnavn som `interactwithaccordion`, `landingscrolldepth`,
`landingctaclick`, `openquickview` og `gtm.init` viser at taksonomien er
fragmentert. `gtm.init` er en intern GTM-livssyklushendelse og skal ikke ligge
som forretningshendelse i GA4.

## Hvorfor de tre kjøpsvarslene oppstår

### 1. Google-taggen har ikke sendt `purchase` de siste 48 timene

Shopify Customer Events viser ingen Google- eller YouTube-piksel. Kjøp kommer
derfor fra serverkilder, ikke fra Google-taggen i checkout. Varslet er korrekt:
det finnes ingen bekreftet nettleser-`purchase` som kan eie sesjon, kilde og
medium.

Den robuste målarkitekturen er:

1. en samtykkestyrt Shopify Customer Event/App Pixel sender nettleserkjøpet;
2. nettleser- og serverkjøpet bruker samme reelle Shopify-transaksjons-ID;
3. Data Manager sender det autoritative serverkjøpet;
4. GA4 dedupliserer på `transactionId` på tvers av nettagg og Data Manager.

Dette må publiseres kontrollert, fordi en feil pixel vil gi doble kjøp.

### 2. Measurement Protocol-kjøp mangler transaksjons-ID

I 90-dagersperioden hadde 87 av 183 `purchase`-hendelser `transactionId =
(not set)`, altså 47,5 %. Disse radene hadde ingen inntekt eller gyldig
transaksjon i GA4. I de siste åtte dagene kom de mangelfulle radene med vert og
sesjonskilde `(not set)`, som skiller dem fra Data Manager-radene.

Det fantes én aktiv Measurement Protocol-hemmelighet i GA4, og
`GA_API_SECRET` lå som kryptert variabel i Vercel Production, Preview og
Development. Aktiv applikasjonskode inneholder ingen direkte
`/mp/collect`-transport. Det betyr at den defekte avsenderen var en parallell,
eldre integrasjon eller ekstern prosess med tilgang til hemmeligheten.

Hemmeligheten er nå slettet i GA4 og `GA_API_SECRET` er fjernet fra alle tre
Vercel-miljøene. Fremtidige Measurement Protocol-kall med den gamle nøkkelen
blir dermed avvist.

Riktig løsning er å tilbakekalle hemmeligheten og fjerne Vercel-variabelen,
ikke å tilføye manglende felt til Measurement Protocol.

### 3. Measurement Protocol-kjøp mangler brukeridentifikatorer

Den samme parallelle avsenderen sender kjøp uten gyldig `client_id`, `user_id`
eller annen akseptert identifikator. GA4 kan derfor ikke knytte kjøpet til en
bruker eller sesjon og ignorerer enkelte kjøp.

Data Manager-kjøpene har derimot gyldig transaksjons-ID, GA-klient-ID og, når
samtykket tillater det, hashbaserte kundeidentifikatorer. I perioden fra 18.
juli er 15 kjøp bekreftet som `succeeded` og ett som
`accepted_unverified` i leveringskøen.

## Data Manager-feil som er rettet lokalt

### Ugyldig norsk underregion

144 Data Manager-hendelser fra 18. juli var dead-lettered: 131
`scroll_depth`, seks `view_promotion`, fire `select_promotion` og tre
`view_item`. Den verifiserte feilen var et ugyldig
`event_location.subdivision_code`.

Koden konstruerte verdier som `NO-07` fra et eldre, numerisk regionfelt. Data
Manager krever en reell ISO 3166-2-kode; syntaktisk prefiksing er ikke nok.
Feltet er valgfritt. Mappingen sender nå land og by, men utelater underregion
til en autoritativ ISO-mapping finnes.

### Manglende GA-sesjons-ID

Ingen av de analyserte hendelsene fra de siste 14 dagene hadde
`ga_session_id`: 0/2 579 `page_view`, 0/2 069 `view_item`, 0/69
`add_to_cart`, 0/43 `begin_checkout` og 0/37 `purchase`. Dette forklarer at
Data Manager-kjøp med gyldig klient-ID likevel får sesjonskilde `(not set)`.

Nettleserkoden la `gtag('get', ...)` på `dataLayer` som en vanlig array. Den
offisielle Google-taggen legger kommandoens `arguments`-objekt på kø. Koden er
rettet til den dokumenterte formen og testet for både `client_id` og
`session_id`.

### Measurement Protocol fjernet fra prosjektkonfigurasjon

`GA_API_SECRET` er fjernet fra `.env.mcp.example` og MCP-manifestet.
Prosjektinstruksen sier nå eksplisitt at Measurement Protocol ikke skal
introduseres, repareres eller brukes som fallback.

## Meta-import: hva den brukes til, og hvorfor matchprosenten er lav

Meta-koblingen importerer kampanjekostnad, klikk og visninger. Den importerer
ikke Meta-konverteringer og den matcher ikke personer. Matchprosenten er
andelen kostnadsrader som GA4 klarer å koble til innsamlede kampanjer på dato,
`utm_source` og `utm_medium`. `utm_campaign` og `utm_id` gir ytterligere
stabilitet og rapporteringsverdi.

Tre overlappende Meta-kilder var aktive:

| Kilde | Match 24. juli | Problem |
|---|---:|---|
| `Meta User Data` | 52,57 % | Misvisende navn; er kampanjedata og overlapper andre importer |
| `Meta Ads` | 51,27 % | Beste kandidat; bruker `fb`, `ig`, `an`, `msg` / `paid` |
| `Meta` | 23,86 % | Facebook er feilaktig satt til `m.facebook.com` / `paid` |

Alle tre importerer 100 % av filradene uten importfeil. Lav match er derfor
ikke en autentiserings- eller personvernfeil. Den skyldes nøkkelbrudd:

- kostnad ligger på `fb / paid`, `ig / paid` og `m.facebook.com / paid`;
- inntekten ligger blant annet på `facebook / paid` og `fb / paid` med en
  blanding av kampanjenavn og numeriske kampanje-ID-er;
- `m.facebook.com` er et henvisningsvertsnavn, ikke en stabil UTM-kilde;
- tre importer konkurrerer om overlappende Meta-data.

Konsekvensen er at GA4 viser Meta-kostnad på rader med null konvertering og
null inntekt, mens konverteringsradene ofte har null importert kostnad. ROAS
blir derfor null eller misvisende selv om både kostnad og inntekt finnes.

`Meta User Data` og `Meta` er nå slettet fordi GA4 ikke tilbyr pause eller
deaktivering av disse koblingene. `Meta Ads` er verifisert som eneste
gjenværende Meta-import. Kanonisk løsning videre er å standardisere
annonse-URL-er til
Facebook `fb`, Instagram `ig`, Audience Network `an`, Messenger `msg` og
medium `paid`, og bruke stabile `utm_id`/`utm_campaign`-verdier som samsvarer
med importen.

## Ikke-utnyttede muligheter

- Opprett målgrupper for handlekurv uten kjøp, checkout uten kjøp,
  produkt-/kategorivisning, høy verdi og nylige kjøpere som ekskludering.
- Registrer forretningskritiske hendelsesparametere som egendefinerte
  dimensjoner etter en begrenset, dokumentert måleplan.
- Reparer BigQuery-eksporten og bruk den til deduplisering, kohorter,
  livstidsverdi og kryssjekk mot Shopify/Supabase.
- Bygg et beslutningsklart kostnads- og inntektslag etter at Meta-UTM-er og
  transaksjonseierskap er ryddet.
- Aktiver e-post- og relevante URL-parameterredigeringer etter en eksplisitt
  personverngjennomgang.

## Endringer utført og verifisering

Kode og prosjektkonfigurasjon:

- Data Manager sender ikke lenger syntetisk `subdivisionCode`;
- Google-tagkommandoer følger den dokumenterte `arguments`-køformen;
- `GA_API_SECRET` er fjernet fra prosjektets MCP-maler;
- prosjektpolicyen forbyr Measurement Protocol som transport eller fallback.

Testresultat:

- 52 relevante Data Manager- og GA-identifikatortester bestått;
- lint for berørte filer bestått;
- full TypeScript-kontroll ble forsøkt, men stoppes av eksisterende,
  ikke-relaterte testtypefeil i produktmetadata, page-view og
  cart-update-tester.

Produksjonsinnstillinger utført 24. juli 2026:

- Measurement Protocol-hemmeligheten `GA_API_SECRET` er slettet i GA4;
- `GA_API_SECRET` er fjernet fra Vercel Production, Preview og Development;
- `scroll`, `add_to_cart`, `begin_checkout`, `form_start` og `form_submit` er
  deaktivert som nøkkelhendelser;
- `purchase` er verifisert beholdt som nøkkelhendelse;
- `Meta User Data` og `Meta` er slettet; `Meta Ads` er verifisert som eneste
  gjenværende Meta-import.

GA4s tre eksisterende diagnostikkvarsler kan bli stående gjennom neste
behandlingsvindu. De skal vurderes på nytt etter at nye hendelser er behandlet,
senest etter 48 timer.

## Produksjonspakke og gjenstående arbeid

Status for den godkjente endringsøkten:

1. Data Manager- og sesjons-ID-rettingen inngår i produksjonsreleasen;
2. Measurement Protocol-hemmeligheten er tilbakekalt i GA4;
3. `GA_API_SECRET` er slettet fra Vercel Production, Preview og Development;
4. de fem avtalte nøkkelhendelsene er deaktivert, `purchase` er beholdt, og
   `generate_lead` er ikke endret;
5. `Meta Ads` er beholdt, mens `Meta User Data` og `Meta` er slettet;

Gjenstående arbeid utenfor den godkjente pakken:

6. standardiser aktive Meta-annonsers UTM-er før neste importvindu;
7. implementer og test en samtykkestyrt Shopify Google-pixel med samme
   transaksjons-ID som Data Manager;
8. reparer BigQuery-eksporten og bekreft første daglige partisjon;
9. overvåk Data Manager-status, GA4 Realtime/DebugView, manglende
   transaksjons-ID, sesjons-ID-dekning og Meta-match i minst 48 timer.

## Offisiell dokumentasjon

- [Oppgrader fra Measurement Protocol til Data Manager API](https://developers.google.com/data-manager/api/devguides/events/analytics/measurement-protocol/upgrade)
- [Feltmapping ved migrering](https://developers.google.com/data-manager/api/devguides/events/analytics/measurement-protocol/upgrade/field-mappings)
- [Send hendelser og dedupliser med transactionId](https://developers.google.com/data-manager/api/devguides/events/send-events)
- [Google tag API: get client_id og session_id](https://developers.google.com/tag-platform/gtagjs/reference)
- [Importer Meta Ads-kampanjedata](https://support.google.com/analytics/answer/16536051?hl=en)
- [Om kampanjedataimport](https://support.google.com/analytics/answer/10071305?hl=en)
- [Diagnostiser mangelfulle nettkjøp](https://support.google.com/analytics/answer/16729583?hl=en)
