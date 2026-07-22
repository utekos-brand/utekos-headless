# Evidence — begin_checkout complete traceability

**Date:** 2026-07-23
**Start SHA:** `78d67e25cf6d71fa99e75b68544fbff3517172a1`
**Task:** SAFE — begin_checkout UI remediations (not CE-2.4/2.5)
**Source:** Source-based inventory report (user-supplied 2026-07-23)
**Conclusion:** `BEGIN_CHECKOUT_TRACEABILITY_INVENTORIED` + Gap 1/2 **REMEDIATED** on branch `feat/begin-checkout-remediations` (awaiting deploy; live BankID Klarna smoke blocked)

## Remediation (Gaps 1–2)

| Gap | Deviation | Status | Code |
| --- | --- | --- | --- |
| Gap 1 | Unused `handleGoToCheckout` on skreddersy purchase view | CLOSED (DEV-024) | `PurchaseClientView.tsx` → `handleGoToCheckout` |
| Gap 2 | Klarna Express missing canonical `begin_checkout` | CLOSED (DEV-023) | `prepareKlarnaExpressBeginCheckout.ts` + `KlarnaProductExpressCheckout.tsx` |

Remediation commits on `feat/begin-checkout-remediations`:

| Commit | SHA | Purpose |
| --- | --- | --- |
| Evidence + DEV stubs | `c4ba4dc0d33f8c104b2ab505cf789132cbf7c351` | Persist inventory; open DEV-023/024 |
| Code remediations | `90c5e53a261690dc0cdc1213c54ccb8843e13281` | Wire Gap 1 + cart-backed Klarna Gap 2 |
| Docs close-out | `71e4ca21ba3996d3dc10a894d725fc9fa199c2a6` | Close DEV-023/024; record remediation SHAs |

Gaps 3–7 remain open / expected qualification (out of scope for this SAFE task).

## Original inventory report

# Komplett rapport: `begin_checkout` / `InitiateCheckout`

## 1. Konklusjon

Det finnes **to aktive brukergrensesnitt-innganger** som faktisk kan opprette et kanonisk `begin_checkout`-event:

1. **«Gå til kassen» i den globale handlekurvskuffen**
2. **«Gå til kassen» i produktets kjøpsskjema / Quick View-modal**

Begge går gjennom samme sentrale funksjon:

```text
reportCanonicalBeginCheckout({ cart })
```

Funksjonen oppretter ett kanonisk `begin_checkout` med én UUID og bruker samme eventforekomst til:

* GTM/dataLayer: `begin_checkout`
* Meta Pixel: `InitiateCheckout`
* første­partsinnsamling og Supabase event ledger
* Meta Conversions API: `InitiateCheckout`
* Google Data Manager: `begin_checkout`
* Microsoft UET CAPI: `begin_checkout`

Det finnes i tillegg:

* en **ubrukt checkout-funksjon** i `/skreddersy-varmen/utekos-orginal`
* en **separat Klarna Express Checkout-flyt** som ikke oppretter ordinært `begin_checkout` gjennom `reportCanonicalBeginCheckout`

---

# 2. Analysert produksjonsversjon

| Felt                  | Verdi                                      |
| --------------------- | ------------------------------------------ |
| Repository            | `utekos-brand/utekos-headless`             |
| Branch                | `main`                                     |
| Analysert commit      | `184086af7b5378522b59c40ac262ddd6898198fd` |
| Vercel-prosjekt       | `utekos-headless`                          |
| Production deployment | `dpl_A6Yo5bNABnC6ms11xSqbWmra5GDs`         |
| Deployment-status     | `READY`                                    |
| GitHub/Vercel-samsvar | Ja – deployment peker på samme commit      |

Repositoryet er `utekos-brand/utekos-headless`, med `main` som standardbranch. 

De siste relevante commitene før analysert produksjonsversjon dokumenterer:

* Meta browser/server-deduplisering for `InitiateCheckout`
* live tre-provider-verifikasjon
* Microsoft UET CAPI-worker for `begin_checkout`

---

# 3. Full knapp- og sidematrise

