#!/usr/bin/env node

import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')
const sourceDirectories = ['src/app', 'src/components', 'src/lib']
const cssDirectories = ['src']
const sourceExtensions = new Set(['.css', '.mdx', '.ts', '.tsx'])
const ignoredDirectories = new Set([
  '.git',
  '.next',
  '.turbo',
  'build',
  'coverage',
  'dist',
  'generated',
  'node_modules',
  '__generated__'
])
const colorUtilityPrefixes = [
  'ring-offset',
  'accent',
  'bg',
  'border',
  'caret',
  'decoration',
  'divide',
  'fill',
  'from',
  'outline',
  'placeholder',
  'ring',
  'shadow',
  'stroke',
  'text',
  'to',
  'via'
]

function lineNumberAt(text, index) {
  let line = 1

  for (let cursor = 0; cursor < index; cursor += 1) {
    if (text[cursor] === '\n') {
      line += 1
    }
  }

  return line
}

async function listFiles(directory, extensions = sourceExtensions) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) {
        continue
      }

      files.push(...(await listFiles(entryPath, extensions)))
      continue
    }

    if (entry.isFile() && extensions.has(path.extname(entry.name))) {
      files.push(entryPath)
    }
  }

  return files
}

function splitVariantToken(token) {
  const parts = []
  let start = 0
  let squareDepth = 0
  let parenDepth = 0

  for (let index = 0; index < token.length; index += 1) {
    const character = token[index]

    if (character === '[') {
      squareDepth += 1
      continue
    }

    if (character === ']') {
      squareDepth = Math.max(0, squareDepth - 1)
      continue
    }

    if (character === '(') {
      parenDepth += 1
      continue
    }

    if (character === ')') {
      parenDepth = Math.max(0, parenDepth - 1)
      continue
    }

    if (character === ':' && squareDepth === 0 && parenDepth === 0) {
      parts.push(token.slice(start, index))
      start = index + 1
    }
  }

  parts.push(token.slice(start))

  return parts
}

