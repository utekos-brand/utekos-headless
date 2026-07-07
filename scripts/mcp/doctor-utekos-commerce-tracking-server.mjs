#!/usr/bin/env node

import process from 'node:process'

import { Client, StdioClientTransport } from '@modelcontextprotocol/client'

const expectedTools = [
  'commerce_tracking_bootstrap',
  'provider_env_readiness',
  'provider_access_remediation_report',
  'shopify_admin_catalog_probe',
  'shopify_storefront_product_probe',
  'ga4_event_status_probe',
  'merchant_center_status_probe',
  'google_ads_account_access_probe',
  'google_ads_campaign_performance_probe',
  'google_ads_conversion_action_probe',
  'google_ads_search_terms_probe',
  'posthog_project_discovery_probe',
  'posthog_event_status_probe',
  'sentry_issue_status_probe',
  'vercel_deployment_status_probe',
  'gtm_sgtm_endpoint_status_probe',
  'meta_dataset_quality_probe',
  'microsoft_uet_endpoint_status_probe',
  'microsoft_ads_auth_readiness_probe',
  'microsoft_ads_account_access_probe',
  'microsoft_ads_campaign_status_probe',
  'microsoft_ads_ad_insight_probe',
  'microsoft_shopping_content_status_probe',
  'microsoft_clarity_ads_status_probe',
  'gtm_api_workspace_probe',
  'tracking_architecture_inventory',
  'tracking_event_contract',
  'commerce_tracking_docs_map'
]

function check(checks, name, ok, message) {
  checks.push({ name, ok, message })
}

