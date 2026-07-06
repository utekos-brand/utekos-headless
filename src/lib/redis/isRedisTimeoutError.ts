export function isRedisTimeoutError(cause: Error): boolean {
  const errorType = cause.constructor.name
  return (
    cause.name === 'ConnectionTimeoutError' ||
    cause.name === 'SocketTimeoutError' ||
    errorType === 'ConnectionTimeoutError' ||
    errorType === 'SocketTimeoutError' ||
    cause.message.toLowerCase().includes('timeout')
  )
}
