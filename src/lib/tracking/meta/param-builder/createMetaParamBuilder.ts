import { ParamBuilder } from 'capi-param-builder-nodejs'

export function createMetaParamBuilder(): ParamBuilder {
  return new ParamBuilder(['utekos.no', 'localhost'])
}