| Synlig knapp eller handling             | Side/flate                                | Komponent                                  | Oppretter `begin_checkout`? | Status                             |
| --------------------------------------- | ----------------------------------------- | ------------------------------------------ | --------------------------: | ---------------------------------- |
| **Gå til kassen**                       | Global handlekurvskuff                    | `CheckoutButton`                           |                          Ja | Aktiv og live-verifisert           |
| **Gå til kassen**                       | `/produkter/[handle]`                     | `QuickCheckoutButton` via `AddToCart`      |                          Ja | Aktiv                              |
| **Gå til kassen**                       | Quick View-modal på forsiden              | `QuickCheckoutButton` via `QuickViewModal` |                          Ja | Aktiv                              |
| **Gå til kassen**                       | Quick View-modal fra `/inspirasjon/hytte` | `QuickCheckoutButton` via `QuickViewModal` |                          Ja | Aktiv                              |
| **Legg i handlekurv**                   | Forsidens TechDown-seksjon                | `AddNewProductToCartButton`                |                         Nei | Åpner bare Quick View              |
| **Kjøp nå**                             | `/inspirasjon/hytte`                      | `HyttePricingBuyButton`                    |                         Nei | Åpner bare Quick View              |
| **Legg i kurv**                         | `/skreddersy-varmen/utekos-orginal`       | `PurchaseClientView`                       |                         Nei | Kun `add_to_cart`                  |
| Intern `handleGoToCheckout`             | `/skreddersy-varmen/utekos-orginal`       | `usePurchaseLogic`                         |             Kun dersom kalt | Ubrukt/dead kodevei                |
| Klarna Express-knapp                    | Der Klarna Express monteres               | `KlarnaExpressCheckoutButton`              |       Ikke ordinær reporter | Separat flyt / mulig semantisk gap |
| Direkte modifier-klikk på checkout-link | Handlekurv                                | `CheckoutButton`                           |                         Nei | Bevisst bypass                     |

---

# 4. Aktiv inngang 1: Handlekurvens «Gå til kassen»

## Hvor finnes knappen?

Den globale kjeden er:

```text
src/app/layout.tsx
└── Header
    └── Cart
        └── CartDrawer
            └── CartFooter
                └── CheckoutButton
```

`RootLayout` monterer `Header` gjennom `SiteChrome`, og dette gjelder dermed ordinære sider i App Router-applikasjonen.

Headeren monterer den globale `Cart`-komponenten.

`Cart` åpner `CartDrawer` når handlekurvtilstanden er åpen.

`CartDrawer` monterer `CartFooter` nederst i skuffen.

## Seksjon og fil

**Fil:**

```text
src/components/cart/CartFooter/CartFooter.tsx
```

**Seksjon:**

```tsx
<DrawerFooter>
  <SubtotalDisplay />
  <CheckoutButton ... />
</DrawerFooter>
```

`CartFooter` sender inn:

* hele `cart`
* `checkoutUrl`
* subtotal
* valuta
* variant-ID-er
* antall varer

De ekstra primitive propsene finnes fortsatt på `CheckoutButton`-grensesnittet, men den faktiske eventrapporteringen bruker `cart`-objektet.

## Den faktiske utløseren

**Fil:**

```text
src/components/cart/CheckoutButton/CheckoutButton.tsx
```

**Utløsende kode:**

```tsx
if (cart) {
  await reportCanonicalBeginCheckout({ cart })
}

window.location.assign(checkoutUrl)
```

Dette skjer inne i `handleClick`.

## Synlig knappetekst

Standardteksten er:

```text
Gå til kassen
```

Ved ventetilstand:

```text
Behandler...
```

Knappen kan også få `disabledReason` dersom handlekurven inneholder utsolgte varer.

## Når fyres eventet ikke?

Eventet opprettes ikke fra denne klikkbehandleren når:

* knappen er deaktivert
* handlekurven ikke finnes
* klikket ikke er venstre museknapp
* brukeren holder `Cmd`, `Ctrl`, `Shift` eller `Alt`
* en annen handler allerede har kalt `preventDefault()`

Dette betyr eksempelvis at **Cmd-klikk / åpne i ny fane** følger den ordinære lenken uten å kjøre checkout-reporteren.

## Klassifisering

**Aktiv og live-verifisert.**

Produksjonstesten brukte nettopp:

```text
produkt → legg i handlekurv → handlekurvskuff →
a[aria-label*="Gå til kassen"]
```

---

# 5. Aktiv inngang 2: Hurtigkjøpets «Gå til kassen»

## Komponentkjeden

```text
AddToCart
└── AddToCartView
    └── ModalSubmitButton
        └── QuickCheckoutButton
            └── performGoToCheckout()
                ├── addSelectedLinesToCart()
                ├── reportCanonicalAddToCart()
                ├── reportCanonicalBeginCheckout()
                └── window.location.assign(checkoutUrl)
```

## Den synlige knappen

**Fil:**

```text
src/components/cart/QuickCheckoutButton.tsx
```

Knappen har:

```tsx
type="button"
data-track="ModalGoToCheckout"
aria-label="Gå til kassen"
```

Teksten er:

```text
Gå til kassen
```

eller:

```text
Åpner...
```

## Kobling fra viewet

