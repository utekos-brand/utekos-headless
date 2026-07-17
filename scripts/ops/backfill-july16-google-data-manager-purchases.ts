import { readFileSync } from 'node:fs'
import postgres from 'postgres'
import {
  canonicalPurchaseSchema,
  deterministicPurchaseEventId,
  shopifyPurchaseTransactionId,
  type CanonicalPurchase
} from '@/lib/analytics/purchaseEvent'
import { dispatchCanonicalPurchaseToGoogleDataManager } from '@/lib/analytics/server/dispatchCanonicalPurchaseToGoogleDataManager'
import { hashCustomerMatchIdentifier } from '@/lib/google/data-manager/hashCustomerMatchIdentifier'
import { normalizeCustomerMatchEmail } from '@/lib/google/data-manager/normalizeCustomerMatchEmail'
import { normalizeCustomerMatchPhone } from '@/lib/google/data-manager/normalizeCustomerMatchPhone'

type ShopifyOrder = {
  legacyResourceId: string
  name: string
  createdAt: string
  processedAt: string
  currencyCode: string
  email?: string
  phone?: string
  customer?: {
    legacyResourceId?: string
    email?: string
    phone?: string
  }
  totalPriceSet: { shopMoney: { amount: string } }
  totalTaxSet?: { shopMoney: { amount: string } }
  totalShippingPriceSet?: { shopMoney: { amount: string } }
  lineItems: {
    edges: Array<{
      node: {
        title: string
        quantity: number
        sku?: string
        variant?: {
          legacyResourceId?: string
          sku?: string
        }
        originalUnitPriceSet: { shopMoney: { amount: string } }
      }
    }>
  }
}

type Enrichment = {
  orderId: string
  ga_client_id: string | null
  fbclid: string | null
  gclid: string | null
  msclkid: string | null
  page_url: string | null
  referrer_url: string | null
  user_agent: string | null
  client_ip_address: string | null
  consent: CanonicalPurchase['consent'] | null
  location: CanonicalPurchase['location']
}

const DRY_RUN = process.argv.includes('--dry-run')

