export function getTrackingIdempotencyKey(eventName: string, eventId: string): string {
  return `${eventName}:${eventId}`
}
