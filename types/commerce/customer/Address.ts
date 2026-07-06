// Path: types/commerce/customer/Address.ts

export type Address = {
  id: number | undefined
  customer_id: number | undefined
  first_name: string | null
  last_name: string | null
  company: string | null
  address1: string | null
  address2: string | null
  city: string | null
  province: string | null
  country: string | null
  zip: string | null
  phone: string | null
  name: string | null
  province_code: string | null
  country_code: string | null
  country_name: string | null | undefined
  latitude: number | null
  longitude: number | null
  default: boolean | undefined
}