function loadEnv(path: string) {
  const text = readFileSync(path, 'utf8')

  for (const raw of text.split(/\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue

    const eq = line.indexOf('=')
    if (eq <= 0) continue

    const key = line.slice(0, eq).trim()
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue

    let val = line.slice(eq + 1)
    if (
      (val.startsWith('"') && val.endsWith('"'))
      || (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }

    if (!(key in process.env)) process.env[key] = val
  }
}

function hashEmail(email: string | undefined) {
  if (!email) return undefined

  const normalized = normalizeCustomerMatchEmail(email)
  return normalized ?
      hashCustomerMatchIdentifier(normalized)
    : undefined
}

function hashPhone(phone: string | undefined) {
  if (!phone) return undefined

  const normalized = normalizeCustomerMatchPhone(phone)
  return normalized ?
      hashCustomerMatchIdentifier(normalized)
    : undefined
}

function buildPurchase(
  order: ShopifyOrder,
  enrichment: Enrichment
): CanonicalPurchase {
  const legacyId = order.legacyResourceId
  const email = order.email || order.customer?.email
  const phone =
    order.phone || order.customer?.phone
  const emailHash = hashEmail(email)
  const phoneHash = hashPhone(phone)

  const clickId = {
    ...(enrichment.fbclid ? { fbclid: enrichment.fbclid } : {}),
    ...(enrichment.gclid ? { gclid: enrichment.gclid } : {}),
    ...(enrichment.msclkid ? { msclkid: enrichment.msclkid } : {})
  }
  const userData = {
    ...(emailHash ? { email_sha256: [emailHash] } : {}),
    ...(phoneHash ? { phone_sha256: [phoneHash] } : {})
  }

  return canonicalPurchaseSchema.parse({
    schema_version: 1,
    event_name: 'purchase',
    event_id: deterministicPurchaseEventId(legacyId),
    event_time: order.processedAt || order.createdAt,
    source: 'server',
    environment: 'production',
    page_url: enrichment.page_url ?? 'https://utekos.no/skreddersy-varmen',
    referrer_url: enrichment.referrer_url ?? undefined,
    consent: enrichment.consent ?? {
      analytics: 'granted',
      marketing: 'granted',
      preferences: 'granted',
      source: 'cookiebot',
      version: '1'
    },
    ...(enrichment.ga_client_id ?
      {
        browser_id: {
          ga_client_id: enrichment.ga_client_id,
          ga_client: `GA1.1.${enrichment.ga_client_id}`
        }
      }
    : {}),
    ...(Object.keys(clickId).length > 0 ?
      { click_id: clickId }
    : {}),
    external_id: order.customer?.legacyResourceId,
    client_ip_address: enrichment.client_ip_address ?? undefined,
    event_device_info: enrichment.user_agent ?
      { user_agent: enrichment.user_agent }
    : undefined,
    location: enrichment.location,
    ...(Object.keys(userData).length > 0 ?
      { user_data: userData }
    : {}),
    custom_data: {
      currency: order.currencyCode || 'NOK',
      value: Number(order.totalPriceSet.shopMoney.amount),
      tax_value: Number(order.totalTaxSet?.shopMoney.amount || 0),
      shipping_value: Number(
        order.totalShippingPriceSet?.shopMoney.amount || 0
      ),
      transaction_id: shopifyPurchaseTransactionId(legacyId),
      order_name: order.name,
      items: order.lineItems.edges.map(({ node }) => ({
        item_id:
          node.variant?.legacyResourceId
          || node.sku
          || node.variant?.sku
          || node.title,
        item_name: node.title,
        quantity: Number(node.quantity || 1),
        unit_price: Number(node.originalUnitPriceSet.shopMoney.amount),
        sku: node.sku || node.variant?.sku || undefined
      }))
    }
  })
}

async function fetchOrders(): Promise<ShopifyOrder[]> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN
  const token = process.env.SHOPIFY_ADMIN_API_TOKEN

  if (!domain || !token) {
    throw new Error('Missing Shopify admin credentials')
  }

  const query = `
    query OrdersJuly16($query: String!) {
      orders(first: 10, query: $query, sortKey: CREATED_AT) {
        edges {
          node {
            legacyResourceId
            name
            createdAt
            processedAt
            currencyCode
            email
            phone
            customer { legacyResourceId email phone }
            totalPriceSet { shopMoney { amount } }
            totalTaxSet { shopMoney { amount } }
            totalShippingPriceSet { shopMoney { amount } }
            lineItems(first: 50) {
              edges {
                node {
                  title
                  quantity
                  sku
                  variant { legacyResourceId sku }
                  originalUnitPriceSet { shopMoney { amount } }
                }
              }
            }
          }
        }
      }
    }`

  const response = await fetch(
    `https://${domain}/admin/api/2025-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token
      },
      body: JSON.stringify({
        query,
        variables: {
          query:
            'created_at:>=2026-07-16 created_at:<2026-07-17 financial_status:paid'
        }
      })
    }
  )
  const json = await response.json()

  if (json.errors) {
    throw new Error(JSON.stringify(json.errors))
  }

  return json.data.orders.edges.map(
    (edge: { node: ShopifyOrder }) => edge.node
  )
}

async function main() {
  loadEnv('.env.local')

  const orders = await fetchOrders()
  const enrichmentsPath =
    '/tmp/utekos-purchase-backfill/enrichments.json'
  const enrichments = JSON.parse(
    readFileSync(enrichmentsPath, 'utf8')
  ) as Enrichment[]

  const databaseUrl =
    process.env.SUPABASE_VERCEL_POSTGRES_URL_NON_POOLING

  if (!databaseUrl) {
    throw new Error('Missing Supabase Postgres URL')
  }

  const sql = postgres(databaseUrl, {
    ssl: 'require',
    max: 1
  })

  const results: Array<Record<string, unknown>> = []

  for (const order of orders) {
    const enrichment = enrichments.find(
      (candidate) => candidate.orderId === order.legacyResourceId
    )

    if (!enrichment) {
      results.push({
        order: order.name,
        error: 'missing enrichment'
      })
      continue
    }

    const canonical = buildPurchase(order, enrichment)

    let receipt
    if (DRY_RUN) {
      receipt = {
        eventId: canonical.event_id,
        eventName: 'purchase',
        provider: 'google_data_manager',
        result: {
          validateOnly: true,
          dryRun: true
        }
      }
    } else {
      receipt =
        await dispatchCanonicalPurchaseToGoogleDataManager(
          canonical
        )
    }

    if (!DRY_RUN) {
      await sql`
        UPDATE marketing.event_ledger
        SET payload = jsonb_set(
          jsonb_set(
            payload,
            '{delivery,google_data_manager}',
            ${sql.json(receipt)},
            true
          ),
          '{delivery,google_mp_backfill}',
          coalesce(payload->'delivery'->'google', 'null'::jsonb),
          true
        )
        WHERE idempotency_key = ${`backfill:purchase:${order.legacyResourceId}`}
      `

      await sql`
        UPDATE ops.provider_dispatch_attempts
        SET
          status = 'accepted_unverified',
          response = ${sql.json(receipt)},
          request_id = ${receipt.result.requestId ?? null},
          http_status = ${200},
          skip_reason = null,
          processed_at = ${new Date().toISOString()},
          updated_at = now()
        WHERE provider = 'google'
          AND idempotency_key = ${`backfill:purchase:google:${order.legacyResourceId}`}
      `
    }

    results.push({
      order: order.name,
      transactionId: canonical.custom_data.transaction_id,
      receipt
    })
  }

  console.log(
    JSON.stringify(
      {
        dryRun: DRY_RUN,
        validateOnly:
          process.env.GOOGLE_DATA_MANAGER_VALIDATE_ONLY,
        results
      },
      null,
      2
    )
  )

  await sql.end({ timeout: 5 })
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
