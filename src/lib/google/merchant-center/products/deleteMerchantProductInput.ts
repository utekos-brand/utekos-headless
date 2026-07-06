import { merchantApiRequest } from '../merchantApiRequest'

export async function deleteMerchantProductInput(
  productInputName: string,
  dataSourceName: string
) {
  await merchantApiRequest({
    path: `/products/v1/${productInputName}`,
    method: 'DELETE',
    searchParams: {
      dataSource: dataSourceName
    }
  })
}
