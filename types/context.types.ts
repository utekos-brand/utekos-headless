import type { ProductState } from '@types'

export type ProductContextType = {
  state: ProductState
  updateOption: (name: string, value: string) => void
  updateImage: (index: string) => void
  isPending: boolean
}
