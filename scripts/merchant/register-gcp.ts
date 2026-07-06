import { z } from 'zod'

import { getMerchantCenterConfig } from '../../src/lib/google/merchant-center/config'
import { registerMerchantGcp } from '../../src/lib/google/merchant-center/developerRegistration/registerMerchantGcp'
import { getMerchantApiDiagnostic } from '../../src/lib/google/merchant-center/getMerchantApiDiagnostic'

function buildEnvSchema(accountId: string) {
  return z.object({
    MERCHANT_DEVELOPER_EMAIL: z.string().email().refine(
      value => !value.endsWith('.iam.gserviceaccount.com'),
      'Use a human Google account email, not a service account email.'
    ),
    MERCHANT_REGISTER_GCP_CONFIRM: z.literal(`REGISTER_GCP_FOR_${accountId}`)
  })
}

function getCliValue(name: string) {
  const args = process.argv.slice(2)
  const equalsPrefix = `--${name}=`
  const equalsArg = args.find(arg => arg.startsWith(equalsPrefix))

  if (equalsArg) {
    return equalsArg.slice(equalsPrefix.length)
  }

  const nameIndex = args.indexOf(`--${name}`)

  if (nameIndex === -1) {
    return undefined
  }

  return args[nameIndex + 1]
}

async function main() {
  const config = getMerchantCenterConfig()
  const developerEmail =
    process.env.MERCHANT_DEVELOPER_EMAIL ?? getCliValue('developer-email')
  const confirmation =
    process.env.MERCHANT_REGISTER_GCP_CONFIRM ?? getCliValue('confirm')
  const parsedEnv = buildEnvSchema(config.accountId).safeParse({
    MERCHANT_DEVELOPER_EMAIL: developerEmail,
    MERCHANT_REGISTER_GCP_CONFIRM: confirmation
  })

  if (!parsedEnv.success) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          blocked: 'explicit_confirmation_required',
          accountId: config.accountId,
          requiredEnv: {
            MERCHANT_DEVELOPER_EMAIL: 'A human Google account email, not a service account email.',
            MERCHANT_REGISTER_GCP_CONFIRM: `REGISTER_GCP_FOR_${config.accountId}`
          },
          examples: {
            inlineEnv:
              `MERCHANT_DEVELOPER_EMAIL=<human-google-email> MERCHANT_REGISTER_GCP_CONFIRM=REGISTER_GCP_FOR_${config.accountId} npm run merchant:register-gcp`,
            exportedEnv:
              `export MERCHANT_DEVELOPER_EMAIL=<human-google-email> MERCHANT_REGISTER_GCP_CONFIRM=REGISTER_GCP_FOR_${config.accountId}`,
            cliArgs:
              `npm run merchant:register-gcp -- --developer-email=<human-google-email> --confirm=REGISTER_GCP_FOR_${config.accountId}`
          },
          validation: parsedEnv.error.format()
        },
        null,
        2
      )
    )
    process.exitCode = 1
    return
  }

  try {
    const registration = await registerMerchantGcp(parsedEnv.data.MERCHANT_DEVELOPER_EMAIL)

    console.log(
      JSON.stringify(
        {
          ok: true,
          accountId: config.accountId,
          registration
        },
        null,
        2
      )
    )
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          accountId: config.accountId,
          diagnostic: getMerchantApiDiagnostic(error)
        },
        null,
        2
      )
    )
    process.exitCode = 1
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
