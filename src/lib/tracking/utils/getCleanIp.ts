export function getCleanIp(ipString: string | null | undefined): string | undefined {
  if (!ipString) return undefined
  const cleanIp = ipString.split(',')[0]?.trim()

  if (!cleanIp || cleanIp.length < 7 || (!cleanIp.includes('.') && !cleanIp.includes(':'))) {
    return undefined
  }

  return cleanIp
}