`AddToCartView` sender `onCheckout` inn i `ModalSubmitButton`.

`ModalSubmitButton` viser to handlingsknapper:

1. ordinær «Legg i handlekurv»
2. `QuickCheckoutButton` / «Gå til kassen»

`AddToCart` kobler checkout-handlingen til:

```tsx
performGoToCheckout(values.quantity)
```

## Hva skjer ved klikk?

`performGoToCheckout()` gjør følgende:

1. blokkerer parallelle cart-operasjoner
2. setter `pendingAction` til `checkout`
3. legger valgt produkt og antall i handlekurven
4. får tilbake autoritativ Shopify-cart
5. kontrollerer at `checkoutUrl` finnes
6. rapporterer `begin_checkout`
7. redirecter til Shopify Checkout

Den relevante koden er:

```tsx
if (result.cart) {
  await reportCanonicalBeginCheckout({ cart: result.cart })
}

window.location.assign(checkoutUrl)
```

## Viktig hendelsesrekkefølge

Denne knappen kan opprette **to separate eventer** i samme handling:

```text
add_to_cart
begin_checkout
```

`addSelectedLinesToCart()` rapporterer først `add_to_cart` etter vellykket Shopify-mutasjon.

Deretter rapporterer `performGoToCheckout()` `begin_checkout` med den returnerte carten.

Dette er korrekt semantisk dersom brukeren faktisk både:

* legger en vare i cart
* og starter checkout

---

# 6. Hvilke sider bruker hurtigkjøpsknappen?

## 6.1 Produktsider: `/produkter/[handle]`

**Sidekomponent:**

```text
src/app/produkter/[handle]/components/ProductPageView.tsx
```

`AddToCart` monteres i produktvalgdelen etter:

* variantvalg
* trust-signaler
* pris- og Klarna-informasjon

Dermed finnes «Gå til kassen» på produktsider for salgbare varianter.

### Konkret seksjon

```tsx
<div className="mt-8 flex flex-col gap-4">
  <Activity>
    <AddToCart
      product={productData}
      selectedVariant={selectedVariant}
    />
  </Activity>
</div>
```

### Klassifisering

**Aktiv.**

Den live-verifiserte produksjonsruten var:

```text
/produkter/utekos-techdown
```

Men den dokumenterte produksjonstesten brukte først «Legg i handlekurv» og deretter handlekurvskuffens checkout-knapp, ikke nødvendigvis produktformens hurtigcheckout-knapp.

---

## 6.2 Quick View-modal

**Fil:**

```text
src/components/products/QuickViewModal.tsx
```

Quick View laster produktet og valgt variant, og monterer deretter:

```tsx
<AddToCart
  product={productData}
  selectedVariant={selectedVariant}
/>
```

Alle sider eller komponenter som åpner denne modalen får dermed tilgang til `QuickCheckoutButton`.

---

## 6.3 Forsiden

Forsidens TechDown-seksjon åpner Quick View-modal.

Kjeden er:

```text
/
└── AsyncProductLaunchWrapper
    └── NewProductLaunchSection
        └── NewProductLaunchSectionView
            └── AddNewProductToCartButton
                └── åpner QuickViewModal
                    └── AddToCart
                        └── Gå til kassen
```

`AsyncProductLaunchWrapper` returnerer `NewProductLaunchSection` for TechDown-produktet.

`NewProductLaunchSection` åpner `QuickViewModal`.

### Viktig skille

Forsideknappen **«Legg i handlekurv»** rapporterer ikke selv `begin_checkout`.

Den gjør bare:

```tsx
onClick={onAddToCartClick}
```

som åpner modalvinduet.

`begin_checkout` oppstår først dersom brukeren inne i modalvinduet klikker **«Gå til kassen»**.

---

## 6.4 `/inspirasjon/hytte`

**Fil:**

```text
src/app/inspirasjon/hytte/sections/HyttePricingBuyButton.tsx
```

Den synlige knappen er:

```text
Kjøp nå
```

Men selve knappen gjør bare:

```tsx
setIsModalOpen(true)
```

Deretter monteres `QuickViewModal`.

### Klassifisering

* **«Kjøp nå»**: utløser ikke `begin_checkout`
* **«Gå til kassen» inne i den åpnede modalen**: utløser `begin_checkout`

---

# 7. `/skreddersy-varmen/utekos-orginal`

## Hooken har checkout-logikk

**Fil:**

```text
src/hooks/usePurchaseLogic.ts
```

Hooken inneholder en fungerende checkout-funksjon:

