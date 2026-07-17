type EventDeviceInfoInput = {
  language?: string
  pixelRatio?: number
  platform?: string
  screenHeight?: number
  screenWidth?: number
  userAgent?: string
  viewportHeight?: number
  viewportWidth?: number
}

export function mapEventDeviceInfo(input: EventDeviceInfoInput | undefined) {
  if (!input) return undefined

  const deviceInfo = {
    ...(input.language ? { language: input.language } : {}),
    ...(input.pixelRatio === undefined ?
      {}
    : { pixel_ratio: input.pixelRatio }),
    ...(input.platform ? { platform: input.platform } : {}),
    ...(input.screenHeight === undefined ?
      {}
    : { screen_height: input.screenHeight }),
    ...(input.screenWidth === undefined ?
      {}
    : { screen_width: input.screenWidth }),
    ...(input.userAgent ? { user_agent: input.userAgent } : {}),
    ...(input.viewportHeight === undefined ?
      {}
    : { viewport_height: input.viewportHeight }),
    ...(input.viewportWidth === undefined ?
      {}
    : { viewport_width: input.viewportWidth })
  }

  return Object.keys(deviceInfo).length > 0 ? deviceInfo : undefined
}
