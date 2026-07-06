// Path: src/db/zod/zodClient.ts
'use client'
import * as z from 'zod/mini'
import { createErrorMap } from 'zod-validation-error'

z.config({
  customError: createErrorMap({
    displayInvalidFormatDetails: true,
    maxAllowedValuesToDisplay: 5,
    maxUnrecognizedKeysToDisplay: 3,
    allowedValuesSeparator: ', ',
    allowedValuesLastSeparator: ' eller ',
    wrapAllowedValuesInQuote: true
  })
})

export { z }
