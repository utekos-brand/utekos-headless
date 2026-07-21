import type { CanonicalEvent } from '../canonicalEvent'
import {
  canonicalSignalNames,
  type CanonicalSignalAuditEntry,
  type CanonicalSignalName,
  type CanonicalSignalRule
} from '../canonicalSignalContract'
import { getEventCatalogEntry } from '../eventCatalog'
import { readCanonicalSignalValues } from '../readCanonicalSignalValues'

export type CanonicalSignalContractIssueCode =
  | 'missing_signal_audit'
  | 'missing_required_value'
  | 'present_audit_without_value'
  | 'unavailable_audit_with_value'
  | 'disallowed_signal_source'
  | 'disallowed_unavailable_reason'
  | 'unavailable_reason_conflicts_with_consent'
  | 'missing_meta_fbc_for_fbclid'

export type CanonicalSignalContractIssue = {
  code: CanonicalSignalContractIssueCode
  signal?: CanonicalSignalName
}

export type CanonicalSignalContractResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: CanonicalSignalContractIssue[] }

function hasSignalValue(value: unknown): boolean {
  if (typeof value === 'string') return value.length > 0

  if (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    return Object.keys(value).length > 0
  }

  return false
}

function requiresValue(
  rule: CanonicalSignalRule,
  marketingGranted: boolean,
  auditEntry: CanonicalSignalAuditEntry,
  hasValue: boolean
): boolean {
  switch (rule.requirement) {
    case 'required':
      return true
    case 'required_when_marketing_granted':
      return marketingGranted
    case 'required_when_observed':
      return auditEntry.state === 'present' || hasValue
    case 'required_from_attribution_snapshot':
      return auditEntry.state === 'present'
    case 'not_applicable':
      return false
  }
}

export function validateCanonicalSignalContract(
  event: CanonicalEvent
): CanonicalSignalContractResult {
  if (!event.signal_audit) {
    return {
      ok: false,
      issues: [{ code: 'missing_signal_audit' }]
    }
  }

  const values = readCanonicalSignalValues(event)
  const policy = getEventCatalogEntry(event.event_name).signals
  const marketingGranted = event.consent.marketing === 'granted'

  const valuesBySignal: Record<CanonicalSignalName, unknown> = {
    event_source_url: values.event_source_url,
    client_ip_address: values.client_ip_address,
    client_user_agent: values.client_user_agent,
    external_id: values.external_id,
    click_ids: values.click_ids,
    meta_fbclid: values.fbclid,
    meta_fbc: values.fbc,
    meta_fbp: values.fbp
  }

  const issues: CanonicalSignalContractIssue[] = []

  for (const signal of canonicalSignalNames) {
    const auditEntry = event.signal_audit[signal]
    const rule = policy[signal]
    const hasValue = hasSignalValue(valuesBySignal[signal])

    if (auditEntry.state === 'present') {
      if (!hasValue) {
        issues.push({
          code: 'present_audit_without_value',
          signal
        })
      }

      if (!rule.allowedSources.includes(auditEntry.source)) {
        issues.push({ code: 'disallowed_signal_source', signal })
      }
    } else {
      if (hasValue) {
        issues.push({
          code: 'unavailable_audit_with_value',
          signal
        })
      }

      if (
        !rule.allowedUnavailableReasons.includes(
          auditEntry.reason
        )
      ) {
        issues.push({
          code: 'disallowed_unavailable_reason',
          signal
        })
      }

      if (
        marketingGranted &&
        auditEntry.reason === 'consent_denied'
      ) {
        issues.push({
          code: 'unavailable_reason_conflicts_with_consent',
          signal
        })
      }
    }

    if (
      requiresValue(
        rule,
        marketingGranted,
        auditEntry,
        hasValue
      ) &&
      !hasValue
    ) {
      issues.push({ code: 'missing_required_value', signal })
    }
  }

  if (marketingGranted && values.fbclid && !values.fbc) {
    issues.push({
      code: 'missing_meta_fbc_for_fbclid',
      signal: 'meta_fbc'
    })
  }

  return issues.length === 0 ?
      { ok: true, issues: [] }
    : { ok: false, issues }
}

export class CanonicalSignalContractError extends Error {
  readonly issues: CanonicalSignalContractIssue[]

  constructor(issues: CanonicalSignalContractIssue[]) {
    super(
      `Canonical signal contract failed: ${issues
        .map(issue =>
          issue.signal ?
            `${issue.code}:${issue.signal}`
          : issue.code
        )
        .join(', ')}`
    )
    this.name = 'CanonicalSignalContractError'
    this.issues = issues
  }
}

export function assertCanonicalSignalContract(
  event: CanonicalEvent
): void {
  const result = validateCanonicalSignalContract(event)

  if (!result.ok) {
    throw new CanonicalSignalContractError(result.issues)
  }
}
