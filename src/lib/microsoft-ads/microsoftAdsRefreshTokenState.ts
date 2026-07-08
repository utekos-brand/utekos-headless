let rotatedRefreshToken: string | undefined

export function getMicrosoftAdsRefreshToken(envRefreshToken: string): string {
  return rotatedRefreshToken ?? envRefreshToken
}

export function setMicrosoftAdsRotatedRefreshToken(refreshToken: string): void {
  rotatedRefreshToken = refreshToken
}

export function resetMicrosoftAdsRefreshTokenStateForTests(): void {
  rotatedRefreshToken = undefined
}