```tsx
const handleGoToCheckout = async () => {
  ...
  const result = await addConfiguredSelectionToCart({
    openCart: false
  })

  ...

  if (result.cart) {
    await reportCanonicalBeginCheckout({
      cart: result.cart
    })
  }

  window.location.assign(checkoutUrl)
}
```

Funksjonen returneres også fra hooken.

## Men viewet bruker den ikke

`PurchaseClient` sender hele hook-resultatet inn i `PurchaseClientView`.

`PurchaseClientView` destrukturerer imidlertid:

* `handleAddToCart`
* men ikke `handleGoToCheckout`

Den synlige primærknappen er kun:

```text
Legg i kurv
```

og den kaller:

```tsx
onClick={handleAddToCart}
```

## Konklusjon

`handleGoToCheckout` er:

* implementert
* returnert
* men ikke konsumert av nåværende view
* ikke koblet til noen synlig knapp som ble funnet

**Klassifisering: ubrukt/dead checkout-kodevei.**

Brukere på denne siden kan fremdeles:

1. legge varen i handlekurven
2. åpne den globale handlekurven
3. klikke handlekurvens «Gå til kassen»

Da opprettes eventet gjennom den globale `CheckoutButton`, ikke gjennom `usePurchaseLogic.handleGoToCheckout`.

---

# 8. Direkte Shopify Checkout-innganger

Et repository-søk etter kombinasjonen:

```text
checkoutUrl + window.location.assign
```

fant tre kodeveier:

1. `CheckoutButton.tsx`
2. `useAddToCartAction.ts`
3. `usePurchaseLogic.ts`

Dette støtter følgende vurdering:

| Kodevei                 |           Aktiv UI-kobling |
| ----------------------- | -------------------------: |
| `CheckoutButton.tsx`    |                         Ja |
| `useAddToCartAction.ts` |                         Ja |
| `usePurchaseLogic.ts`   | Nei, ikke i nåværende view |

Det ble ikke funnet andre ordinære Shopify `checkoutUrl`-redirects som åpenbart omgår disse tre kodestedene.

---

# 9. Klarna Express Checkout

## Kodevei

```text
KlarnaExpressCheckoutButton
└── Klarna Payments SDK
    └── authorize()
        └── completeKlarnaExpressCheckout()
            └── POST /api/klarna/orders
                └── redirect til completion.redirect_url
```

## Knappen

**Fil:**

```text
src/components/klarna/components/KlarnaExpressCheckoutButton.tsx
```

Klarna SDK rendrer selve knappen i en container. Ved klikk:

1. `onAuthorizing` kalles
2. Klarna `authorize()` kjøres
3. shipping address valideres
4. `completeKlarnaExpressCheckout()` kjøres
5. brukeren redirectes til `completion.redirect_url`

## Attribusjon som sendes

`completeKlarnaExpressCheckout()` innhenter:

```text
captureBrowserCheckoutAttributionSnapshot()
```

og sender resultatet til:

```text
POST /api/klarna/orders
```

## Oppretter Klarna-flyten `begin_checkout`?

Ikke gjennom den ordinære funksjonen.

Det finnes ingen kall til:

```text
reportCanonicalBeginCheckout()
```

i:

* `KlarnaExpressCheckoutButton`
* `completeKlarnaExpressCheckout`

Den eneste `begin_checkout`-referansen i utility-filen er Sentry-tagging dersom attribusjonshandoff feiler:

```tsx
analytics_event: 'begin_checkout'
analytics_stage: 'klarna_attribution_handoff'
```

Dette oppretter ikke et analytics-event.

## Vurdering

Klarna Express kan etter den undersøkte browserkoden gå fra autorisasjon til ordreopprettelse uten at ordinær:

```text
reportCanonicalBeginCheckout({ cart })
```

kjøres.

Det kan være tilsiktet fordi Klarna Express er en annen checkout-semantikk, men det betyr at rapporteringen ikke er symmetrisk med Shopify Checkout.

**Klassifisering: separat checkout-flyt og mulig målegap.**

Det bør senere avgjøres eksplisitt om Klarna Express skal:

* opprette et kanonisk `begin_checkout`
* opprette et eget event som `express_checkout_authorized`
* eller betraktes som en direkte overgang til en serverautoritativ ordreprosess

---

# 10. Den kanoniske eventkjeden

## Sentral reporter

**Fil:**

```text
src/lib/analytics/beginCheckoutReporter.ts
```

## Sekvens

```text
reportCanonicalBeginCheckout({ cart })
│
├── readBrowserReporterContext()
├── browserPageViewSession.ensure()
├── mapShopifyBeginCheckout(cart)
├── crypto.randomUUID()
├── createCanonicalBeginCheckout()
├── enrichCanonicalEventWithMetaAttribution()
├── enrichCanonicalEventWithGoogleAnalyticsIds()
├── createCheckoutAttributionSnapshot()
│
├── sendGTMEvent(...)
├── persistCheckoutAttributionSnapshot(...)
└── collectCanonicalBeginCheckout(...)
```

