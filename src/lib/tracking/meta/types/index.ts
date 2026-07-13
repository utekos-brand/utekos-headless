export type MetaApiError = Error & {
  response?: {
    status?: number
    data?: {
      error?: {
        code?: number
        error_subcode?: number
        fbtrace_id?: string
        message?: string
        type?: string
      }
    }
  }
}

export type MetaCatalogAvailability = 'in stock' | 'out of stock'
export type MetaCatalogCondition = 'new'
export type MetaCatalogAgeGroup = 'adult'
export type MetaCatalogGender = 'unisex'