function printChecks(checks) {
  for (const item of checks) {
    console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.name.padEnd(42)} ${item.message}`)
  }
}

async function main() {
  const checks = []
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['scripts/mcp/utekos-commerce-tracking-server.mjs'],
    cwd: process.cwd()
  })

  const client = new Client({
    name: 'utekos-commerce-tracking-doctor',
    version: '1.0.0'
  })

  try {
    await client.connect(transport)
    check(checks, 'connect', true, 'stdio server connected')

    const listed = await client.listTools()
    const tools = listed.tools ?? []
    check(checks, 'tool_count', tools.length === expectedTools.length, `${tools.length} tools`)

    for (const toolName of expectedTools) {
      const tool = tools.find(item => item.name === toolName)
      check(checks, `tool:${toolName}`, Boolean(tool), tool ? 'available' : 'missing')
      if (!tool) continue
      check(checks, `schema:${toolName}`, Boolean(tool.outputSchema), tool.outputSchema ? 'outputSchema present' : 'missing outputSchema')
      check(checks, `read_only:${toolName}`, tool.annotations?.readOnlyHint === true, String(tool.annotations?.readOnlyHint))
      check(checks, `destructive:${toolName}`, tool.annotations?.destructiveHint === false, String(tool.annotations?.destructiveHint))
    }

    const bootstrap = await client.callTool({ name: 'commerce_tracking_bootstrap', arguments: {} })
    check(checks, 'call:commerce_tracking_bootstrap', bootstrap.structuredContent?.ok === true, `${bootstrap.structuredContent?.data?.canonical_tools?.length ?? 0} canonical tools`)

    const readiness = await client.callTool({ name: 'provider_env_readiness', arguments: {} })
    check(checks, 'call:provider_env_readiness', readiness.structuredContent?.ok === true, `${readiness.structuredContent?.data?.providers?.length ?? 0} providers`)

    const remediation = await client.callTool({ name: 'provider_access_remediation_report', arguments: {} })
    check(
      checks,
      'call:provider_access_remediation_report',
      remediation.structuredContent?.ok === true && (remediation.structuredContent?.data?.remediations?.length ?? 0) >= 10,
      `${remediation.structuredContent?.data?.summary?.verified_live?.length ?? 0} verified live, ${remediation.structuredContent?.data?.summary?.fail_closed?.length ?? 0} fail-closed`
    )

    const shopifyAdmin = await client.callTool({ name: 'shopify_admin_catalog_probe', arguments: { products_first: 1, variants_first: 1 } })
    check(checks, 'call:shopify_admin_catalog_probe', Boolean(shopifyAdmin.structuredContent?.tool === 'shopify_admin_catalog_probe'), shopifyAdmin.structuredContent?.ok === true ? 'live query ok' : 'structured credential/scope failure')

    const shopify = await client.callTool({ name: 'shopify_storefront_product_probe', arguments: { products_first: 1, variants_first: 1 } })
    check(checks, 'call:shopify_storefront_product_probe', Boolean(shopify.structuredContent?.tool === 'shopify_storefront_product_probe'), shopify.structuredContent?.ok === true ? 'live query ok' : 'structured credential/scope failure')

    const ga4 = await client.callTool({ name: 'ga4_event_status_probe', arguments: { days_back: 1 } })
    check(checks, 'call:ga4_event_status_probe', Boolean(ga4.structuredContent?.tool === 'ga4_event_status_probe'), ga4.structuredContent?.ok === true ? 'live query ok' : 'structured credential/scope failure')

    const merchant = await client.callTool({ name: 'merchant_center_status_probe', arguments: { page_size: 5 } })
    check(checks, 'call:merchant_center_status_probe', Boolean(merchant.structuredContent?.tool === 'merchant_center_status_probe'), merchant.structuredContent?.ok === true ? 'live query ok' : 'structured credential/scope failure')

    const googleAdsAccount = await client.callTool({ name: 'google_ads_account_access_probe', arguments: { limit: 10 } })
    check(checks, 'call:google_ads_account_access_probe', Boolean(googleAdsAccount.structuredContent?.tool === 'google_ads_account_access_probe'), googleAdsAccount.structuredContent?.ok === true ? 'live query ok' : 'structured credential/scope failure')

    const googleAdsCampaigns = await client.callTool({ name: 'google_ads_campaign_performance_probe', arguments: { days_back: 7, limit: 10 } })
    check(checks, 'call:google_ads_campaign_performance_probe', Boolean(googleAdsCampaigns.structuredContent?.tool === 'google_ads_campaign_performance_probe'), googleAdsCampaigns.structuredContent?.ok === true ? 'live query ok' : 'structured credential/scope failure')

    const googleAdsConversions = await client.callTool({ name: 'google_ads_conversion_action_probe', arguments: { limit: 10 } })
    check(checks, 'call:google_ads_conversion_action_probe', Boolean(googleAdsConversions.structuredContent?.tool === 'google_ads_conversion_action_probe'), googleAdsConversions.structuredContent?.ok === true ? 'live query ok' : 'structured credential/scope failure')

    const googleAdsSearchTerms = await client.callTool({ name: 'google_ads_search_terms_probe', arguments: { days_back: 7, limit: 10 } })
    check(checks, 'call:google_ads_search_terms_probe', Boolean(googleAdsSearchTerms.structuredContent?.tool === 'google_ads_search_terms_probe'), googleAdsSearchTerms.structuredContent?.ok === true ? 'live query ok' : 'structured credential/scope failure')

    const posthogProjectDiscovery = await client.callTool({ name: 'posthog_project_discovery_probe', arguments: { limit: 5 } })
    check(checks, 'call:posthog_project_discovery_probe', Boolean(posthogProjectDiscovery.structuredContent?.tool === 'posthog_project_discovery_probe'), posthogProjectDiscovery.structuredContent?.ok === true ? 'live query ok' : 'structured credential/scope failure')

    const posthog = await client.callTool({ name: 'posthog_event_status_probe', arguments: { days_back: 1 } })
    check(checks, 'call:posthog_event_status_probe', Boolean(posthog.structuredContent?.tool === 'posthog_event_status_probe'), posthog.structuredContent?.ok === true ? 'live query ok' : 'structured credential/scope failure')

    const sentry = await client.callTool({ name: 'sentry_issue_status_probe', arguments: { limit: 1 } })
    check(checks, 'call:sentry_issue_status_probe', Boolean(sentry.structuredContent?.tool === 'sentry_issue_status_probe'), sentry.structuredContent?.ok === true ? 'live query ok' : 'structured credential/scope failure')

    const vercel = await client.callTool({ name: 'vercel_deployment_status_probe', arguments: { limit: 1 } })
    check(checks, 'call:vercel_deployment_status_probe', Boolean(vercel.structuredContent?.tool === 'vercel_deployment_status_probe'), vercel.structuredContent?.ok === true ? 'live query ok' : 'structured credential/scope failure')

    const gtm = await client.callTool({ name: 'gtm_sgtm_endpoint_status_probe', arguments: {} })
    check(checks, 'call:gtm_sgtm_endpoint_status_probe', Boolean(gtm.structuredContent?.tool === 'gtm_sgtm_endpoint_status_probe'), gtm.structuredContent?.ok === true ? 'live query ok' : 'structured endpoint failure')

    const meta = await client.callTool({ name: 'meta_dataset_quality_probe', arguments: {} })
    check(checks, 'call:meta_dataset_quality_probe', Boolean(meta.structuredContent?.tool === 'meta_dataset_quality_probe'), meta.structuredContent?.ok === true ? 'live query ok' : 'structured credential/scope failure')

    const microsoft = await client.callTool({ name: 'microsoft_uet_endpoint_status_probe', arguments: {} })
    check(checks, 'call:microsoft_uet_endpoint_status_probe', Boolean(microsoft.structuredContent?.tool === 'microsoft_uet_endpoint_status_probe'), microsoft.structuredContent?.ok === true ? 'live query ok' : 'structured endpoint failure')

    const microsoftAdsAuth = await client.callTool({ name: 'microsoft_ads_auth_readiness_probe', arguments: {} })
    check(checks, 'call:microsoft_ads_auth_readiness_probe', Boolean(microsoftAdsAuth.structuredContent?.tool === 'microsoft_ads_auth_readiness_probe'), microsoftAdsAuth.structuredContent?.ok === true ? 'auth ready' : 'structured credential/scope failure')

    const microsoftAdsAccount = await client.callTool({ name: 'microsoft_ads_account_access_probe', arguments: {} })
    check(checks, 'call:microsoft_ads_account_access_probe', Boolean(microsoftAdsAccount.structuredContent?.tool === 'microsoft_ads_account_access_probe'), microsoftAdsAccount.structuredContent?.ok === true ? 'live query ok' : 'structured credential/scope failure')

    const microsoftAdsCampaigns = await client.callTool({ name: 'microsoft_ads_campaign_status_probe', arguments: {} })
    check(checks, 'call:microsoft_ads_campaign_status_probe', Boolean(microsoftAdsCampaigns.structuredContent?.tool === 'microsoft_ads_campaign_status_probe'), microsoftAdsCampaigns.structuredContent?.ok === true ? 'live query ok' : 'structured credential/scope failure')

    const microsoftAdsInsight = await client.callTool({ name: 'microsoft_ads_ad_insight_probe', arguments: {} })
    check(checks, 'call:microsoft_ads_ad_insight_probe', Boolean(microsoftAdsInsight.structuredContent?.tool === 'microsoft_ads_ad_insight_probe'), microsoftAdsInsight.structuredContent?.ok === true ? 'live query ok' : 'structured credential/scope failure')

    const microsoftShopping = await client.callTool({ name: 'microsoft_shopping_content_status_probe', arguments: { max_results: 5 } })
    check(checks, 'call:microsoft_shopping_content_status_probe', Boolean(microsoftShopping.structuredContent?.tool === 'microsoft_shopping_content_status_probe'), microsoftShopping.structuredContent?.ok === true ? 'live query ok' : 'structured credential/scope failure')

    const microsoftClarity = await client.callTool({ name: 'microsoft_clarity_ads_status_probe', arguments: {} })
    check(checks, 'call:microsoft_clarity_ads_status_probe', Boolean(microsoftClarity.structuredContent?.tool === 'microsoft_clarity_ads_status_probe'), microsoftClarity.structuredContent?.ok === true ? 'clarity ready' : 'structured credential/scope failure')

    const gtmApi = await client.callTool({ name: 'gtm_api_workspace_probe', arguments: {} })
    check(checks, 'call:gtm_api_workspace_probe', Boolean(gtmApi.structuredContent?.tool === 'gtm_api_workspace_probe'), gtmApi.structuredContent?.ok === true ? 'live query ok' : 'structured credential/scope failure')

    const inventory = await client.callTool({ name: 'tracking_architecture_inventory', arguments: {} })
    check(checks, 'call:tracking_architecture_inventory', inventory.structuredContent?.ok === true, `${inventory.structuredContent?.data?.endpoints?.length ?? 0} endpoints`)

    const contract = await client.callTool({ name: 'tracking_event_contract', arguments: {} })
    check(checks, 'call:tracking_event_contract', contract.structuredContent?.ok === true, `${contract.structuredContent?.data?.canonical_event_names?.length ?? 0} events`)

    const docsMap = await client.callTool({ name: 'commerce_tracking_docs_map', arguments: {} })
    check(checks, 'call:commerce_tracking_docs_map', docsMap.structuredContent?.ok === true, `${docsMap.structuredContent?.data?.docs?.length ?? 0} doc groups`)

    printChecks(checks)
  } finally {
    await client.close()
  }

  const failed = checks.filter(item => !item.ok)
  if (failed.length > 0) {
    console.error(`mcp:commerce-tracking:doctor failed with ${failed.length} failure(s)`)
    process.exit(1)
  }

  console.log('mcp:commerce-tracking:doctor OK')
}

main().catch(error => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exit(1)
})