Rapportøren:

* avslutter dersom den kjøres server-side
* oppretter et nytt tidspunkt og en ny UUID
* mapper hele Shopify-carten
* legger på samtykke, browser-ID, click-ID og external-ID
* sender eventet til dataLayer
* persisterer checkout-attribusjon
* sender til første­partscollector dersom analytics eller marketing er granted

## Event-ID

Hver ny rapportering får:

```tsx
eventId: globalThis.crypto.randomUUID()
```

Samme UUID brukes i:

* canonical event
* dataLayer
* browser-providerne
* Supabase ledger
* provider outbox
* Meta CAPI
* Google Data Manager
* Microsoft UET CAPI

---

# 11. Eventets datamodell

## Kanonisk navn

```text
begin_checkout
```

Schemaet krever:

```tsx
event_name: z.literal('begin_checkout')
source: z.literal('web')
```

## Commerce-data

`custom_data` inneholder minimum:

* `cart_id`
* `checkout_id`
* `creation_revision`
* commerce-feltene fra `canonicalCommerceValueSchema`

Commerce-feltene brukes videre til blant annet:

* valuta
* verdi
* items
* content IDs
* antall
* produktnavn
* variantinformasjon

## Envelope-data

Eventet kan inneholde:

* `event_id`
* `event_time`
* `page_url`
* `page_title`
* `page_view_id`
* `referrer_url`
* `consent`
* `browser_id`
* `click_id`
* `external_id`
* `impression_id`
* `event_device_info`

---

# 12. GTM/dataLayer-registreringen

## DataLayer-event

Reporteren kaller:

```tsx
sendGTMEvent(
  buildBeginCheckoutDataLayerEvent(event)
)
```

Eventet som pushes er:

```ts
{
  event: 'begin_checkout',
  event_id,
  event_time,
  source: 'web',
  transaction_id: event_id,
  commerce: event.custom_data,
  canonical_event: event
}
```

## GTM-bootstrap

`GoogleTagManager` monteres i `RootLayout` med:

```tsx
gtmId="GTM-5TWMJQFP"
gtmScriptUrl={googleTagGatewayUrl}
```

`sendGTMEvent` fungerer ved å pushe til dataLayer når GTM-komponenten er montert i et overordnet layout. Dette samsvarer med Next.js-dokumentasjonen hentet gjennom Context7.

## Viktig skille

At eventet pushes til dataLayer betyr ikke alene at alle providerne har mottatt eventet.

Det finnes fire separate nivåer:

1. `sendGTMEvent` ble kalt
2. objektet finnes i dataLayer
3. GTM-taggen trigget
4. providerens endpoint aksepterte requesten

Produksjonsbeviset dekker disse nivåene for Meta, og server-providerne er dokumentert separat.

---

# 13. Meta Pixel: `InitiateCheckout`

## Navnemapping

**Fil:**

```text
config/gtm/web-meta-pixel.html
```

Mappingen er:

```js
begin_checkout: 'InitiateCheckout'
```

## Browser-utsendelse

Taggen:

1. leser dataLayer
2. finner canonical event
3. validerer at dataLayer- og canonical `event_id` er like
4. mapper commerce-data
5. sender Meta-eventet med `trackSingle`
6. bruker kanonisk UUID som `eventID`

Requesten tilsvarer:

```js
fbq(
  'trackSingle',
  PIXEL_ID,
  'InitiateCheckout',
  data,
  { eventID: entry.event_id }
)
```

## Commerce-parametere

For `begin_checkout` bruker taggen `commerceData()`, som kan sende:

* `content_ids`
* `contents`
* `content_type`
* `currency`
* `value`
* `content_name`
* `content_category`

## Samtykke

Taggen kjører bare dersom:

```js
Cookiebot.consent.marketing === true
```

## Intern browser-deduplisering

Taggen lager nøkkelen:

```text
InitiateCheckout:<event_id>
```

og sender ikke samme nøkkel to ganger i samme browser-state.

---

# 14. Første­partsregistrering

## Collector

**Fil:**

```text
src/lib/analytics/beginCheckoutCollectorTransport.ts
```

Endpoint:

```text
POST /api/events/begin-checkout
```

## Samtykkegate i browser

Collector-kallet legges bare til dersom:

```tsx
event.consent.analytics === 'granted'
|| event.consent.marketing === 'granted'
```

## API-rute

**Fil:**

