import {
  syncMetaDatasetQuality,
  type MetaDatasetQualitySyncResult
} from '../../../../lib/analytics/server/syncMetaDatasetQuality'
import { hasValidCronAuthorization } from '../../../../lib/security/hasValidCronAuthorization'

export const maxDuration = 60

export type MetaDatasetQualityCronDependencies = {
  getCronSecret: () => string | undefined
  sync: () => Promise<MetaDatasetQualitySyncResult>
}

const defaultDependencies: MetaDatasetQualityCronDependencies = {
  getCronSecret: () => process.env.CRON_SECRET,
  sync: syncMetaDatasetQuality
}

export async function handleMetaDatasetQualityCron(
  request: Request,
  dependencies: MetaDatasetQualityCronDependencies = defaultDependencies
) {
  const authorized = hasValidCronAuthorization(
    request.headers.get('authorization'),
    dependencies.getCronSecret()
  )

  if (!authorized) {
    return Response.json(
      { ok: false },
      { headers: { 'Cache-Control': 'no-store' }, status: 401 }
    )
  }

  const result = await dependencies.sync()

  return Response.json(
    { ...result, ok: true },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

export function GET(request: Request) {
  return handleMetaDatasetQualityCron(request)
}
