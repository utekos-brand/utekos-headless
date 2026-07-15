export function buildCustomerLoginHref({
  mode,
  returnTo
}: {
  mode: 'login' | 'create'
  returnTo: string
}) {
  const searchParams = new URLSearchParams({ mode, returnTo })

  return `/customer/account/login?${searchParams.toString()}`
}
