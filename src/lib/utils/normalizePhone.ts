// Path: src/utils/normalizePhone.ts

export function normalizePhone(phone: string | undefined): string | undefined {
  if (!phone) return undefined
  return phone.replace(/[^0-9]/g, '')
}
