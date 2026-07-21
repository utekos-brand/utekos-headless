import type { CanonicalEventStore } from './canonicalEventStore'
import {
  mapCanonicalEventSourceEvidencePersistence,
  type CanonicalEventSourceEvidenceInsert
} from './canonicalEventSourceEvidence'
import {
  mapCanonicalEventPersistence,
  type CanonicalLedgerInsert,
  type ProviderDispatchInsert
} from './mapCanonicalEventPersistence'

export type CanonicalEventTransaction = {
  insertDispatch: (row: ProviderDispatchInsert) => Promise<void>
  insertLedger: (row: CanonicalLedgerInsert) => Promise<boolean>
  upsertSourceEvidence: (
    row: CanonicalEventSourceEvidenceInsert
  ) => Promise<void>
}

export type CanonicalEventTransactionRunner = (
  work: (
    transaction: CanonicalEventTransaction
  ) => Promise<'duplicate' | 'inserted'>
) => Promise<'duplicate' | 'inserted'>

export function createCanonicalEventStore(
  runTransaction: CanonicalEventTransactionRunner
): CanonicalEventStore {
  return {
    accept: input =>
      runTransaction(async transaction => {
        const rows = mapCanonicalEventPersistence(input)
        const sourceEvidence =
          input.sourceEvidence === undefined ?
            undefined
          : mapCanonicalEventSourceEvidencePersistence({
              event: input.event,
              sourceEvidence: input.sourceEvidence
            })
        const inserted = await transaction.insertLedger(
          rows.ledger
        )

        if (sourceEvidence) {
          await transaction.upsertSourceEvidence(sourceEvidence)
        }

        if (!inserted) return 'duplicate'

        for (const dispatch of rows.dispatches) {
          await transaction.insertDispatch(dispatch)
        }

        return 'inserted'
      })
  }
}
