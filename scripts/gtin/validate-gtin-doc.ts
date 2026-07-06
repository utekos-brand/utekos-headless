import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { z } from 'zod'

import { isValidGtin } from '../../src/lib/gtin/isValidGtin'

const GTIN_DOC_PATH = path.join(process.cwd(), 'docs/gtin.mdx')
const PRODUCT_IMAGE_PATH = path.join(process.cwd(), 'public/gtin/product-images')
const PRODUCT_IMAGE_URL_PREFIX = 'https://utekos.no/gtin/product-images/'

const requiredColumns = [
  'GTIN',
  'Status',
  'Merkenavn',
  'Produktnavn',
  'Tilleggsidentifikasjon',
  'TargetMarket.ExternalProductImageUrl',
  'ExternalSource'
]

const gtinRowSchema = z.object({
  GTIN: z.string().regex(/^(\d{8}|\d{12}|\d{13}|\d{14})$/),
  Status: z.literal('ACTIVE'),
  Merkenavn: z.literal('Utekos'),
  Produktnavn: z.string().min(1),
  Tilleggsidentifikasjon: z.string().min(1),
  'TargetMarket.ExternalProductImageUrl': z.string().url(),
  ExternalSource: z.literal('Utekos')
})

type GtinRow = z.infer<typeof gtinRowSchema>

function parseMarkdownTable() {
  const markdown = fs.readFileSync(GTIN_DOC_PATH, 'utf8')
  const lines = markdown
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('|'))

  const headerLine = lines[0]

  if (!headerLine) {
    throw new Error('docs/gtin.mdx does not contain a markdown table')
  }

  const headers = headerLine
    .split('|')
    .map(cell => cell.trim())
    .filter(Boolean)
  const missingColumns = requiredColumns.filter(column => !headers.includes(column))

  if (missingColumns.length > 0) {
    throw new Error(`Missing required GTIN columns: ${missingColumns.join(', ')}`)
  }

  return lines
    .slice(2)
    .map(line =>
      line
        .split('|')
        .map(cell => cell.trim())
        .filter((_, index, cells) => index > 0 && index < cells.length - 1)
    )
    .filter(cells => cells.length === headers.length)
    .map(cells =>
      Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']))
    )
}

function validateRow(row: GtinRow) {
  const expectedUrl = `${PRODUCT_IMAGE_URL_PREFIX}${row.GTIN}.png`
  const imagePath = path.join(PRODUCT_IMAGE_PATH, `${row.GTIN}.png`)
  const errors: string[] = []

  if (!isValidGtin(row.GTIN)) {
    errors.push(`GTIN ${row.GTIN} has an invalid check digit`)
  }

  if (row['TargetMarket.ExternalProductImageUrl'] !== expectedUrl) {
    errors.push(`GTIN ${row.GTIN} has incorrect image URL`)
  }

  if (!fs.existsSync(imagePath)) {
    errors.push(`GTIN ${row.GTIN} is missing local image ${imagePath}`)
  }

  return errors
}

function reportDuplicateIdentifiers(rows: GtinRow[]) {
  const identifiers = new Map<string, string[]>()

  for (const row of rows) {
    const gtins = identifiers.get(row.Tilleggsidentifikasjon) ?? []
    gtins.push(row.GTIN)
    identifiers.set(row.Tilleggsidentifikasjon, gtins)
  }

  return Array.from(identifiers.entries())
    .filter(([, gtins]) => gtins.length > 1)
    .map(([identifier, gtins]) =>
      `Duplicate Tilleggsidentifikasjon "${identifier}" for GTINs ${gtins.join(', ')}`
    )
}

const parsedRows = z.array(gtinRowSchema).parse(parseMarkdownTable())
const rowErrors = parsedRows.flatMap(validateRow)
const duplicateWarnings = reportDuplicateIdentifiers(parsedRows)

for (const warning of duplicateWarnings) {
  console.warn(`[gtin] warning: ${warning}`)
}

if (rowErrors.length > 0) {
  for (const error of rowErrors) {
    console.error(`[gtin] error: ${error}`)
  }

  process.exit(1)
}

console.info(`[gtin] validated ${parsedRows.length} GTIN rows`)
