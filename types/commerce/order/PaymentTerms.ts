// Path: types/commerce/order/PaymentTerms.ts

export type PaymentTerms = {
  amount: number
  currency: string
  payment_terms_name: string
  payment_terms_type: string
  due_in_days: number
  payment_schedules: Array<{
    amount: number
    currency: string
    issued_at: string
    due_at: string
    completed_at: string | null
    expected_payment_method: string
  }>
}
