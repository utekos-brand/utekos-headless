import {
  IngestionServiceClient,
  protos
} from '@google-ads/datamanager'
import { getVercelOidcToken } from '@vercel/oidc'
import {
  ExternalAccountClient,
  type BaseExternalAccountClient,
  type IdentityPoolClientOptions
} from 'google-auth-library'

const DATA_MANAGER_SCOPES = [
  'https://www.googleapis.com/auth/datamanager',
  'https://www.googleapis.com/auth/cloud-platform'
] as const

type Environment = Readonly<
  Record<string, string | undefined>
>

type LocalAdcConfig = {
  mode: 'local_adc'
}

type VercelOidcConfig = {
  audience: string
  mode: 'vercel_oidc'
  projectId: string
  serviceAccountEmail: string
}

export type GoogleDataManagerAuthConfig =
  | LocalAdcConfig
  | VercelOidcConfig

type GoogleDataManagerCallOptions = {
  timeout: number
}

export type GoogleDataManagerIngestionClient = {
  ingestEvents: (
    request:
      protos.google.ads.datamanager.v1.IIngestEventsRequest,
    options: GoogleDataManagerCallOptions
  ) => Promise<
    readonly [
      protos.google.ads.datamanager.v1.IIngestEventsResponse,
      ...unknown[]
    ]
  >
}

type IngestionClientOptions = {
  authClient: BaseExternalAccountClient
  projectId: string
}

type OidcTokenOptions = {
  audience: string
}

export type GoogleDataManagerAuthDependencies = {
  createExternalAccountClient: (
    options: IdentityPoolClientOptions
  ) => BaseExternalAccountClient | null
  createIngestionClient: (
    options?: IngestionClientOptions
  ) => GoogleDataManagerIngestionClient
  getOidcToken: (
    options: OidcTokenOptions
  ) => Promise<string>
}

const defaultDependencies:
  GoogleDataManagerAuthDependencies = {
    createExternalAccountClient: options =>
      ExternalAccountClient.fromJSON(options),

    createIngestionClient: options => {
      if (!options) {
        return new IngestionServiceClient()
      }

      return new IngestionServiceClient({
        // google-gax og appen kan resolve ulike
        // patchversjoner av google-auth-library.
        // Runtime-kontrakten er AuthClient.
        authClient: options.authClient as never,
        projectId: options.projectId
      })
    },

    getOidcToken: getVercelOidcToken
  }

function requiredEnvironmentValue(
  environment: Environment,
  name: string
) {
  const value = environment[name]?.trim()

  if (!value) {
    throw new Error(
      `Missing required Google Data Manager auth configuration: ${name}`
    )
  }

  return value
}

export function readGoogleDataManagerAuthConfig(
  environment: Environment = process.env
): GoogleDataManagerAuthConfig {
  if (environment.VERCEL !== '1') {
    return {
      mode: 'local_adc'
    }
  }

  const projectId = requiredEnvironmentValue(
    environment,
    'GCP_PROJECT_ID'
  )

  const serviceAccountEmail =
    requiredEnvironmentValue(
      environment,
      'GCP_SERVICE_ACCOUNT_EMAIL'
    )

  const audience = requiredEnvironmentValue(
    environment,
    'GCP_AUDIENCE'
  )

  if (
    !/^\/\/iam\.googleapis\.com\/projects\/\d+\/locations\/global\/workloadIdentityPools\/[A-Za-z0-9._-]+\/providers\/[A-Za-z0-9._-]+$/.test(
      audience
    )
  ) {
    throw new Error(
      'GCP_AUDIENCE must be a canonical Google Workload Identity provider resource name'
    )
  }

  if (
    !/^[A-Za-z0-9._-]+@[a-z0-9-]+\.iam\.gserviceaccount\.com$/.test(
      serviceAccountEmail
    )
  ) {
    throw new Error(
      'GCP_SERVICE_ACCOUNT_EMAIL must be a Google service account email'
    )
  }

  return {
    audience,
    mode: 'vercel_oidc',
    projectId,
    serviceAccountEmail
  }
}

export function createGoogleDataManagerIngestionClient(
  environment: Environment = process.env,
  dependencies: GoogleDataManagerAuthDependencies =
    defaultDependencies
): GoogleDataManagerIngestionClient {
  const config =
    readGoogleDataManagerAuthConfig(environment)

  if (config.mode === 'local_adc') {
    return dependencies.createIngestionClient()
  }

  const authClient =
    dependencies.createExternalAccountClient({
      type: 'external_account',
      audience: config.audience,
      subject_token_type:
        'urn:ietf:params:oauth:token-type:jwt',
      token_url:
        'https://sts.googleapis.com/v1/token',
      service_account_impersonation_url:
        `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${config.serviceAccountEmail}:generateAccessToken`,
      scopes: [...DATA_MANAGER_SCOPES],
      subject_token_supplier: {
        getSubjectToken: () =>
          dependencies.getOidcToken({
            audience: config.audience
          })
      }
    })

  if (!authClient) {
    throw new Error(
      'Could not create Google external account client'
    )
  }

  return dependencies.createIngestionClient({
    authClient,
    projectId: config.projectId
  })
}
