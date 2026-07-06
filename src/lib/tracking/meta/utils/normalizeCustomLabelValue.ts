// Path: src/lib/tracking/meta/utils/normalizeCustomLabelValue.ts

export function normalizeCustomLabelValue(value: string | undefined) {
  const trimmedValue = value?.trim()
  return trimmedValue ? trimmedValue : undefined
}
