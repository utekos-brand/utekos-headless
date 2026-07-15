import type {
  CanonicalPageViewStoreInput
} from './acceptCanonicalPageView'

type UserDataQuality = {
  email_sha256_count: number
  has_external_id: boolean
  phone_sha256_count: number
}

export type CanonicalLedgerInsert = {
  consent: CanonicalPageViewStoreInput['event']['consent']
  event_id: string
  event_name: 'page_view'
  external_id?: string
  idempotency_key: string
  occurred_at: string
  payload: CanonicalPageViewStoreInput['event']
  source_url: string
  user_data_quality: UserDataQuality
}

export type ProviderDispatchInsert = {
  consent_basis: CanonicalPageViewStoreInput['event']['consent']
  data_quality: UserDataQuality
  dispatch_mode: 'server_retry'
  event_id: string
  event_name: 'page_view'
  idempotency_key: string
  payload: CanonicalPageViewStoreInput['event']
  provider: CanonicalPageViewStoreInput['dispatches'][number]['provider']
  status: 'pending'
}

export function mapCanonicalPageViewPersistence(
  input: CanonicalPageViewStoreInput
): {
  dispatches: ProviderDispatchInsert[]
  ledger: CanonicalLedgerInsert
} {
  const idempotencyKey = `page_view:${input.event.event_id}`
  const dataQuality: UserDataQuality = {
    email_sha256_count:
      input.event.user_data?.email_sha256?.length ?? 0,
    has_external_id: Boolean(input.event.external_id),
    phone_sha256_count:
      input.event.user_data?.phone_sha256?.length ?? 0
  }

  return {
    ledger: {
      consent: input.event.consent,
      event_id: input.event.event_id,
      event_name: input.event.event_name,
      ...(input.event.external_id ?
        { external_id: input.event.external_id }
      : {}),
      idempotency_key: idempotencyKey,
      occurred_at: input.event.event_time,
      payload: input.event,
      source_url: input.event.page_url,
      user_data_quality: dataQuality
    },
    dispatches: input.dispatches.map(dispatch => ({
      consent_basis: input.event.consent,
      data_quality: dataQuality,
      dispatch_mode: dispatch.dispatch_mode,
      event_id: input.event.event_id,
      event_name: input.event.event_name,
      idempotency_key: idempotencyKey,
      payload: input.event,
      provider: dispatch.provider,
      status: 'pending'
    }))
  }
}
