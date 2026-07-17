import { createCanonicalCollectorTransport } from './createCanonicalCollectorTransport'
import type { CanonicalFormError } from './formErrorEvent'

export const startFormErrorCollectorTransport =
  createCanonicalCollectorTransport<CanonicalFormError>({
    analyticsEventName: 'form_error',
    endpoint: '/api/events/form-error'
  })