```text
src/app/api/events/begin-checkout/route.ts
```

Ruten henter request-kontekst fra Vercel:

* IP-adresse
* user agent
* land
* region
* postnummer
* by

## Valideringsregler

Requesten krever:

* samme origin
* `application/json`
* body på maksimalt 32 KB
* gyldig JSON
* gyldig canonical schema

## Server-side samtykkegate

Serveren normaliserer eventet og krever minst ett av:

```text
analytics = granted
marketing = granted
```

Uten dette returneres eventet som avvist og blir ikke sendt til ledger/outbox.

## Idempotens

Resultatet kan være:

```text
accepted
duplicate
rejected
```

Ledgerinnsettingen bruker det kanoniske eventet og providerplanen i samme store-operasjon.

---

# 15. Provider-matrise

| Provider  | Providernavn       | Browsertransport  | Servertransport     | Samtykke                  | Dedupe           |
| --------- | ------------------ | ----------------- | ------------------- | ------------------------- | ---------------- |
| Supabase  | `begin_checkout`   | Ingen             | Første­parts-API    | Analytics eller marketing | `event_id`       |
| Google    | `begin_checkout`   | GTM               | Google Data Manager | Analytics                 | `transaction_id` |
| Meta      | `InitiateCheckout` | Meta Pixel        | Meta CAPI           | Marketing                 | `event_id`       |
| Microsoft | `begin_checkout`   | Microsoft UET     | Microsoft UET CAPI  | Marketing                 | `event_id`       |
| PostHog   | `begin_checkout`   | Ikke implementert | Ikke implementert   | Analytics                 | Ikke aktiv       |

Hele provider-kontrakten er aktivt definert i `eventCatalog`.

## Supabase

Status:

```text
Canonical first-party persistence is active.
```

Det opprettes ingen egen Supabase provider-outbox fordi selve ledgeren er første­partsregistreringen.

## Google

* browser: GTM
* server: Google Data Manager
* krever analytics consent
* krever blant annet:

  * `client_id`
  * `transaction_id`
  * `currency`
  * `value`
  * `items`

## Meta

* eventnavn: `InitiateCheckout`
* browser: Meta Pixel via GTM
* server: Meta Conversions API
* krever marketing consent
* bruker `event_id` til deduplisering

## Microsoft

* browser: Microsoft UET
* server: Microsoft UET CAPI
* krever marketing consent
* server-worker er markert aktiv

## PostHog

PostHog-integrasjonen er ikke aktiv:

```text
The storefront PostHog integration is currently removed.
```

---

# 16. Provider-outbox og kvalifisering

Når eventet aksepteres, kalles:

```text
planCanonicalEventDispatch(event)
```

Den vurderer:

```text
google
meta
microsoft_uet
```

## Google

Google får ikke et ordinært aktivt forsøk dersom `client_id` mangler.

Resultatet blir:

```text
skipped_unqualified
missing_client_id
```

## Microsoft

Microsoft blir `skipped_unqualified` dersom:

* CAPI-token mangler
* `msclkid` mangler

## Meta

Meta krever marketing consent, men har ikke samme `client_id`- eller `msclkid`-kvalifisering.

Meta-signaler som `fbp`, `fbc`, external ID, IP og user agent håndteres i mappingen dersom de er tilgjengelige og samtykkegodkjent.

---

# 17. Produksjonsbevis

## Tre provider-servere

En produksjonstest ble utført 22. juli 2026 på:

```text
https://utekos.no/produkter/utekos-techdown
```

Flyten var:

```text
Cookiebot accept-all
→ ModalAddToCart
→ cart drawer
→ a[aria-label*="Gå til kassen"]
```

Samme `event_id` ble registrert i første­parts-POST og provider-outbox.

Resultatet var:

| Provider      | Dokumentert status    |
| ------------- | --------------------- |
| Meta          | `accepted_unverified` |
| Google        | `accepted_unverified` |
| Microsoft UET | `accepted_unverified` |

## Meta browser/server-deduplisering

En separat produksjonstest viste samme UUID i:

* første­parts-POST
* Pixel `/tr` som `InitiateCheckout`
* OpenBridge
* `marketing.event_ledger`
* Meta CAPI

Den dokumenterte Meta-browserpayloaden inneholdt:

* `content_ids`
* `contents`
* `content_type`
* `content_name`
* `content_category`
* `currency`
* `value`
* `fbp`
* `fbc`
* external ID

## Bevisstyrke

Dette er sterke bevis for at eventkjeden fungerer end-to-end.

Men providerstatusen er dokumentert som:

```text
accepted_unverified
```

Det betyr:

