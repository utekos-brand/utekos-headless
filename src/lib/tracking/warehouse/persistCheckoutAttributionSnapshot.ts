import 'server-only'

import { getTrackingWarehouse } from '@/lib/tracking/warehouse/getTrackingWarehouse'
import type { CheckoutAttribution } from 'types/tracking/user/CheckoutAttribution'
import type postgres from 'postgres'

type TokenKind =
  | 'checkout_key'
  | 'checkout_token'
  | 'cart_token'
  | 'cart_id'
  | 'unknown'

type SnapshotRow = {
  id: string
}

function normalizeTokens(tokens: string[]): string[] {
  return [...new Set(tokens.map(token => token.trim()).filter(Boolean))]
}

function getCapturedAt(attribution: CheckoutAttribution): Date {
  if (!Number.isFinite(attribution.ts)) {
    return new Date()
  }

  const capturedAt = new Date(attribution.ts)
  return Number.isNaN(capturedAt.getTime()) ? new Date() : capturedAt
}

function getIdempotencyKey(
  attribution: CheckoutAttribution,
  primaryStorageToken: string
): string {
  return [
    'checkout_attribution',
    attribution.eventId || primaryStorageToken || attribution.cartId || attribution.checkoutUrl
  ].join(':')
}

function getUserDataQuality(attribution: CheckoutAttribution): Record<string, boolean> {
  const userData = attribution.userData

  return {
    hasFbp: !!userData.fbp,
    hasFbc: !!userData.fbc,
    hasExternalId: !!userData.external_id,
    hasEmailHash: !!(userData.email_hash || userData.email),
    hasClientIp: !!userData.client_ip_address,
    hasUserAgent: !!userData.client_user_agent,
    hasGaClientId: !!attribution.ga_client_id,
    hasGaSessionId: !!attribution.ga_session_id,
    hasGoogleClickId: !!(attribution.gclid || attribution.gbraid || attribution.wbraid),
    hasMicrosoftClickId: !!attribution.msclkid
  }
}

function getUrlTokenKind(token: string, checkoutUrl: string | null): TokenKind | null {
  if (!checkoutUrl) {
    return null
  }

  try {
    const url = new URL(checkoutUrl)
    if (url.searchParams.get('key') === token) {
      return 'checkout_key'
    }

    if (
      url.searchParams.get('checkout_token') === token
      || url.searchParams.get('token') === token
    ) {
      return 'checkout_token'
    }

    if (url.searchParams.get('cart_token') === token) {
      return 'cart_token'
    }

    const parts = url.pathname.split('/').filter(Boolean)
    const tokenIndex = parts.indexOf(token)
    if (tokenIndex === -1) {
      return null
    }

    if (parts.includes('checkouts')) {
      return 'checkout_token'
    }

    if (parts.includes('cart')) {
      return 'cart_token'
    }
  } catch {
    return null
  }

  return null
}

function getTokenKind(token: string, attribution: CheckoutAttribution): TokenKind {
  const urlTokenKind = getUrlTokenKind(token, attribution.checkoutUrl)
  if (urlTokenKind) {
    return urlTokenKind
  }

  const cartToken = attribution.cartId?.split('?')[0]?.match(/Cart\/([a-zA-Z0-9_-]+)/)?.[1]
  if (cartToken === token) {
    return 'cart_id'
  }

  return 'unknown'
}

