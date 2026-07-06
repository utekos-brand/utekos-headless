export function normalizeCustomerMatchEmail(email: string) {
  const compactEmail = email.trim().toLowerCase().replace(/\s+/g, '')
  const atIndex = compactEmail.lastIndexOf('@')

  if (atIndex <= 0 || atIndex === compactEmail.length - 1) {
    return null
  }

  const rawLocalPart = compactEmail.slice(0, atIndex)
  const domain = compactEmail.slice(atIndex + 1)

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    const localPartWithoutPlus = rawLocalPart.split('+')[0] ?? ''
    const normalizedLocalPart = localPartWithoutPlus.replace(/\./g, '')

    return normalizedLocalPart
      ? `${normalizedLocalPart}@${domain}`
      : null
  }

  return `${rawLocalPart}@${domain}`
}