* requesten ble mottatt eller akseptert teknisk
* men dette er ikke nødvendigvis endelig attestasjon av attribusjon, matching eller konverteringsbehandling i providerens brukergrensesnitt

---

# 18. Tidsgrense og redirect-risiko

Reporteren forsøker å fullføre:

* attribution snapshot
* første­partscollector

før redirect.

Men det finnes en maksimal tidsgrense:

```text
1500 ms
```

Hvis oppgavene ikke fullføres innen tidsgrensen:

* feilen sendes til Sentry
* redirect kan fortsette etter at reporteren returnerer
* first-party-eventet kan gå tapt dersom browserrequesten ikke allerede er tilstrekkelig sendt

## Vurdering

Dette er et fornuftig kompromiss for checkout-UX, men ikke en absolutt leveringsgaranti.

Den aktive arkitekturen reduserer risikoen ved at:

* GTM/dataLayer-push skjer før de asynkrone oppgavene
* checkout-attribusjon persisteres parallelt
* browseren venter opptil 1,5 sekunder før redirect

Likevel er dette fortsatt en browser-initiert handoff og ikke en transaksjonell servergaranti.

---

# 19. Identifiserte gap og avvik

## Gap 1: Ubrukt `handleGoToCheckout`

**Remediation status (this branch):** `REMEDIATED` — `PurchaseClientView` wires `handleGoToCheckout` from `usePurchaseLogic` (see §Remediation).

**Alvorlighet:** Lav til middels.

`usePurchaseLogic` inneholder full checkout-rapportering, men nåværende `PurchaseClientView` eksponerer ikke funksjonen.

Konsekvens:

* unødvendig/dead kode
* potensielt misvisende testdekning
* fremtidige utviklere kan anta at siden har direkte checkout når den ikke har det

## Gap 2: Klarna Express mangler ordinær `begin_checkout`

**Remediation status (this branch):** `REMEDIATED` — Klarna Express is cart-backed via `prepareKlarnaExpressBeginCheckout` → `reportCanonicalBeginCheckout({ cart })` + `shopifyCartId` (see §Remediation).

**Alvorlighet:** Middels.

Klarna Express går gjennom attribusjonshandoff og ordreopprettelse uten å kalle den ordinære canonical checkout-reporteren.

Konsekvens:

* GA4/Meta/Microsoft checkout-funnel kan undervurdere Klarna Express-start
* purchase kan forekomme uten foregående canonical `begin_checkout`
* attribusjonsdata kan fremdeles være tilgjengelig, men eventsemantikken blir asymmetrisk

## Gap 3: Modifier-klikk på handlekurvlenken

**Alvorlighet:** Lav.

Cmd/Ctrl/Shift/Alt-klikk rapporteres ikke av `CheckoutButton`.

Dette er sannsynligvis tilsiktet for å bevare standard lenkeatferd, men det betyr at enkelte checkout-åpninger i ny fane ikke måles.

## Gap 4: Reporter krever `cart`

**Alvorlighet:** Lav.

Handlekurvknappen redirecter selv dersom `cart` mangler, men rapporterer da ikke eventet.

I normal bruk skal `CartFooter` bare rendres med en gyldig cart, så dette er primært defensiv kode.

## Gap 5: Google kan mangle `client_id`

**Alvorlighet:** Forventet kvalifiseringsgap.

Canonical event og Meta kan registreres mens Google server-eventet får:

```text
skipped_unqualified: missing_client_id
```

## Gap 6: Microsoft krever `msclkid`

**Alvorlighet:** Forventet kvalifiseringsgap.

Microsoft CAPI-eventet sendes ikke for trafikk uten `msclkid`.

Dette er korrekt fail-closed-oppførsel, men betyr at Microsoft servervolumet naturlig er lavere enn det kanoniske checkout-volumet.

## Gap 7: GTM/dataLayer opprettes før first-party consent-gate

`sendGTMEvent()` skjer alltid etter at canonical event er opprettet, mens first-party collector bare aktiveres ved analytics eller marketing consent.

Dette er ikke nødvendigvis feil:

* GTM-taggenes egne consent-regler skal kontrollere providerlevering
* canonical event i dataLayer er lokalt og flyktig
* first-party ledger er separat consent-gated

Men GTM-konfigurasjonen må fortsatt være korrekt fail-closed.

---

# 20. Endelig klassifisering per inngang

## Handlekurvskuffens «Gå til kassen»

**Status:** Aktiv og live-verifisert.

```text
CartFooter
→ CheckoutButton
→ reportCanonicalBeginCheckout
→ GTM + first-party
→ provider outbox
→ Shopify Checkout
```

## Produktsidens «Gå til kassen»

