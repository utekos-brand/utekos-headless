// Path: src/db/zod/schemas/MenuItemSchema.ts
import { z } from '@/db/zod/zodConfig'
import type { MenuItem } from '@types'

/**
 * Schema for validating Shopify menu item structure.
 * @why Validates menu data from Shopify API which only provides URL
 */
export const MenuItemSchema: z.ZodType<MenuItem> = z.lazy(() =>
  z.object({
    title: z.string().min(1, {
      message: 'Menyelement må ha en tittel.'
    }),
    url: z.string().url({
      message: 'Menyelement må ha en gyldig URL.'
    }),
    items: z.array(MenuItemSchema).optional()
  })
)

export const MenuItemJSONSchema = z.toJSONSchema(MenuItemSchema)