function splitTokenPunctuation(rawToken) {
  const leading = rawToken.match(/^[{(]+/)?.[0] ?? ''
  const trailing = rawToken.match(/[),;]+$/)?.[0] ?? ''
  const core = rawToken.slice(leading.length, rawToken.length - trailing.length)

  return {
    core,
    trailing
  }
}

function parseColorUtility(utility, semanticColorNames) {
  const leadingImportant = utility.startsWith('!') ? '!' : ''
  const withoutLeadingImportant = leadingImportant ? utility.slice(1) : utility
  const trailingImportant = withoutLeadingImportant.endsWith('!') ? '!' : ''
  const utilityCore = trailingImportant
    ? withoutLeadingImportant.slice(0, -1)
    : withoutLeadingImportant

  if (!utilityCore || utilityCore.includes('$') || utilityCore.includes('=')) {
    return null
  }

  for (const prefix of colorUtilityPrefixes) {
    const marker = `${prefix}-`

    if (!utilityCore.startsWith(marker)) {
      continue
    }

    const value = utilityCore.slice(marker.length)
    const slashIndex = value.indexOf('/')
    const colorName = slashIndex === -1 ? value : value.slice(0, slashIndex)
    const opacitySuffix = slashIndex === -1 ? '' : value.slice(slashIndex)

    if (
      colorName.startsWith('dark-') ||
      !semanticColorNames.has(colorName)
    ) {
      return null
    }

    return {
      leadingImportant,
      prefix,
      colorName,
      opacitySuffix,
      trailingImportant
    }
  }

  return null
}

function expectedDarkToken(coreToken, semanticColorNames) {
  if (!coreToken || coreToken.includes('${')) {
    return null
  }

  const parts = splitVariantToken(coreToken)
  const utility = parts.at(-1)
  const variants = parts.slice(0, -1)

  if (!utility || variants.includes('not-dark')) {
    return null
  }

  const parsed = parseColorUtility(utility, semanticColorNames)

  if (!parsed) {
    return null
  }

  const darkUtility = `${parsed.leadingImportant}${parsed.prefix}-dark-${parsed.colorName}${parsed.opacitySuffix}${parsed.trailingImportant}`

  if (variants.includes('dark')) {
    return [...variants, darkUtility].join(':')
  }

  return ['dark', ...variants, darkUtility].join(':')
}

async function readSemanticColorNames() {
  const darkCss = await readFile(
    path.join(repoRoot, 'src/tokens/semantic.dark.css'),
    'utf8'
  )

  return new Set(
    Array.from(darkCss.matchAll(/--dark-([a-z0-9-]+)\s*:/g), match => match[1])
  )
}

function scanLineForUnpairedUtilities({
  file,
  line,
  lineNumber,
  semanticColorNames
}) {
  if (
    line.includes('dark-contract-ignore') ||
    line.trim().startsWith('//') ||
    line.trim().startsWith('*')
  ) {
    return []
  }

  const issues = []
  const tokenPattern = /[^\s"'`<>]+/g
  let match = tokenPattern.exec(line)

  while (match) {
    const rawToken = match[0]
    const { core, trailing } = splitTokenPunctuation(rawToken)
    const expected = expectedDarkToken(core, semanticColorNames)

    if (!expected) {
      match = tokenPattern.exec(line)
      continue
    }

    if (core.startsWith('dark:')) {
      issues.push({
        file,
        line: lineNumber,
        classToken: `${core}${trailing}`,
        expected
      })
      match = tokenPattern.exec(line)
      continue
    }

    if (!line.includes(expected)) {
      issues.push({
        file,
        line: lineNumber,
        classToken: `${core}${trailing}`,
        expected
      })
    }

    match = tokenPattern.exec(line)
  }

  return issues
}

async function auditExplicitDarkUtilityPairs(semanticColorNames) {
  const files = (
    await Promise.all(
      sourceDirectories.map(directory =>
        listFiles(path.join(repoRoot, directory))
      )
    )
  ).flat()
  const issues = []

  for (const file of files) {
    const source = await readFile(file, 'utf8')
    const relativeFile = path.relative(repoRoot, file)

    source.split('\n').forEach((line, index) => {
      issues.push(
        ...scanLineForUnpairedUtilities({
          file: relativeFile,
          line,
          lineNumber: index + 1,
          semanticColorNames
        })
      )
    })
  }

  return issues
}

function findMatchingBrace(css, openingBraceIndex) {
  let depth = 0

  for (let index = openingBraceIndex; index < css.length; index += 1) {
    if (css[index] === '{') {
      depth += 1
      continue
    }

    if (css[index] !== '}') {
      continue
    }

    depth -= 1
    if (depth === 0) {
      return index
    }
  }

  return -1
}

async function auditDarkCssBlocks(semanticColorNames) {
  const files = (
    await Promise.all(
      cssDirectories.map(directory =>
        listFiles(path.join(repoRoot, directory), new Set(['.css']))
      )
    )
  ).flat()
  const issues = []

  for (const file of files) {
    const css = await readFile(file, 'utf8')
    const darkBlockPattern = /\.dark\s*\{/g
    let match = darkBlockPattern.exec(css)

    while (match) {
      const openingBraceIndex = darkBlockPattern.lastIndex - 1
      const closingBraceIndex = findMatchingBrace(css, openingBraceIndex)

      if (closingBraceIndex === -1) {
        issues.push({
          file: path.relative(repoRoot, file),
          line: lineNumberAt(css, match.index),
          declaration: '.dark',
          expected: 'Close the .dark block.'
        })
        break
      }

      const body = css.slice(openingBraceIndex + 1, closingBraceIndex)
      const declarationPattern = /(--[a-z0-9-]+)\s*:/g
      let declarationMatch = declarationPattern.exec(body)

      while (declarationMatch) {
        const declaration = declarationMatch[1]
        const name = declaration.slice(2)
        const semanticName = name.startsWith('dark-')
          ? name.slice('dark-'.length)
          : name

        if (semanticColorNames.has(semanticName)) {
          issues.push({
            file: path.relative(repoRoot, file),
            line: lineNumberAt(css, openingBraceIndex + 1 + declarationMatch.index),
            declaration,
            expected:
              'Move semantic dark values to :root --dark-* tokens; .dark may only trigger the variant/color-scheme.'
          })
        }

        declarationMatch = declarationPattern.exec(body)
      }

      darkBlockPattern.lastIndex = closingBraceIndex + 1
      match = darkBlockPattern.exec(css)
    }
  }

  return issues
}

async function main() {
  const semanticColorNames = await readSemanticColorNames()
  const unpairedUtilities =
    await auditExplicitDarkUtilityPairs(semanticColorNames)
  const forbiddenDarkCssDeclarations =
    await auditDarkCssBlocks(semanticColorNames)
  const ok =
    unpairedUtilities.length === 0 &&
    forbiddenDarkCssDeclarations.length === 0

  console.log(
    JSON.stringify(
      {
        ok,
        summary: {
          semanticDarkTokens: semanticColorNames.size,
          unpairedUtilities: unpairedUtilities.length,
          forbiddenDarkCssDeclarations:
            forbiddenDarkCssDeclarations.length
        },
        unpairedUtilities,
        forbiddenDarkCssDeclarations
      },
      null,
      2
    )
  )

  process.exit(ok ? 0 : 1)
}

main().catch(error => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      },
      null,
      2
    )
  )
  process.exit(1)
})
