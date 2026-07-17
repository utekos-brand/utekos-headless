import type { CanonicalEventStore } from './canonicalEventStore'
import {
  mapCanonicalEventPersistence,
  type CanonicalLedgerInsert,
  type ProviderDispatchInsert
} from './mapCanonicalEventPersistence'

export type CanonicalEventTransaction = {
  insertDispatch: (row: ProviderDispatchInsert) => Promise<void>
  insertLedger: (row: CanonicalLedgerInsert) => Promise<boolean>
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
        const inserted = await transaction.insertLedger(
          rows.ledger
        )

        if (!inserted) return 'duplicate'

        for (const dispatch of rows.dispatches) {
          await transaction.insertDispatch(dispatch)
        }

        return 'inserted'
      })
  }
}
