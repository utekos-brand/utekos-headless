import { rawMagazineArticles } from '@/app/magasinet/data/magazineArticles'
import { validateMagazineArticles } from '@/app/magasinet/utils/validateMagazineArticles'

const magazineArticlesValidation = validateMagazineArticles(
  rawMagazineArticles
)
const magazineArticleLines =
  magazineArticlesValidation.success ?
    magazineArticlesValidation.articles
      .map(
        article =>
          `- [${article.title}](https://utekos.no/magasinet/${article.slug}): ${article.excerpt}`
      )
      .join('\n')
  : ''

const body = `# Utekos



- Denne filen er Utekos sin utvidede kontekstfil for AI-modeller.
  Den supplerer https://utekos.no/llms.txt.
- Lenketøyper, priser, SKU-er og kjøpsvarianter under er kuratert
  fra repoet og gjeldende offentlig storefront-data.
- Produktsidene er fortsatt kanoniske for faktisk kjøpsstatus og
  publisert produktpresentasjon.
- Når repo-data og eldre hjelpetekster kolliderer, er
  produktsidene, Shopify-variantene og de dedikerte
  handlehjelp-sidene prioritert.

## Merkevaresammendrag

Utekos bygger produkter for utendørs komfort i nordiske forhold.
Kjerneidéen er å gi brukeren kontroll over egen varme og
mobilitet gjennom materialvalg, funksjonelle detaljer og tydelige
bruksscenarier. Hovedlinjen består av tre Utekos-modeller med
3-i-1-konstruksjon, i tillegg til Comfyrobe™ som et
værbeskyttende plagg for før og etter aktivitet, og tilbehør som
Buff™ og Stapper™.

## Canonical product URLs

- [Utekos TechDown™](https://utekos.no/produkter/utekos-techdown)
- [Utekos Mikrofiber™](https://utekos.no/produkter/utekos-mikrofiber)
- [Utekos Dun™](https://utekos.no/produkter/utekos-dun)
- [Comfyrobe™](https://utekos.no/produkter/comfyrobe)
- [Utekos Stapper™](https://utekos.no/produkter/utekos-stapper)

## Produktvarianter

| Produkt            | Handle            | SKU                         | Pris     | Sammenligningspris | Farge     | Størrelse | Kjønn  | Produkttype    |
| ------------------ | ----------------- | --------------------------- | -------- | ------------------ | --------- | --------- | ------ | -------------- |
| Utekos TechDown™   | utekos-techdown   | TECHDOWN-HAVDYP-S           | NOK 1790 | NOK 1990           | Havdyp    | Liten     | Unisex | Yttertøy       |
| Utekos TechDown™   | utekos-techdown   | TECHDOWN-HAVDYP-M           | NOK 1790 | NOK 1990           | Havdyp    | Middels   | Unisex | Yttertøy       |
| Utekos TechDown™   | utekos-techdown   | TECHDOWN-HAVDYP-L           | NOK 1790 | NOK 1990           | Havdyp    | Stor      | Unisex | Yttertøy       |
| Utekos Mikrofiber™ | utekos-mikrofiber | UTEKOS-MIKRO-M-SVART        | NOK 1590 | NOK 2290           | Vargnatt  | Medium    | Unisex | Original       |
| Utekos Mikrofiber™ | utekos-mikrofiber | UTEKOS-MIKRO-L-SVART        | NOK 1590 | NOK 2290           | Vargnatt  | Large     | Unisex | Original       |
| Utekos Mikrofiber™ | utekos-mikrofiber | UTEKOS-MIKRO-M-BLUE         | NOK 1590 | NOK 2290           | Fjellblå  | Medium    | Unisex | Original       |
| Utekos Mikrofiber™ | utekos-mikrofiber | UTEKOS-MIKRO-L-BLUE         | NOK 1590 | NOK 2290           | Fjellblå  | Large     | Unisex | Original       |
| Utekos Dun™        | utekos-dun        | UTEKOS-DUN-M-SVART          | NOK 2490 | NOK 3290           | Vargnatt  | Medium    | Unisex | Yttertøy       |
| Utekos Dun™        | utekos-dun        | UTEKOS-DUN-L-SVART          | NOK 2490 | NOK 3290           | Vargnatt  | Large     | Unisex | Yttertøy       |
| Utekos Dun™        | utekos-dun        | UTEKOS-DUN-M-BLUE           | NOK 2490 | NOK 3290           | Fjellblå  | Medium    | Unisex | Yttertøy       |
| Utekos Dun™        | utekos-dun        | UTEKOS-DUN-L-BLUE           | NOK 2490 | NOK 3290           | Fjellblå  | Large     | Unisex | Yttertøy       |
| Comfyrobe™         | comfyrobe         | COMFYROBE-FJELLNATT-S       | NOK 999  | NOK 1690           | Fjellnatt | S         | Unisex | Skalljakke     |
| Comfyrobe™         | comfyrobe         | COMFYROBE-FJELLNATT-M       | NOK 999  | NOK 1690           | Fjellnatt | M         | Unisex | Skalljakke     |
| Comfyrobe™         | comfyrobe         | COMFYROBE-FJELLNATT-L       | NOK 999  | NOK 1690           | Fjellnatt | L         | Unisex | Skalljakke     |
| Utekos Stapper™    | utekos-stapper    | UTEKOS-STAPPER-UNISEX-SVART | NOK 150  |                    | Vargnatt  | OneSize   | Unisex | Kompresjonsbag |

## Feature, material, and care matrix

| Produkt            | Kjerneposisjon                                                             | 3-i-1 | Glidelås             | Materialer og konstruksjon                                                                                        | Best for                                                              | Product care                                                                                                                     |
| --------------------| ----------------------------------------------------------------------------| -------| ----------------------| -------------------------------------------------------------------------------------------------------------------| -----------------------------------------------------------------------| ----------------------------------------------------------------------------------------------------------------------------------|
| Utekos TechDown™   | Teknisk allrounder med syntetisk isolasjon og høy komfort i varierende vær | Ja    | YKK® Dual V-Zip™     | Luméa™ Shell, CloudWave™ Insulation, Taffeta innerfôr                                                             | Norsk kystklima, terrasse, hytte, bålplass, skiftende vær             | Skånsom vask 30°C, mildt vaskemiddel, unngå skyllemiddel, lufttørk                                                               |
| Utekos Mikrofiber™ | Lett og robust modell med enkelt vedlikehold og rask tørk                  | Ja    | YKK® Dual V-Zip™     | DuraLite™ Nylon 20D/380T, hurtigtørkende fiber, DWR Performance Nylon, Taffeta innerfôr                           | Allsidig bruk, fuktige forhold, reise, enkel pakking                  | Skånsom vask 30°C, mild såpe, unngå blekemiddel, tøymykner og tørketrommel                                                       |
| Utekos Dun™        | Maksimal varme i forhold til vekt med klassisk dunfølelse                  | Ja    | YKK® Dual V-Zip™     | 650 fillpower dun, DWR Performance Nylon, Taffeta innerfôr                                                        | Kalde og tørre kvelder, maksimal varmefølelse, stasjonær hygge        | Skånsom vask 30°C, dunsåpe, lukk glidelåser, lav tørketrommel med 2–3 baller til plagget er helt tørt                            |
| Comfyrobe™         | Værbeskyttende robe for før og etter aktivitet                             | Nei   | YKK® to-veisglidelås | HydroGuard™ Shell 8000 mm, pustende PU-membran ~3000 g/m²/24 t, SherpaCore™ Thermal Lining 250 GSM, tapede sømmer | Isbading, bading, surfing, svømming, kald ankomst til hytte eller båt | Skånsom vask 40°C, mildt vaskemiddel, unngå blekemiddel, kjemisk rens, stryking og høy tørketrommelvarme; re-impregner ved behov |
| Utekos Stapper™    | Kompresjonsbag for mer effektiv pakking                                    |       |                      | Slitesterkt kompresjonsstoff, fire justerbare strammestropper, ultralett konstruksjon                             | Bobil, båt, tursekk, lagring og transport                             | Ingen egen vedlikeholdsguide publisert i repoet                                                                                  |

## Product profiles

### Utekos TechDown™

Utekos TechDown™ er den tekniske allrounderen i sortimentet.
Modellen er bygget med Luméa™-ytterstoff og CloudWave™-isolasjon,
og er laget for brukere som vil ha høy varme, syntetisk
driftssikkerhet og mindre sårbarhet i fuktig vær enn klassisk
dun. Den er en del av Utekos-familien med 3-i-1-konstruksjon og
YKK® Dual V-Zip™.

Storefronten selger TechDown™ i fargen Havdyp og størrelsene
Liten, Middels og Stor. Størrelsesguiden beskriver modellen som
mer kroppsnær og funksjonell enn Dun™ og Mikrofiber™.

### Utekos Mikrofiber™

Utekos Mikrofiber™ er det lette og vedlikeholdsvennlige valget.
DuraLite™ Nylon 20D/380T, hurtigtørkende fiber og DWR-beskyttet
ytterstoff gjør modellen relevant når brukeren prioriterer
allsidighet, lav vekt og enkel vask. Den deler 3-i-1-logikken,
YKK® Dual V-Zip™ og Taffeta innerfôr med de andre
Utekos-modellene.

Mikrofiber™ selges i Vargnatt og Fjellblå, i størrelsene Medium
og Large. Interne hjelpetekster beskriver Medium som naturlig
valg opp til omtrent 180 cm, mens Large passer høyere brukere
eller dem som ønsker mer oversized kokongfølelse.

### Utekos Dun™

Utekos Dun™ er den varmeste og mest klassiske modellen i
sortimentet. Fillpower 650-dun og DWR Performance Nylon gir høy
varme i forhold til vekt, spesielt i kalde og tørre forhold. Den
er laget for brukere som prioriterer maksimal varmefølelse og
dunloft, men den krever også mer presis tørkerutine enn de
syntetiske modellene.

Dun™ selges i Vargnatt og Fjellblå, i størrelsene Medium og
Large. Vedlikeholdsguiden er eksplisitt på at plagget må tørkes
helt ferdig i tørketrommel med baller etter vask for å bevare
spenst og hindre klumping.

### Comfyrobe™

Comfyrobe™ skiller seg fra de tre Utekos-modellene ved å være en
værbeskyttende robe i stedet for et 3-i-1-plagg. Den kombinerer
HydroGuard™ Shell med 8000 mm vannsøyle, pustende membran på
omtrent 3000 g/m²/24 t, SherpaCore™-fôr og tapede sømmer.
Produktet er laget for overgangssoner: før og etter isbad,
bading, surfing, svømming og ved ankomst til kalde omgivelser.

Storefronten viser Comfyrobe™ i fargen Fjellnatt og størrelsene
S, M og L. Hjelpetekstene beskriver passformen som oversized og
laget for å trekkes over andre klær.

### Utekos Stapper™

Utekos Stapper™ er en kompresjonsbag som reduserer volumet på
klær og soveposer med over 50 %. Lokale produktsider beskriver
den som ultralett, omtrent 100 gram, og egnet for hytte, bobil,
båt og tursekk. Den brukes naturlig som tilleggssalg til de
større Utekos-plaggene.

## Fit and sizing notes

- TechDown™: mer kroppsnær og funksjonell passform enn Dun™ og
  Mikrofiber™.
- Dun™ og Mikrofiber™: romsligere passform med kokongfølelse;
  store størrelser er ment å fungere med lag under.
- Comfyrobe™: oversized passform; laget for å trekkes utenpå
  andre klær.
- Buff™ og Stapper™: OneSize.

## Buying guides and trust pages

- [Sammenlign modeller](https://utekos.no/handlehjelp/sammenlign-modeller):
  Forskjeller mellom TechDown™, Mikrofiber™ og Dun™.
- [Funksjonalitet](https://utekos.no/handlehjelp/funksjonalitet):
  Forklaring av 3-i-1 og bruk av Utekos-plaggene.
- [Teknologi og materialer](https://utekos.no/handlehjelp/teknologi-materialer):
  Primær kilde for teknologinavn og konstruksjonsbeskrivelser.
- [Størrelsesguide](https://utekos.no/handlehjelp/storrelsesguide):
  Måltabeller og størrelsesgrunnlag.
- [Vask og vedlikehold](https://utekos.no/handlehjelp/vask-og-vedlikehold):
  Primær kilde for vedlikehold av Dun™, Mikrofiber™ og
  Comfyrobe™.
- [Frakt og retur](https://utekos.no/frakt-og-retur): Levering,
  frakt og retur.
- [Kontakt oss](https://utekos.no/kontaktskjema): Kundeservice.
- [Personvern](https://utekos.no/personvern):
  Personverninformasjon.
- [Vilkår og betingelser](https://utekos.no/vilkar-betingelser):
  Kjøpsvilkår.
- [Om Utekos®](https://utekos.no/om-oss): Merkevare og bakgrunn.

## Editorial and inspiration

- [Magasinet](https://utekos.no/magasinet): Hovedinngang til
  redaksjonelt innhold.

${magazineArticleLines}

- [Inspirasjon](https://utekos.no/inspirasjon): Temasider for
  bruksscenarier.
- [Hytteliv](https://utekos.no/inspirasjon/hytteliv)
- [Bobilliv](https://utekos.no/inspirasjon/bobil)
- [Båtliv](https://utekos.no/inspirasjon/batliv)
- [Terrassen](https://utekos.no/inspirasjon/terrassen)
- [Isbading](https://utekos.no/inspirasjon/isbading)

## Related AI endpoints

- [Short index](https://utekos.no/llms.txt): Kort indeks for
  agenter som vil starte med høy signal/støy-ratio.
- [Human overview](https://utekos.no/llms): Menneskelesbar side
  som forklarer hvordan AI-surface er organisert.

`

export async function GET() {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control':
        'public, s-maxage=86400, stale-while-revalidate=86400'
    }
  })
}
