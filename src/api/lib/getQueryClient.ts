import { cache } from 'react'
import { makeQueryClient } from './makeQueryClient'

export const getQueryClient = cache(makeQueryClient)
