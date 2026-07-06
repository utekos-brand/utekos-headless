# Klarna Plan

1. Kartlegg tilgang til Klarna Payments dokumentasjon og vurder
   graden av din tilgjengelighet og oversikt til denne. Det
   finnes også dokumentasjon lokalt, dog ikke komplett, men det
   meste som er relevant. Er allerede også implementert noe
   logikk. Vanskelig med testing i dev mode - da localhost:3000
   ikke verifiseres som godkjent URL.

src/components/klarna/dev/docs/\*

**For eksempel:**

- "src/components/klarna/dev/docs/markdown/web-payments/additional-resources/error-handling-and-validations/validations-in-kp.md"
- "src/components/klarna/dev/docs/markdown/latest-official/on-site-messaging/\*"
- src/components/klarna/dev/docs/markdown/latest-official/kustom-api/create-an-order-with-customer-token.md
- src/components/klarna/dev/docs/markdown/latest-official/integration-resilience/klarna-payment-sdk-reference.md
- src/components/klarna/dev/docs/markdown/latest-official/sign-in-with-klarna/other-operations.md
- src/components/klarna/dev/docs/markdown/latest-official/web-payments/express-checkout/README.md
- src/components/klarna/dev/docs/markdown/latest-official/web-payments/express-checkout/one-step-checkout/one-step-checkout-overview.md
- src/components/klarna/dev/docs/klarna-theme/button-placement.md
- src/components/klarna/dev/docs/markdown/latest-official/web-payments/express-checkout/checkout-installation.md
- src/components/klarna/dev/docs/markdown/latest-official/on-site-messaging/product-and-cart-placements.md
- src/components/klarna/dev/docs/markdown/latest-official/payment-api/Initiate-a-payment.md
- src/components/klarna/dev/docs/markdown/latest-official/kustom-api/api-url.md

## Komplette API i `JSON`:

- src/components/klarna/dev/docs/json/API/Customer-Token-Api.json
- src/components/klarna/dev/docs/json/API/Hosted-Payment-Page-API.json
- src/components/klarna/dev/docs/json/API/Klarna-Payments-API.json
- src/components/klarna/dev/docs/json/API/Merchant-Card-Service-API.json
- src/components/klarna/dev/docs/json/API/Order-Management-API.json
- src/components/klarna/dev/docs/json/API/Settlement-API.json

## Schemas

- src/components/klarna/dev/docs/SCHEMAS/PAYMENT-SCHEMA/acquiring_channel/attachment.json
- src/components/klarna/dev/docs/SCHEMAS/PaymentApiV3/address.json

**Klarna sitt eksempel på en enkel productfeed:**

https://assets.ctfassets.net/31h9ykss8g0q/6IUoK3iNf8VGyKZ2sWCk3V/ea9c6162325ec271056bd6b89898d4a5/productfeed.xml
