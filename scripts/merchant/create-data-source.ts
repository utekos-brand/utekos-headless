import { z } from 'zod'

import {
  getMerchantCenterConfig,
  MERCHANT_CENTER_DEFAULTS
} from '../../src/lib/google/merchant-center/config'
import { createMerchantProductDataSource } from '../../src/lib/google/merchant-center/dataSources/createMerchantProductDataSource'
import { listMerchantDataSources } from '../../src/lib/google/merchant-center/dataSources/listMerchantDataSources'
import { getMerchantApiDiagnostic } from '../../src/lib/google/merchant-center/getMerchantApiDiagnostic'

function buildEnvSchema(accountId: string) {
  return z.object({
    MERCHANT_CREATE_DATA_SOURCE_CONFIRM: z.literal(
      `CREATE_MERCHANT_DATA_SOURCE_${accountId}`
    )
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

function summarizeDataSources(dataSources: Awaited<ReturnType<typeof listMerchantDataSources>>) {
  return dataSources.map(dataSource => ({
    name: dataSource.name,
    dataSourceId: dataSource.dataSourceId,
    displayName: dataSource.displayName,
    input: dataSource.input,
    primaryProductDataSource: dataSource.primaryProductDataSource,
    supplemental: Boolean(dataSource.supplementalProductDataSource)
  }))
}

async function main() {
  const config = getMerchantCenterConfig()
  const confirmation =
    process.env.MERCHANT_CREATE_DATA_SOURCE_CONFIRM ?? getCliValue('confirm')
  const parsedEnv = buildEnvSchema(config.accountId).safeParse({
    MERCHANT_CREATE_DATA_SOURCE_CONFIRM: confirmation
  })

  if (!parsedEnv.success) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          blocked: 'explicit_confirmation_required',
          accountId: config.accountId,
          willCreate: {
            displayName: config.primaryDataSourceDisplayName,
            primaryProductDataSource: {
              feedLabel: MERCHANT_CENTER_DEFAULTS.feedLabel,
              contentLanguage: MERCHANT_CENTER_DEFAULTS.contentLanguage,
              countries: [MERCHANT_CENTER_DEFAULTS.countryCode]
            }
          },
          requiredEnv: {
            MERCHANT_CREATE_DATA_SOURCE_CONFIRM:
              `CREATE_MERCHANT_DATA_SOURCE_${config.accountId}`
          },
          examples: {
            inlineEnv:
              `MERCHANT_CREATE_DATA_SOURCE_CONFIRM=CREATE_MERCHANT_DATA_SOURCE_${config.accountId} npm run merchant:create-data-source`,
            cliArgs:
              `npm run merchant:create-data-source -- --confirm=CREATE_MERCHANT_DATA_SOURCE_${config.accountId}`
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
    const existingDataSources = await listMerchantDataSources()
    const existingCanonicalDataSource = existingDataSources.find(
      dataSource =>
        dataSource.input === 'API' &&
        Boolean(dataSource.primaryProductDataSource) &&
        dataSource.displayName === config.primaryDataSourceDisplayName
    )

    if (existingCanonicalDataSource) {
      console.log(
        JSON.stringify(
          {
            ok: true,
            created: false,
            accountId: config.accountId,
            dataSource: existingCanonicalDataSource,
            dataSources: summarizeDataSources(existingDataSources)
          },
          null,
          2
        )
      )
      return
    }

    const createdDataSource = await createMerchantProductDataSource()
    const refreshedDataSources = await listMerchantDataSources()

    console.log(
      JSON.stringify(
        {
          ok: true,
          created: true,
          accountId: config.accountId,
          dataSource: createdDataSource,
          dataSources: summarizeDataSources(refreshedDataSources)
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
