# Meta Dataset Quality API

Operational scope for Utekos Meta diagnostics.

## Purpose

Use Meta Dataset Quality as a read-only quality signal for the configured Pixel/Dataset. It answers whether Meta receives usable event data, match keys, coverage signals, dedupe feedback, and freshness diagnostics. It does not prove that a specific browser session fired Pixel or that CAPI dispatched successfully; those require browser/network, server ledger, and provider response evidence.

## Official Sources

- Meta Graph API Dataset Quality endpoint: `https://graph.facebook.com/{version}/dataset_quality`
- Meta Marketing API permissions and access token rules: `https://developers.facebook.com/docs/marketing-api/`
- Meta Dataset Quality documentation: `https://developers.facebook.com/documentation/ads-commerce/conversions-api/dataset-quality-api`
- Production audit: [`META_ATTRIBUTION_AUDIT_2026-07-18.md`](../../META_ATTRIBUTION_AUDIT_2026-07-18.md)

The former storefront sync in
`src/lib/tracking/meta/insights/syncMetaInsightsAndQuality.ts` and the former
commerce-tracking MCP probe were removed in the 2026-07-15 reset. Do not cite
them as active runtime. A deliberately scoped replacement is now active:
`src/app/api/cron/meta-dataset-quality/route.ts` reads Dataset Quality through
`src/lib/analytics/server/fetchMetaDatasetQuality.ts` and stores one validated,
idempotent batch per UTC day in `marketing.meta_quality_snapshots`. Vercel runs
the primary route at `17 3 * * *` and delegates an idempotent retry through
`/api/cron/meta-dataset-quality-retry` at `17 4 * * *`; see
[`DEPLOYMENT.md`](../../DEPLOYMENT.md) and [`FLOW.md`](../../FLOW.md) for the
production artifact and verification gates.

## Required Access

- `META_ACCESS_TOKEN` or `META_SYSTEM_USER_TOKEN`
- `META_PIXEL_ID` or `NEXT_PUBLIC_META_PIXEL_ID`
- Token must have access to the relevant Dataset/Pixel and Dataset Quality read surface.
- Writes, campaign edits, creative changes, audience changes, and dataset mutations are forbidden in default diagnostics.

## Read-Only Verification

Use the configured read-only Meta Ads diagnostic surface for Dataset
`1092362672918571` (`Utekos Pixel`). Keep the query read-only and record the
query time, event-level EMQ, identifier coverage, event volume, freshness and
diagnostics. Compare against the dated baseline in the production audit.

Required result before "Meta OK":

- the authenticated read returns the expected dataset
- the Dataset Quality request is successful
- expected commerce event rows are present where recent traffic exists
- event match quality and dedupe/freshness diagnostics are reviewed
- browser Pixel and CAPI are verified separately through commerce smoke and Supabase provider rows

Frozen production baseline, `2026-07-18T21:21:27.253Z`:

| Event | EMQ | Important coverage |
| --- | ---: | --- |
| `PageView` | 6.6 | IP/UA/country 100 %, `fbp` 95.4 %, `external_id` 98.2 %, `fbc` 68.8 % |
| `ViewContent` | 5.5 | IP 99.4 %, UA 100 %, `fbp` 35.1 %, `external_id` 40.7 %, `fbc` 77.3 % |
| `AddToCart` | 6.3 | IP/UA 100 %, `fbp`/`external_id` 75 %, `fbc` 66.7 % |
| `InitiateCheckout` | 5.9 | IP/UA 100 %, `fbp` 57.1 %, `external_id`/`fbc` 42.9 % |
| `Purchase` | 9.3 | Customer match keys/`fbp`/`external_id` 100 %, `fbc` 50 % |
| `Lead` | 7.4 | Email/phone/IP/UA/`fbp`/`external_id`/country 100 %; no `fbc` row yet |

The 7- and 14-day follow-up must preserve event-level denominators. Do not
infer improvement for lower-funnel events from one smoke event.

## Failure Classification

- Missing or malformed token: configuration failure, not a data-quality conclusion.
- Permission denied: access/IAM failure, not a provider-health conclusion.
- No rows: only actionable after recent Meta-bound commerce traffic has been verified through browser/server dispatch.
- Empty or incomplete quality response: classify as inconclusive until the
  dataset, permission, recent event volume and response shape have all been
  verified. Never treat an empty body as proof of zero quality problems.

## Mutation Policy

No Meta provider write is allowed from the default diagnostic profile. Token refresh, campaign creation, budget edits, audience writes, creative uploads, and dataset mutations require separate explicit approval.
