import { USERCENTRICS_REQUIRED_TRACKING_SERVICE_NAMES } from './usercentricsConfig'

export function getMissingRequiredUsercentricsServices(services: Record<string, boolean>): string[] {
  return USERCENTRICS_REQUIRED_TRACKING_SERVICE_NAMES.filter(serviceName => !(serviceName in services))
}
