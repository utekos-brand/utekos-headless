import type { Connection } from '@types'

export const removeEdgesAndNodes = <T>(array: Connection<T>): T[] =>
  array.edges.map(edge => edge?.node)