export async function persistCheckoutAttributionSnapshot(
  attribution: CheckoutAttribution,
  storageTokens: string[]
): Promise<void> {
  const sql = getTrackingWarehouse()
  const normalizedTokens = normalizeTokens(storageTokens)
  const primaryStorageToken = normalizedTokens[0]

  if (!sql || !primaryStorageToken) {
    return
  }

  const userData = attribution.userData
  const userDataQuality = getUserDataQuality(attribution)
  const capturedAt = getCapturedAt(attribution)
  const idempotencyKey = getIdempotencyKey(attribution, primaryStorageToken)

  await sql.begin(async transaction => {
    const rows = await transaction<SnapshotRow[]>`
      insert into marketing.checkout_attribution_snapshots (
        idempotency_key,
        primary_storage_token,
        storage_tokens,
        cart_id,
        checkout_url,
        event_id,
        ga_client_id,
        ga_session_id,
        gclid,
        gbraid,
        wbraid,
        msclkid,
        dclid,
        fbp,
        fbc,
        external_id,
        email_hash,
        client_ip_address,
        client_user_agent,
        user_data_quality,
        user_data,
        raw_payload,
        captured_at
      )
      values (
        ${idempotencyKey},
        ${primaryStorageToken},
        ${normalizedTokens},
        ${attribution.cartId ?? null},
        ${attribution.checkoutUrl ?? null},
        ${attribution.eventId ?? null},
        ${attribution.ga_client_id ?? null},
        ${attribution.ga_session_id ?? null},
        ${attribution.gclid ?? null},
        ${attribution.gbraid ?? null},
        ${attribution.wbraid ?? null},
        ${attribution.msclkid ?? null},
        ${attribution.dclid ?? null},
        ${userData.fbp ?? null},
        ${userData.fbc ?? null},
        ${userData.external_id ?? null},
        ${userData.email_hash ?? userData.email ?? null},
        ${userData.client_ip_address ?? null},
        ${userData.client_user_agent ?? null},
        ${transaction.json(userDataQuality)},
        ${transaction.json(userData as postgres.JSONValue)},
        ${transaction.json(attribution as postgres.JSONValue)},
        ${capturedAt}
      )
      on conflict (idempotency_key) do update
      set
        primary_storage_token = coalesce(
          excluded.primary_storage_token,
          marketing.checkout_attribution_snapshots.primary_storage_token
        ),
        storage_tokens = (
          select array_agg(distinct merged.token order by merged.token)
          from unnest(
            marketing.checkout_attribution_snapshots.storage_tokens
            || excluded.storage_tokens
          ) as merged(token)
        ),
        cart_id = coalesce(excluded.cart_id, marketing.checkout_attribution_snapshots.cart_id),
        checkout_url = coalesce(excluded.checkout_url, marketing.checkout_attribution_snapshots.checkout_url),
        event_id = coalesce(excluded.event_id, marketing.checkout_attribution_snapshots.event_id),
        ga_client_id = coalesce(excluded.ga_client_id, marketing.checkout_attribution_snapshots.ga_client_id),
        ga_session_id = coalesce(excluded.ga_session_id, marketing.checkout_attribution_snapshots.ga_session_id),
        gclid = coalesce(excluded.gclid, marketing.checkout_attribution_snapshots.gclid),
        gbraid = coalesce(excluded.gbraid, marketing.checkout_attribution_snapshots.gbraid),
        wbraid = coalesce(excluded.wbraid, marketing.checkout_attribution_snapshots.wbraid),
        msclkid = coalesce(excluded.msclkid, marketing.checkout_attribution_snapshots.msclkid),
        dclid = coalesce(excluded.dclid, marketing.checkout_attribution_snapshots.dclid),
        fbp = coalesce(excluded.fbp, marketing.checkout_attribution_snapshots.fbp),
        fbc = coalesce(excluded.fbc, marketing.checkout_attribution_snapshots.fbc),
        external_id = coalesce(excluded.external_id, marketing.checkout_attribution_snapshots.external_id),
        email_hash = coalesce(excluded.email_hash, marketing.checkout_attribution_snapshots.email_hash),
        client_ip_address = coalesce(excluded.client_ip_address, marketing.checkout_attribution_snapshots.client_ip_address),
        client_user_agent = coalesce(excluded.client_user_agent, marketing.checkout_attribution_snapshots.client_user_agent),
        user_data_quality = marketing.checkout_attribution_snapshots.user_data_quality || excluded.user_data_quality,
        user_data = marketing.checkout_attribution_snapshots.user_data || excluded.user_data,
        raw_payload = excluded.raw_payload,
        captured_at = least(marketing.checkout_attribution_snapshots.captured_at, excluded.captured_at),
        updated_at = now()
      returning id
    `
    const snapshotId = rows[0]?.id

    if (!snapshotId) {
      return
    }

    for (const token of normalizedTokens) {
      await transaction`
        insert into marketing.checkout_attribution_lookup_tokens (
          token,
          snapshot_id,
          token_kind
        )
        values (
          ${token},
          ${snapshotId},
          ${getTokenKind(token, attribution)}
        )
        on conflict (token) do update
        set
          snapshot_id = excluded.snapshot_id,
          token_kind = excluded.token_kind,
          updated_at = now()
      `
    }
  })
}
