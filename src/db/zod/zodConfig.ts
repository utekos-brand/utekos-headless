// Path: src/db/zod/zodConfig.ts

import * as z from 'zod'
import { createErrorMap } from 'zod-validation-error'

/**
 * Global Zod-konfigurasjon (SERVER-ONLY)
 * - Norsk feilkart via zod-validation-error
 * - “Poisoned” med `server-only` slik at import fra klient feiler ved build
 * - Bruk denne **kun** i serverkode (route handlers, RSC, server actions)
 * - For klient: bruk `src/db/zod/zodClient.ts` (Zod Mini)
 */

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
