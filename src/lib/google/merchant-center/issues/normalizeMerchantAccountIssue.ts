import type { MerchantAccountIssue } from '../merchantCenterTypes'

export function normalizeMerchantAccountIssue(issue: MerchantAccountIssue) {
  return {
    name: issue.name,
    title: issue.title ?? issue.name.split('/').pop() ?? 'Unknown issue',
    severity: issue.severity ?? 'SEVERITY_UNSPECIFIED',
    detail: issue.detail ?? null,
    documentationUri: issue.documentationUri ?? null,
    impactedDestinations:
      issue.impactedDestinations?.map(destination => ({
        reportingContext: destination.reportingContext ?? null,
        impacts:
          destination.impacts?.map(impact => ({
            regionCode: impact.regionCode ?? null,
            severity: impact.severity ?? 'SEVERITY_UNSPECIFIED'
          })) ?? []
      })) ?? []
  }
}
