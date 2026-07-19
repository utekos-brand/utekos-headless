import { handleMetaDatasetQualityCron } from '../meta-dataset-quality/route'

export const maxDuration = 60

export function GET(request: Request) {
  return handleMetaDatasetQualityCron(request)
}
