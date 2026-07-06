export type DefaultsProps = Record<string, unknown>
export type Contexts = Array<Record<string, unknown>>

/**
 * Overrides default props with values from context.
 *
 * "undefined" is considered the default value of a prop
 * unless otherwise provided
 *
 * @param props object of component properties
 * @param defaults object of default values
 * @param contexts one or more contexts to merge
 * @returns merged properties
 */
export function extendPropsWithContext<
  Props extends Record<string, unknown>
>(
  props: Props,
  defaults: DefaultsProps = {},
  ...contexts: Contexts
) {
  props = { ...defaults, ...props }
  return {
    ...props,
    ...reduceContextHasValue(props, defaults, contexts)
  }
}

/**
 * Like extendPropsWithContext, but only merges context values
 * for props that already exist on the props object.
 * This prevents unknown context keys from leaking into
 * the component and potentially reaching DOM attributes.
 */
export function extendExistingPropsWithContext<
  Props extends Record<string, unknown> = Record<string, unknown>
>(
  props: Props,
  defaults: DefaultsProps = {},
  ...contexts: Contexts
) {
  return {
    ...props,
    ...reduceContextHasValue(props, defaults, contexts, {
      onlyMergeExistingProps: true
    })
  }
}

export function reduceContext(contexts: Contexts) {
  return contexts.reduce((acc, cur) => {
    if (cur) {
      acc = { ...acc, ...cur }
    }
    return acc
  }, {})
}

function reduceContextHasValue<
  Props extends Record<string, unknown> = Record<string, unknown>
>(
  props: Props,
  defaults: DefaultsProps,
  contexts: Contexts,
  { onlyMergeExistingProps = false } = {}
) {
  const context = reduceContext(contexts)
  return Object.entries(context).reduce((acc, [key, value]) => {
    if (
      // An optional check to only merge existing props from context
      !onlyMergeExistingProps ||
      Object.prototype.hasOwnProperty.call(props, key)
    ) {
      if (
        props[key as keyof typeof props] ===
        defaults?.[key as keyof typeof defaults]
      ) {
        // Existing props can only be overridden if it has default value
        // But a prop that does not exist will also be merged (as long as the default value is "undefined")
        acc[key as keyof typeof acc] = value as unknown as never
      }
    }

    return acc
  }, {})
}
