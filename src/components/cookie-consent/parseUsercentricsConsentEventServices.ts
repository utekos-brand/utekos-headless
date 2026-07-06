import { usercentricsConsentEventDetailSchema } from './usercentricsConsentSchema'

export function parseUsercentricsConsentEventServices(detail: unknown): Record<string, boolean> | null {
  const parsedDetail = usercentricsConsentEventDetailSchema.safeParse(detail)

  if (!parsedDetail.success) {
    return null
  }

  return Object.fromEntries(
    Object.entries(parsedDetail.data).filter(([, value]) => typeof value === 'boolean')
  ) as Record<string, boolean>
}
