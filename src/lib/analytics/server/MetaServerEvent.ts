import {
  ParamBuilder,
  type PlainDataObject
} from 'capi-param-builder-nodejs'
import {
  ServerEvent,
  UserData
} from 'facebook-nodejs-business-sdk'

export class MetaServerEvent extends ServerEvent {
  private metaParameterBuilder: ParamBuilder | undefined
  private metaReferrerUrl: string | undefined

  setRequestContext(context: PlainDataObject): this {
    const builder = new ParamBuilder()
    builder.processRequestFromContext(context)
    this.metaParameterBuilder = builder
    return this
  }

  setReferrerUrl(referrerUrl: string): this {
    this.metaReferrerUrl = referrerUrl
    return this
  }

  private applyParameterBuilderDefaults() {
    const builder = this.metaParameterBuilder
    if (!builder) return

    const userData = this.user_data ?? new UserData()
    const fbc = builder.getFbc()
    const fbp = builder.getFbp()
    const clientIpAddress = builder.getClientIpAddress()
    const eventSourceUrl = builder.getEventSourceUrl()
    const referrerUrl = builder.getReferrerUrl()

    if (!userData.fbc && fbc) userData.setFbc(fbc)
    if (!userData.fbp && fbp) userData.setFbp(fbp)
    if (!userData.client_ip_address && clientIpAddress) {
      userData.setClientIpAddress(clientIpAddress)
    }
    this.setUserData(userData)

    if (!this.event_source_url && eventSourceUrl) {
      this.setEventSourceUrl(eventSourceUrl)
    }
    if (!this.metaReferrerUrl && referrerUrl) {
      this.setReferrerUrl(referrerUrl)
    }
  }

  normalize() {
    this.applyParameterBuilderDefaults()
    const payload = super.normalize()

    if (this.metaReferrerUrl) {
      payload.referrer_url = this.metaReferrerUrl
    }

    return payload
  }
}
