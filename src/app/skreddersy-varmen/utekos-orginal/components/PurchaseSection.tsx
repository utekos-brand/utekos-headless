'use client'

import { useMicrofiberLogic } from '@/hooks/useMicrofiberLogic'
import { MicrofiberView } from './MicrofiberView'

export function PurchaseSection() {
  const logic = useMicrofiberLogic()

  return <MicrofiberView {...logic} />
}
