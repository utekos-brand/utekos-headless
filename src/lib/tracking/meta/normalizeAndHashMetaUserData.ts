import { sha256 } from '@/lib/tracking/hash/sha256'
import type { ClientUserData } from 'types/tracking/meta'

const SHA256_PATTERN = /^[a-f0-9]{64}$/i

function normalizeCountry(value: string): string | undefined {
  const normalized = value.trim().toLowerCase()

  if (normalized === 'norway' || normalized === 'norge') {
    return 'no'
  }

  return /^[a-z]{2}$/.test(normalized) ? normalized : undefined
}

function normalizeGender(value: string): string | undefined {
  const normalized = value.trim().toLowerCase()

  if (normalized === 'female' || normalized === 'kvinne' || normalized === 'f') {
    return 'f'
  }

  if (normalized === 'male' || normalized === 'mann' || normalized === 'm') {
    return 'm'
  }

  return undefined
}

function normalizePhone(value: string): string | undefined {
  const digits = value.replace(/\D/g, '').replace(/^00/, '')
  return digits.length >= 7 && digits.length <= 16 ? digits : undefined
}

function normalizeDateOfBirth(value: string): string | undefined {
  const digits = value.replace(/\D/g, '')
  return /^\d{8}$/.test(digits) ? digits : undefined
}

function normalizeCityOrState(value: string): string | undefined {
  const normalized = value.trim().toLowerCase().replace(/[0-9\s().-]/g, '')
  return normalized || undefined
}

function normalizeZip(value: string): string | undefined {
  const normalized = value.trim().toLowerCase().replace(/\s/g, '').split('-', 1)[0]
  return normalized && normalized.length >= 2 ? normalized : undefined
}

function hashNormalized(value: string | undefined): string | undefined {
  if (!value) return undefined

  const normalized = value.trim().toLowerCase()
  if (!normalized) return undefined

  return SHA256_PATTERN.test(normalized) ? normalized : sha256(normalized)
}

export function normalizeAndHashMetaUserData(userData: ClientUserData): ClientUserData {
  const email = hashNormalized(userData.email)
  const emailHash = hashNormalized(userData.email_hash)
  const phone = hashNormalized(userData.phone ? normalizePhone(userData.phone) : undefined)
  const firstName = hashNormalized(userData.first_name)
  const lastName = hashNormalized(userData.last_name)
  const dateOfBirth = hashNormalized(
    userData.date_of_birth ? normalizeDateOfBirth(userData.date_of_birth) : undefined
  )
  const gender = hashNormalized(userData.gender ? normalizeGender(userData.gender) : undefined)
  const city = hashNormalized(userData.city ? normalizeCityOrState(userData.city) : undefined)
  const state = hashNormalized(userData.state ? normalizeCityOrState(userData.state) : undefined)
  const zip = hashNormalized(userData.zip ? normalizeZip(userData.zip) : undefined)
  const country = hashNormalized(userData.country ? normalizeCountry(userData.country) : undefined)
  const externalId = hashNormalized(userData.external_id)

  return {
    ...(userData.fbp ? { fbp: userData.fbp } : {}),
    ...(userData.fbc ? { fbc: userData.fbc } : {}),
    ...(userData.client_ip_address ? { client_ip_address: userData.client_ip_address } : {}),
    ...(userData.client_user_agent ? { client_user_agent: userData.client_user_agent } : {}),
    ...(externalId ? { external_id: externalId } : {}),
    ...(email ? { email } : {}),
    ...(!email && emailHash ? { email_hash: emailHash } : {}),
    ...(phone ? { phone } : {}),
    ...(firstName ? { first_name: firstName } : {}),
    ...(lastName ? { last_name: lastName } : {}),
    ...(dateOfBirth ? { date_of_birth: dateOfBirth } : {}),
    ...(gender ? { gender } : {}),
    ...(city ? { city } : {}),
    ...(state ? { state } : {}),
    ...(zip ? { zip } : {}),
    ...(country ? { country } : {})
  }
}
