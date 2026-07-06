import { z } from 'zod'
import raw from './color-tokens.json'

const nullableString = z.string().nullable()
const nullableNumber = z.number().nullable()

const brandColorCmykSchema = z.object({
  value: nullableString,
  source: nullableString
})

const brandColorSourceSchema = z.object({
  file: z.string(),
  rawValue: z.string()
})

const brandColorRelationshipSchema = z.object({
  sectionId: z.string(),
  sectionTitle: z.string(),
  groupId: z.string(),
  groupTitle: z.string(),
  method: z.string(),
  occurrence: z.number(),
  role: z.string(),
  scaleBase: nullableString,
  scaleStep: nullableNumber
})

const brandColorTokenSchema = z.object({
  id: z.string(),
  cssVar: z.string(),
  name: z.string(),
  label: z.string(),
  value: z.string(),
  resolvedValue: z.string(),
  hex: nullableString,
  hexVar: nullableString,
  rgb: nullableString,
  oklab: nullableString,
  oklch: nullableString,
  lab: nullableString,
  lch: nullableString,
  hsl: nullableString,
  cmyk: brandColorCmykSchema,
  pantone: nullableString,
  cam02: nullableString,
  relativeLuminance: nullableNumber,
  csvRelativeLuminanceVsBackground: nullableNumber,
  apcaVsBackground: nullableNumber,
  wcagContrastVsBackground: nullableNumber,
  relationships: z.array(brandColorRelationshipSchema),
  source: brandColorSourceSchema,
  matchedCsv: z.boolean()
})

const brandColorSectionGroupSchema = z.object({
  id: z.string(),
  title: z.string(),
  method: z.string()
})

const brandColorDerivedPaletteColorSchema = z.object({
  label: z.string(),
  hex: z.string(),
  oklch: z.string()
})

const brandColorDerivedPaletteSchema = z.object({
  id: z.string(),
  title: z.string(),
  method: z.string(),
  colors: z.array(brandColorDerivedPaletteColorSchema)
})

const brandColorSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  sourceTitle: z.string(),
  groups: z.array(brandColorSectionGroupSchema),
  tokens: z.array(brandColorTokenSchema),
  derivedPalettes: z.array(brandColorDerivedPaletteSchema)
})

const brandColorTokensFileSchema = z.object({
  generatedAt: z.string(),
  source: z.string(),
  csvSource: z.string(),
  referenceBackground: z.string(),
  generationNotes: z.array(z.string()),
  stats: z.object({
    sectionCount: z.number(),
    tokenCount: z.number(),
    uniqueHexCount: z.number(),
    uniqueCssVarCount: z.number(),
    csvMatchedHexCount: z.number(),
    pantoneCount: z.number()
  }),
  sections: z.array(brandColorSectionSchema)
})

export type BrandColorToken = z.infer<typeof brandColorTokenSchema>
export type BrandColorSection = z.infer<typeof brandColorSectionSchema>
export type BrandColorTokensFile = z.infer<typeof brandColorTokensFileSchema>
export type BrandColorDerivedPalette = z.infer<typeof brandColorDerivedPaletteSchema>

export const brandColorTokens = brandColorTokensFileSchema.parse(raw)
