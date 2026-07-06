const NORWAY_COUNTRY_CODE = '47'

function isValidE164PhoneNumber(phoneNumber: string) {
  return /^\+[1-9]\d{7,14}$/.test(phoneNumber)
}

export function normalizeCustomerMatchPhone(phone: string) {
  const trimmedPhone = phone.trim()

  if (!trimmedPhone) {
    return null
  }

  if (trimmedPhone.startsWith('+')) {
    const normalizedPhone = `+${trimmedPhone.slice(1).replace(/\D/g, '')}`

    return isValidE164PhoneNumber(normalizedPhone) ? normalizedPhone : null
  }

  if (trimmedPhone.startsWith('00')) {
    const normalizedPhone = `+${trimmedPhone.slice(2).replace(/\D/g, '')}`

    return isValidE164PhoneNumber(normalizedPhone) ? normalizedPhone : null
  }

  const digitsOnly = trimmedPhone.replace(/\D/g, '')

  if (digitsOnly.length === 8) {
    const normalizedPhone = `+${NORWAY_COUNTRY_CODE}${digitsOnly}`

    return isValidE164PhoneNumber(normalizedPhone) ? normalizedPhone : null
  }

  if (
    digitsOnly.length === 10 &&
    digitsOnly.startsWith(NORWAY_COUNTRY_CODE)
  ) {
    const normalizedPhone = `+${digitsOnly}`

    return isValidE164PhoneNumber(normalizedPhone) ? normalizedPhone : null
  }

  return null
}
