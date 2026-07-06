import type { NormalizedUserData } from 'types/tracking/user/NormalizedUserData'
import type { UserDataInput } from 'types/tracking/user/UserDataInput'

import { sha256 } from '@/lib/tracking//hash/sha256'

function normalizeName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z\u00c0-\u024f\s'-]/gi, '')
}

function normalizeCityOrRegion(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z\u00c0-\u024f\s'-]/gi, '')
}

function normalizePostalCode(value: string) {
  return value.trim().replace(/[.~]/g, '')
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits.startsWith('00') ? `+${digits.slice(2)}` : `+${digits}`
}

export function normalizeUserData(input: UserDataInput): NormalizedUserData {
  const userData: NormalizedUserData = {}
  const address: Record<string, string> = {}
  let hasAddress = false

  if (input.email) {
    const normalizedEmail = input.email.trim().toLowerCase()
    userData.sha256_email_address = [sha256(normalizedEmail)]
  }

  if (input.phone) {
    const normalizedPhone = normalizePhone(input.phone)
    userData.sha256_phone_number = [sha256(normalizedPhone)]
  }

  if (input.firstName) {
    address.sha256_first_name = sha256(normalizeName(input.firstName))
    hasAddress = true
  }

  if (input.lastName) {
    address.sha256_last_name = sha256(normalizeName(input.lastName))
    hasAddress = true
  }

  if (input.city) {
    address.city = normalizeCityOrRegion(input.city)
    hasAddress = true
  }

  if (input.region) {
    address.region = normalizeCityOrRegion(input.region)
    hasAddress = true
  }

  if (input.postalCode) {
    address.postal_code = normalizePostalCode(input.postalCode)
    hasAddress = true
  }

  if (input.country) {
    address.country = input.country.trim().toUpperCase()
    hasAddress = true
  }

  if (hasAddress) {
    userData.address = [address]
  }

  return userData
}