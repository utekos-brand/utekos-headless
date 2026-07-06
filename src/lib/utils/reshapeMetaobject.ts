// Path: src/lib/utils/reshapeMetaobject.ts

import type {
  MetaobjectField,
  RawField,
  RawMetaobject,
  RawMetaobjectFieldKey
} from 'types/product/MetaobjectReference'
import type { Image } from 'types/media'
import { toCamelCase } from './toCamelCase'

const explicitFieldKeys = [
  'images',
  'subtitle',
  'colorLabel',
  'backgroundColor',
  'swatchHexcolorForVariant',
  'swatchHexcolorForUnselectedVariant',
  'length',
  'centerToWrist',
  'flatWidth'
] satisfies RawMetaobjectFieldKey[]

type ReshapedMetaobject = Record<string, MetaobjectField | Image[]>

function getRawMetaobjectFields(input: RawMetaobject | RawField[] | undefined | null) {
  if (!input) return []
  if (Array.isArray(input)) return input
  if (input.fields) return input.fields.filter(Boolean)

  return explicitFieldKeys.flatMap(key => {
    const field = input[key]
    return field ? [field] : []
  })
}

export function reshapeMetaobject(input: RawMetaobject | RawField[] | undefined | null): ReshapedMetaobject {
  const fields = getRawMetaobjectFields(input)

  return fields.reduce<ReshapedMetaobject>((acc, field) => {
    if (!field.key) return acc
    const camelKey = toCamelCase(field.key)

    if (field.references?.nodes) {
      acc[camelKey] = field.references.nodes
        .map(node => node.image)
        .filter((image): image is Image => Boolean(image))
    } else {
      acc[camelKey] = { value: field.value ?? null }
    }
    return acc
  }, {})
}
