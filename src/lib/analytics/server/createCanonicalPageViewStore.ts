import type { CanonicalEventStore } from './canonicalEventStore'
import {
  mapCanonicalPageViewPersistence,
  type CanonicalLedgerInsert,
  type ProviderDispatchInsert
} from './mapCanonicalPageViewPersistence'

export type CanonicalPageViewTransaction = {
  insertDispatch: (row: ProviderDispatchInsert) => Promise<void>
  insertLedger: (row: CanonicalLedgerInsert) => Promise<boolean>
}

export type CanonicalPageViewTransactionRunner = (
  work: (
    transaction: CanonicalPageViewTransaction
  ) => Promise<'duplicate' | 'inserted'>
) => Promise<'duplicate' | 'inserted'>

export function createCanonicalPageViewStore(
  runTransaction: CanonicalPageViewTransactionRunner
): CanonicalEventStore {
  return {
    accept: input =>
      runTransaction(async transaction => {
        const rows = mapCanonicalPageViewPersistence(input)
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