**Status:** Aktiv, men ikke særskilt isolert i det viste produksjonsbeviset.

```text
ProductPageView
→ AddToCart
→ QuickCheckoutButton
→ performGoToCheckout
→ add_to_cart
→ begin_checkout
→ Shopify Checkout
```

## Forsidens hurtigkjøp

**Status:** Aktiv indirekte inngang.

Forsidens første knapp åpner Quick View. `begin_checkout` oppstår først ved «Gå til kassen» i modalvinduet.

## `/inspirasjon/hytte`

**Status:** Aktiv indirekte inngang.

«Kjøp nå» åpner Quick View. Det faktiske checkout-eventet oppstår først i modalen.

## `/skreddersy-varmen/utekos-orginal`

**Status:** Ingen direkte checkout-knapp.

Hooken har checkout-logikk, men viewet bruker den ikke. Eventet kan fortsatt oppstå via den globale handlekurven.

## Klarna Express

**Status:** Separat flyt; ordinært canonical `begin_checkout` ikke dokumentert.

Klarna innhenter attribusjon og oppretter ordre, men går ikke gjennom `reportCanonicalBeginCheckout`.

---

# 21. Samlet filkart

## UI og knapper

```text
src/components/cart/CheckoutButton/CheckoutButton.tsx
src/components/cart/CartFooter/CartFooter.tsx
src/components/cart/CartDrawer/CartDrawer.tsx
src/components/cart/Cart.tsx
src/components/cart/AddToCart.tsx
src/components/cart/AddToCartView.tsx
src/components/cart/ModalSubmitButton.tsx
src/components/cart/QuickCheckoutButton.tsx
src/components/products/QuickViewModal.tsx
```

## Sider og innganger

```text
src/app/produkter/[handle]/components/ProductPageView.tsx
src/components/frontpage/components/TechDownCampaign/NewProductLaunchSection.tsx
src/components/frontpage/components/TechDownCampaign/NewProductLaunchSectionView.tsx
src/components/frontpage/components/TechDownCampaign/AddNewProductToCartButton.tsx
src/app/inspirasjon/hytte/sections/HyttePricingBuyButton.tsx
src/app/skreddersy-varmen/utekos-orginal/components/PurchaseClient.tsx
src/components/ProductCard/PurchaseClientView.tsx
```

## Browser-event

```text
src/lib/analytics/beginCheckoutReporter.ts
src/lib/analytics/beginCheckoutEvent.ts
src/lib/analytics/shopifyBeginCheckoutCommerce.ts
src/lib/analytics/beginCheckoutCollectorTransport.ts
config/gtm/web-meta-pixel.html
```

## Første­parts-API og ledger

```text
src/app/api/events/begin-checkout/route.ts
src/lib/analytics/server/handleCanonicalBeginCheckoutRoute.ts
src/lib/analytics/server/handleCanonicalBeginCheckoutRequest.ts
src/lib/analytics/server/acceptCanonicalBeginCheckout.ts
src/lib/analytics/server/normalizeCanonicalBeginCheckout.ts
src/lib/analytics/server/planCanonicalEventDispatch.ts
```

## Provider-routing

```text
src/lib/analytics/eventCatalog.ts
src/lib/analytics/server/providerAdapterRegistry.ts
src/lib/analytics/server/providerOutboxWorkerRegistry.ts
src/lib/analytics/server/dispatchCanonicalBeginCheckoutToMeta.ts
src/lib/analytics/server/dispatchCanonicalBeginCheckoutToGoogleDataManager.ts
src/lib/analytics/server/dispatchCanonicalBeginCheckoutToMicrosoftUet.ts
```

## Klarna Express

```text
src/components/klarna/components/KlarnaExpressCheckoutButton.tsx
src/components/klarna/utils/completeKlarnaExpressCheckout.ts
src/app/api/klarna/orders/route.ts
```

---

# Sluttvurdering

Den ordinære Shopify Checkout-sporingen er gjennomarbeidet og dokumentert end-to-end. Den sterkeste og live-verifiserte inngangen er handlekurvskuffens **«Gå til kassen»**.

Arkitekturen har:

* én sentral canonical reporter
* ett delt `event_id`
* browser- og serverlevering
* consent-gating
* first-party ledger
* provider-outbox
* Meta browser/server-deduplisering
* aktiv Google-, Meta- og Microsoft-serverlevering

De to reelle avvikene er:

1. **ubrukt direkte checkout-logikk i `usePurchaseLogic`**
2. **Klarna Express går utenom ordinær `begin_checkout`-opprettelse**

Det er ikke funnet tegn til flere ordinære Shopify Checkout-knapper som fyrer et separat eller konkurrerende `begin_checkout`.
