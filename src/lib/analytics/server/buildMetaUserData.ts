import {
  ParamBuilder,
  PII_DATA_TYPE
} from 'capi-param-builder-nodejs'
import { UserData } from 'facebook-nodejs-business-sdk'
import type { CanonicalEventEnvelope } from '../canonicalEventEnvelope'

type MetaUserDataEvent = Pick<
  CanonicalEventEnvelope,
  | 'browser_id'
  | 'client_ip_address'
  | 'event_device_info'
  | 'external_id'
  | 'location'
  | 'user_data'
>

const piiBuilder = new ParamBuilder(['utekos.no'])

function hashExternalId(value: string) {
  return (
    piiBuilder.getNormalizedAndHashedPII(
      value,
      PII_DATA_TYPE.EXTERNAL_ID
    ) ?? undefined
  )
}

export function buildMetaUserData(event: MetaUserDataEvent) {
  const userData = new UserData()
  const emailHashes = event.user_data?.email_sha256
  const phoneHashes = event.user_data?.phone_sha256
  const externalId =
    event.external_id ?
      hashExternalId(event.external_id)
    : undefined
  const clientUserAgent = event.event_device_info?.user_agent
  const fbc = event.browser_id?.fbc
  const fbp = event.browser_id?.fbp
  const location = event.location

  if (emailHashes?.length) userData.setEmails(emailHashes)
  if (phoneHashes?.length) userData.setPhones(phoneHashes)
  if (externalId) userData.setExternalId(externalId)
  if (event.client_ip_address) {
    userData.setClientIpAddress(event.client_ip_address)
  }
  if (clientUserAgent) {
    userData.setClientUserAgent(clientUserAgent)
  }
  if (fbc) userData.setFbc(fbc)
  if (fbp) userData.setFbp(fbp)
  if (location?.city) userData.setCity(location.city)
  if (
    location?.region_code &&
    /[a-z]/i.test(location.region_code)
  ) {
    userData.setState(location.region_code)
  }
  if (location?.postal_code)
    userData.setZip(location.postal_code)
  if (location?.country_code) {
    userData.setCountry(location.country_code)
  }

  return userData
}
