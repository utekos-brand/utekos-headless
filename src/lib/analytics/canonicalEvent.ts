import { z } from 'zod'
import { canonicalPageViewSchema } from './pageViewEvent'
import { canonicalViewItemSchema } from './viewItemEvent'

export const canonicalEventSchema = z.discriminatedUnion(
  'event_name',
  [canonicalPageViewSchema, canonicalViewItemSchema]
)

export type CanonicalEvent = z.infer<typeof canonicalEventSchema>
export type ImplementedCanonicalEventName =
  CanonicalEvent['event_name']

export function parseCanonicalEvent(
  input: unknown
): CanonicalEvent {
  return canonicalEventSchema.parse(input)
}
