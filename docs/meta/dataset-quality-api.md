# Meta Dataset Quality API

Operational scope for Utekos Meta diagnostics.

## Purpose

Use Meta Dataset Quality as a read-only quality signal for the configured Pixel/Dataset. It answers whether Meta receives usable event data, match keys, coverage signals, dedupe feedback, and freshness diagnostics. It does not prove that a specific browser session fired Pixel or that CAPI dispatched successfully; those require browser/network, server ledger, and provider response evidence.

## Official Sources

- Meta Graph API Dataset Quality endpoint: `https://graph.facebook.com/{version}/dataset_quality`
- Meta Marketing API permissions and access token rules: `https://developers.facebook.com/docs/marketing-api/`
- Local implementation: `src/lib/tracking/meta/insights/syncMetaInsightsAndQuality.ts`
- Local MCP probe: `scripts/mcp/utekos-commerce-tracking-server.mjs`, tool `meta_dataset_quality_probe`

## Required Access

- `META_ACCESS_TOKEN` or `META_SYSTEM_USER_TOKEN`
- `META_PIXEL_ID` or `NEXT_PUBLIC_META_PIXEL_ID`
- Token must have access to the relevant Dataset/Pixel and Dataset Quality read surface.
- Writes, campaign edits, creative changes, audience changes, and dataset mutations are forbidden in default diagnostics.

## Read-Only Verification

Run:

```bash
npm run mcp:commerce-tracking:doctor
```

Then inspect `meta_dataset_quality_probe`.

Required result before "Meta OK":

- probe returns `ok=true`
- Graph API HTTP status is successful
- expected commerce event rows are present where recent traffic exists
- event match quality and dedupe/freshness diagnostics are reviewed
- browser Pixel and CAPI are verified separately through commerce smoke and Supabase provider rows

## Failure Classification

- Missing or malformed token: configuration failure, not a data-quality conclusion.
- Permission denied: access/IAM failure, not a provider-health conclusion.
- No rows: only actionable after recent Meta-bound commerce traffic has been verified through browser/server dispatch.

## Mutation Policy

No Meta provider write is allowed from the default diagnostic profile. Token refresh, campaign creation, budget edits, audience writes, creative uploads, and dataset mutations require separate explicit approval.
