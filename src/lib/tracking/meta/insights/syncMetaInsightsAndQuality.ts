import 'server-only'

import { FacebookAdsApi, AdAccount } from 'facebook-nodejs-business-sdk'
import { getTrackingWarehouse } from '@/lib/tracking/warehouse/getTrackingWarehouse'
import { resolveMetaAccessToken } from '@/lib/tracking/meta/utils/resolveMetaAccessToken'
import { logToAppLogs } from '@/lib/utils/logToAppLogs'
import { resolveMetaPixelId } from '@/lib/tracking/meta/utils/resolveMetaPixelId'

export async function syncMetaInsightsAndQuality() {
  const token = resolveMetaAccessToken()
  const pixelId = resolveMetaPixelId()
  const adAccountId = process.env.META_AD_ACCOUNT_ID

  if (!token || !pixelId || !adAccountId) {
    return {
      success: false,
      error: 'Missing required credentials (token, pixelId, or adAccountId)'
    }
  }

  const sql = getTrackingWarehouse()
  if (!sql) {
    return { success: false, error: 'Database connection failed' }
  }

  FacebookAdsApi.init(token)
  let insightsCount = 0
  let qualityCount = 0

  // 1. Hent Insights (siste 7 dager)
  try {
    const account = new AdAccount(`act_${adAccountId}`)

    // Vi henter data aggregert per dag for å unngå duplikater
    const insights = await account.getInsights(
      [
        'campaign_id',
        'campaign_name',
        'adset_id',
        'adset_name',
        'ad_id',
        'ad_name',
        'impressions',
        'clicks',
        'spend',
        'cpc',
        'ctr',
        'action_values'
      ],
      {
        date_preset: 'last_7d',
        level: 'ad',
        time_increment: 1
      }
    )

    for (const item of insights) {
      // Finn ROAS (Return On Ad Spend) fra action_values
      let roas = 0
      if (item.action_values) {
        const purchaseAction = item.action_values.find(
          (a: { action_type: string; value: string }) =>
            a.action_type === 'omni_purchase' || a.action_type === 'purchase'
        )
        if (purchaseAction && Number(item.spend) > 0) {
          roas = Number(purchaseAction.value) / Number(item.spend)
        }
      }

      await sql`
        insert into marketing.campaign_insights (
          campaign_id,
          campaign_name,
          adset_id,
          adset_name,
          ad_id,
          ad_name,
          date_start,
          date_stop,
          impressions,
          clicks,
          spend,
          cpc,
          ctr,
          roas,
          raw_payload
        )
        values (
          ${item.campaign_id},
          ${item.campaign_name},
          ${item.adset_id},
          ${item.adset_name},
          ${item.ad_id},
          ${item.ad_name},
          ${item.date_start},
          ${item.date_stop},
          ${Number(item.impressions || 0)},
          ${Number(item.clicks || 0)},
          ${Number(item.spend || 0)},
          ${Number(item.cpc || 0)},
          ${Number(item.ctr || 0)},
          ${roas},
          ${sql.json(item._data || {})}
        )
        on conflict (campaign_id, adset_id, ad_id, date_start, date_stop)
        do update set
          impressions = excluded.impressions,
          clicks = excluded.clicks,
          spend = excluded.spend,
          cpc = excluded.cpc,
          ctr = excluded.ctr,
          roas = excluded.roas,
          raw_payload = excluded.raw_payload,
          fetched_at = now()
      `
      insightsCount++
    }
  } catch (error) {
    await logToAppLogs('ERROR', 'Meta Insights Sync Failed', {
      error: error instanceof Error ? error.message : 'Unknown'
    })
  }

  // 2. Hent Dataset Quality via raw fetch til Graph API
  // (Fordi facebook-nodejs-business-sdk ofte henger etter på nye quality-endepunkter)
  try {
    const url = new URL('https://graph.facebook.com/v25.0/dataset_quality')
    url.searchParams.set('dataset_id', pixelId)

    url.searchParams.set('access_token', token)
    url.searchParams.set(
      'fields',
      'web{event_name,event_match_quality,event_coverage,dedupe_key_feedback,data_freshness}'
    )

    const res = await fetch(url.toString())
    if (res.ok) {
      const data = await res.json()

      if (data.web && Array.isArray(data.web)) {
        for (const event of data.web) {
          const emq = event.event_match_quality?.composite_score ?? null
          const coverage = event.event_coverage?.percentage ?? null

          await sql`
            insert into marketing.meta_quality_snapshots (
              dataset_id,
              event_name,
              event_match_quality,
              event_coverage,
              dedup_key_feedback,
              data_freshness,
              raw_payload
            )
            values (
              ${pixelId},
              ${event.event_name},
              ${emq},
              ${coverage},
              ${sql.json(event.dedupe_key_feedback || {})},
              ${sql.json(event.data_freshness || {})},
              ${sql.json(event)}
            )
          `
          qualityCount++
        }
      }
    } else {
      const errText = await res.text()
      await logToAppLogs('ERROR', 'Meta Dataset Quality Sync Failed', { error: errText })
    }
  } catch (error) {
    await logToAppLogs('ERROR', 'Meta Dataset Quality Fetch Failed', {
      error: error instanceof Error ? error.message : 'Unknown'
    })
  }

  return {
    success: true,
    insightsCount,
    qualityCount
  }
}
