#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { createHash, randomUUID } from 'node:crypto'

import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js'
import { z } from 'zod/v4'

const repoRoot = path.resolve(process.env.UTEKOS_REPO_ROOT ?? process.cwd())
const host = process.env.HOST ?? '0.0.0.0'
const port = Number(process.env.PORT ?? 8787)
const profile = 'utekos_css_insight_public'
const mode = 'public-read-only-no-auth'
const mcpPath = '/mcp'
const serverVersion = '1.1.0'
const defaultScope = 'runtime-used-colors'
const widgetTemplateUri = 'ui://utekos-css/color-audit.html'
const paletteWidgetUri = 'ui://utekos-css/color-palette.html'
const cardWidgetUri   = 'ui://utekos-css/color-card.html'

const allowedRoots = ['src']
const referenceRoots = ['.agents/css']
const cssExtensions = ['.css', '.module.css', '.scss', '.sass', '.pcss']
const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx', '.md', '.mdx']
const runtimeCssEntry = 'src/globals.css'
const generatedAndSecretPatterns = [
  '.env',
  '.env.local',
  '.env.mcp.local',
  '.env.tunnel.local',
  'mcp.json',
  '.vscode/mcp.json',
  '.cursor/mcp.json',
  '.git/',
  '.next/',
  'node_modules/',
  'gcloud components install',
  'src/api/lib/cloud-credentials/',
  'supabase/md.md'
]
const explicitlyExcludedCss = [
  'src/components/shadcn-default.css',
  'src/tokens/index.css',
  'src/tokens/themes/dark.tailwind.css'
]

const canonicalTools = [
  'css_insight_bootstrap',
  'css_source_inventory',
  'read_css_sources',
  'search_css_sources',
  'css_dependency_graph',
  'css_token_index',
  'css_usage_context',
  'css_audit_report',
  'render_color_palette',
  'render_color_card'
]

const canonicalResources = [
  'utekos-css://inventory',
  'utekos-css://graph',
  'utekos-css://tokens',
  'utekos-css://file/{encodedPath}',
  widgetTemplateUri,
  paletteWidgetUri,
  cardWidgetUri
]

const toolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: false,
  idempotentHint: true
}

const noAuthSecuritySchemes = [{ type: 'noauth' }]

function toolMeta(invoking, invoked, extra = {}) {
  return {
    securitySchemes: noAuthSecuritySchemes,
    'openai/toolInvocation/invoking': invoking,
    'openai/toolInvocation/invoked': invoked,
    ...extra
  }
}

const sourceSchema = z.object({
  path: z.string(),
  sha256: z.string().optional(),
  size_bytes: z.number().int().nonnegative().optional(),
  line_count: z.number().int().nonnegative().optional(),
  truncated: z.boolean().optional()
})

const errorSchema = z.object({
  code: z.string(),
  message: z.string(),
  category: z.string(),
  retryable: z.boolean(),
  safe_to_retry: z.boolean(),
  user_action_required: z.boolean(),
  suggested_fix: z.string(),
  details_redacted: z.boolean()
})

const permissionsSchema = z.object({
  read_only: z.boolean(),
  public_no_auth: z.boolean(),
  default_scope: z.string(),
  allowed_roots: z.array(z.string()),
  reference_roots: z.array(z.string()),
  allowed_extensions: z.array(z.string()),
  denied_patterns: z.array(z.string())
})

function envelopeSchema(toolName, dataSchema) {
  return z.object({
    ok: z.boolean(),
    tool: z.literal(toolName),
    profile: z.literal(profile),
    mode: z.literal(mode),
    request_id: z.string(),
    started_at: z.string(),
    finished_at: z.string(),
    duration_ms: z.number().nonnegative(),
    data: dataSchema,
    sources: z.array(sourceSchema),
    warnings: z.array(z.string()),
    errors: z.array(errorSchema),
    limits: z.record(z.string(), z.unknown()),
    permissions: permissionsSchema,
    next: z.array(z.string())
  })
}

function nowIso() {
  return new Date().toISOString()
}

function permissions() {
  return {
    read_only: true,
    public_no_auth: true,
    default_scope: defaultScope,
    allowed_roots: allowedRoots,
    reference_roots: referenceRoots,
    allowed_extensions: cssExtensions,
    denied_patterns: generatedAndSecretPatterns
  }
}

function createEnvelope(toolName, startedAt, data, options = {}) {
  const finishedAt = nowIso()
  return {
    ok: options.ok ?? true,
    tool: toolName,
    profile,
    mode,
    request_id: options.requestId ?? randomUUID(),
    started_at: startedAt,
    finished_at: finishedAt,
    duration_ms: Date.parse(finishedAt) - Date.parse(startedAt),
    data,
    sources: options.sources ?? [],
    warnings: options.warnings ?? [],
    errors: options.errors ?? [],
    limits: options.limits ?? {},
    permissions: permissions(),
    next: options.next ?? []
  }
}

function textResult(envelope) {
  return {
    content: [{ type: 'text', text: JSON.stringify(envelope, null, 2) }],
    structuredContent: envelope
  }
}

function textResultWithMeta(envelope, meta) {
  return {
    content: [{ type: 'text', text: JSON.stringify(envelope, null, 2) }],
    structuredContent: envelope,
    _meta: meta
  }
}

function makeError(code, message, suggestedFix, category = 'policy') {
  return {
    code,
    message,
    category,
    retryable: false,
    safe_to_retry: true,
    user_action_required: false,
    suggested_fix: suggestedFix,
    details_redacted: true
  }
}

function relativePath(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, '/')
}

function hasCssExtension(relative) {
  return cssExtensions.some(extension => relative.endsWith(extension))
}

function isSourceFile(relative) {
  return sourceExtensions.some(extension => relative.endsWith(extension))
}

function isAllowedRoot(relative) {
  return allowedRoots.some(root => relative === root || relative.startsWith(`${root}/`))
}

function isReferenceRoot(relative) {
  return referenceRoots.some(root => relative === root || relative.startsWith(`${root}/`))
}

function isAllowedCssSource(relative) {
  return isAllowedRoot(relative) && hasCssExtension(relative) && !deniedReason(relative)
}

function deniedReason(relative) {
  const normalized = relative.endsWith('/') ? relative : `${relative}${fs.existsSync(path.join(repoRoot, relative)) && fs.statSync(path.join(repoRoot, relative)).isDirectory() ? '/' : ''}`
  for (const pattern of generatedAndSecretPatterns) {
    if (pattern.endsWith('/')) {
      if (normalized === pattern || normalized.startsWith(pattern)) return pattern
      continue
    }
    if (normalized === pattern || normalized.startsWith(`${pattern}/`) || normalized.startsWith(pattern)) return pattern
  }
  return null
}

function resolveProjectPath(inputPath) {
  const cleaned = String(inputPath ?? '').trim()
  if (!cleaned) throw new Error('Path is empty')
  if (cleaned.includes('\0')) throw new Error('Path contains invalid null byte')

  const resolved = path.resolve(repoRoot, cleaned)
  const relative = relativePath(resolved)
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Path escapes repo root: ${cleaned}`)
  }

  const denied = deniedReason(relative)
  if (denied) throw new Error(`Path is denied by Utekos CSS MCP policy: ${denied}`)
  if (isReferenceRoot(relative)) throw new Error(`Path is reference-only and excluded from the public runtime CSS scope: ${relative}`)
  if (!isAllowedRoot(relative)) throw new Error(`Path is outside CSS insight roots: ${relative}`)
  if (!hasCssExtension(relative)) throw new Error(`Path is not an allowed CSS source file: ${relative}`)
  if (!listCssFiles().includes(relative)) throw new Error(`Path is outside the default ${defaultScope} CSS scope: ${relative}`)

  return { absolute: resolved, relative }
}

function hashBuffer(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

function readTextFile(relative, maxBytes = 250000) {
  const resolved = resolveProjectPath(relative)
  const stat = fs.statSync(resolved.absolute)
  if (!stat.isFile()) throw new Error(`Not a file: ${resolved.relative}`)

  const buffer = fs.readFileSync(resolved.absolute)
  const truncated = buffer.byteLength > maxBytes
  const text = buffer.subarray(0, maxBytes).toString('utf8')

  return {
    path: resolved.relative,
    content: text,
    sha256: hashBuffer(buffer),
    size_bytes: buffer.byteLength,
    line_count: text.length === 0 ? 0 : text.split('\n').length,
    truncated
  }
}

function fileSource(file) {
  return {
    path: file.path,
    sha256: file.sha256,
    size_bytes: file.size_bytes,
    line_count: file.line_count,
    truncated: file.truncated
  }
}

function walkFiles(rootRelative, predicate, options = {}) {
  const respectDenied = options.respectDenied ?? true
  const absoluteRoot = path.join(repoRoot, rootRelative)
  if (!fs.existsSync(absoluteRoot)) return []
  const files = []

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name)
      const relative = relativePath(absolute)
      const denied = respectDenied ? deniedReason(relative) : null
      if (denied) continue
      if (entry.isDirectory()) {
        walk(absolute)
      } else if (entry.isFile() && predicate(relative)) {
        files.push(relative)
      }
    }
  }

  walk(absoluteRoot)
  return files.sort()
}

function listAllSrcCssFiles() {
  return walkFiles('src', relative => hasCssExtension(relative))
}

function listReferenceCssFiles() {
  return referenceRoots.flatMap(root => walkFiles(root, relative => hasCssExtension(relative), { respectDenied: false })).sort()
}

function resolveLocalCssImport(fromRelative, specifier) {
  if (!specifier.startsWith('.')) return null

  const normalized = path.normalize(path.join(path.dirname(fromRelative), specifier)).replaceAll(path.sep, '/')
  if (hasCssExtension(normalized)) return normalized

  for (const extension of cssExtensions) {
    const candidate = `${normalized}${extension}`
    if (fs.existsSync(path.join(repoRoot, candidate))) return candidate
  }

  return normalized
}

function collectCssReachableFromRoot(rootRelative = runtimeCssEntry) {
  const reachable = new Set()
  const stack = [rootRelative]

  while (stack.length > 0) {
    const current = stack.pop()
    if (!current || reachable.has(current)) continue
    if (!isAllowedCssSource(current) || !fs.existsSync(path.join(repoRoot, current))) continue

    reachable.add(current)
    const content = readRaw(current)
    for (const item of parseCssImports(current, content)) {
      if (item.kind !== 'local' || !item.resolved_path || !item.allowed) continue
      stack.push(item.resolved_path)
    }
  }

  return reachable
}

function extractCssUsageFromCode() {
  const imports = []
  const literalReferences = []
  const cssPaths = new Set()

  for (const source of listCodeFiles()) {
    const content = fs.readFileSync(path.join(repoRoot, source), 'utf8')
    const importPattern = /import\s+(?:(\w+)\s+from\s+)?["']([^"']+\.css)["']/g
    for (const match of content.matchAll(importPattern)) {
      const identifier = match[1] ?? null
      const specifier = match[2]
      const resolved = resolveCodeImport(source, specifier)
      const exists = Boolean(resolved && fs.existsSync(path.join(repoRoot, resolved)))
      const allowed = Boolean(resolved && exists && isAllowedCssSource(resolved))
      const record = {
        source_path: source,
        line: lineNumberAt(content, match.index ?? 0),
        specifier,
        identifier,
        resolved_path: resolved,
        exists,
        allowed
      }
      imports.push(record)
      if (allowed && resolved) cssPaths.add(resolved)
    }

    const literalPathPattern = /["'`](src\/[^"'`]+\.css)["'`]/g
    for (const match of content.matchAll(literalPathPattern)) {
      const resolved = match[1]
      const exists = fs.existsSync(path.join(repoRoot, resolved))
      const allowed = exists && isAllowedCssSource(resolved)
      const record = {
        source_path: source,
        line: lineNumberAt(content, match.index ?? 0),
        specifier: resolved,
        identifier: null,
        resolved_path: resolved,
        exists,
        allowed,
        reference_kind: 'literal-path'
      }
      literalReferences.push(record)
      if (allowed) cssPaths.add(resolved)
    }
  }

  return {
    imports,
    literal_references: literalReferences,
    css_paths: [...cssPaths].sort()
  }
}

function listCssFiles() {
  const cssFiles = new Set(collectCssReachableFromRoot())
  for (const cssPath of extractCssUsageFromCode().css_paths) {
    if (explicitlyExcludedCss.includes(cssPath)) continue
    cssFiles.add(cssPath)
  }
  return [...cssFiles].sort()
}

function listCodeFiles() {
  return walkFiles('src', relative => isSourceFile(relative))
}

function cssGroup(relative) {
  if (relative === 'src/globals.css') return 'global-entry'
  if (relative.startsWith('.agents/css/')) return 'excluded-reference'
  if (explicitlyExcludedCss.includes(relative)) return 'excluded-reference'
  if (relative.startsWith('src/tokens/')) return 'runtime-token-source'
  if (relative.endsWith('.module.css')) return 'runtime-css-module'
  if (relative.startsWith('src/styles/')) return 'runtime-style'
  if (relative.startsWith('src/components/cookie-consent/')) return 'runtime-style'
  if (relative.startsWith('src/components/')) return 'runtime-css-module'
  if (relative.startsWith('src/app/')) return 'runtime-css-module'
  if (relative.startsWith('src/')) return 'src-css'
  return 'unknown'
}

function unique(values) {
  return [...new Set(values)].sort()
}

function readRaw(relative) {
  return fs.readFileSync(path.join(repoRoot, relative), 'utf8')
}

function lineNumberAt(text, index) {
  return text.slice(0, index).split('\n').length
}

function parseCssImports(relative, content) {
  const imports = []
  const importPattern = /@import\s+(?:url\(\s*)?["']?([^"')\s;]+)["']?\s*\)?/g
  for (const match of content.matchAll(importPattern)) {
    const specifier = match[1]
    const line = lineNumberAt(content, match.index ?? 0)
    const record = { specifier, line, kind: 'external', resolved_path: null, exists: false, allowed: false }

    if (specifier.startsWith('.')) {
      const resolved = resolveLocalCssImport(relative, specifier)
      record.kind = 'local'
      record.resolved_path = resolved
      record.exists = fs.existsSync(path.join(repoRoot, resolved))
      record.allowed = record.exists && isAllowedCssSource(resolved) && !explicitlyExcludedCss.includes(resolved)
    }

    imports.push(record)
  }
  return imports
}

function extractSelectors(content) {
  const selectors = []
  const stripped = content.replaceAll(/\/\*[\s\S]*?\*\//g, '')
  const selectorPattern = /([^{}@]+)\{/g
  for (const match of stripped.matchAll(selectorPattern)) {
    const selector = match[1].trim().replaceAll(/\s+/g, ' ')
    if (!selector || selector.includes(';')) continue
    selectors.push(selector)
  }
  return selectors
}

function analyzeCssFile(relative) {
  const file = readTextFile(relative, 1000000)
  const atRules = [...file.content.matchAll(/@[\w-]+/g)].map(match => match[0])
  const customPropertyDefinitions = [...file.content.matchAll(/(^|[;{\s])(--[A-Za-z0-9_-]+)\s*:/gm)].map(match => match[2])
  const customPropertyReferences = [...file.content.matchAll(/var\(\s*(--[A-Za-z0-9_-]+)/g)].map(match => match[1])
  const selectors = extractSelectors(file.content)

  return {
    path: file.path,
    group: cssGroup(file.path),
    size_bytes: file.size_bytes,
    line_count: file.line_count,
    sha256: file.sha256,
    imports: parseCssImports(file.path, file.content),
    at_rules: unique(atRules),
    selector_count: selectors.length,
    custom_property_definition_count: customPropertyDefinitions.length,
    custom_property_reference_count: customPropertyReferences.length,
    empty: file.size_bytes === 0
  }
}

function inventory() {
  return listCssFiles().map(analyzeCssFile)
}

function dependencyGraph() {
  const files = inventory()
  const fileSet = new Set(files.map(file => file.path))
  const codeCssUsage = extractCssUsageFromCode()
  const codeReferencedCss = new Set(codeCssUsage.css_paths)
  const allSrcCss = listAllSrcCssFiles()
  const nonRuntimeCss = allSrcCss.filter(file => !fileSet.has(file)).sort()
  const edges = []
  for (const file of files) {
    for (const item of file.imports) {
      edges.push({
        from: file.path,
        specifier: item.specifier,
        kind: item.kind,
        to: item.resolved_path,
        exists: item.exists,
        allowed: item.allowed
      })
    }
  }

  const reachable = new Set()
  const stack = fileSet.has('src/globals.css') ? ['src/globals.css'] : []
  while (stack.length > 0) {
    const current = stack.pop()
    if (!current || reachable.has(current)) continue
    reachable.add(current)
    for (const edge of edges) {
      if (edge.from !== current || edge.kind !== 'local' || !edge.allowed || !edge.to) continue
      stack.push(edge.to)
    }
  }

  return {
    root: runtimeCssEntry,
    nodes: files.map(file => ({
      path: file.path,
      group: file.group,
      reachable_from_root: reachable.has(file.path),
      referenced_by_code: codeReferencedCss.has(file.path)
    })),
    edges,
    reachable_from_root: [...reachable].sort(),
    code_referenced_css: [...codeReferencedCss].sort(),
    orphan_css: files.map(file => file.path).filter(file => !reachable.has(file) && !codeReferencedCss.has(file)).sort(),
    non_runtime_css: nonRuntimeCss.map(file => ({
      path: file,
      group: cssGroup(file),
      reason:
        explicitlyExcludedCss.includes(file) ? 'explicitly-excluded' : (
          'not reachable from globals.css and not referenced by source imports/literals'
        )
    })),
    external_imports: edges.filter(edge => edge.kind === 'external'),
    missing_local_imports: edges.filter(edge => edge.kind === 'local' && !edge.exists),
    denied_or_unallowed_imports: edges.filter(edge => edge.kind === 'local' && edge.exists && !edge.allowed)
  }
}

function selectorScopesForLine(content, index) {
  const openBrace = content.lastIndexOf('{', index)
  if (openBrace === -1) return []

  const previousCloseBrace = content.lastIndexOf('}', openBrace)
  const latest = content
    .slice(previousCloseBrace + 1, openBrace)
    .trim()
    .replaceAll(/\s+/g, ' ')
  if (!latest) return []
  return latest.split(',').map(scope => scope.trim()).filter(Boolean)
}

function extractVarReferences(value) {
  return unique([...String(value).matchAll(/var\(\s*(--[A-Za-z0-9_-]+)/g)].map(match => match[1]))
}

function extractColorLiteralValues(value) {
  const pattern = /#[0-9a-fA-F]{3,8}\b|(?:oklch|oklab|rgb|rgba|hsl|hsla|color-mix|lab|lch|color)\([^;{}'"`]*\)|\btransparent\b|\bcurrentColor\b/g
  return unique([...String(value).matchAll(pattern)].map(match => match[0].trim()))
}

function parseTokenData(files) {
  const definitions = []
  const references = []
  const definitionMap = new Map()

  for (const relative of files) {
    const content = readRaw(relative)
    for (const match of content.matchAll(/(^|[;{\s])(--[A-Za-z0-9_-]+)\s*:\s*([^;{}]+)[;}]/gm)) {
      const name = match[2]
      const value = match[3].trim()
      const line = lineNumberAt(content, match.index ?? 0)
      const definition = {
        name,
        value,
        path: relative,
        line,
        group: cssGroup(relative),
        scopes: selectorScopesForLine(content, match.index ?? 0),
        depends_on: extractVarReferences(value),
        literal_colors: extractColorLiteralValues(value)
      }
      definitions.push(definition)
      if (!definitionMap.has(name)) definitionMap.set(name, [])
      definitionMap.get(name).push(definition)
    }

    for (const match of content.matchAll(/var\(\s*(--[A-Za-z0-9_-]+)/g)) {
      references.push({
        name: match[1],
        path: relative,
        line: lineNumberAt(content, match.index ?? 0),
        group: cssGroup(relative)
      })
    }
  }

  return { definitions, references, definitionMap }
}

const semanticColorTokens = new Set([
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--card-hover',
  '--popover',
  '--popover-foreground',
  '--primary',
  '--primary-foreground',
  '--primary-hover',
  '--primary-active',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--accent',
  '--accent-foreground',
  '--destructive',
  '--destructive-foreground',
  '--border',
  '--input',
  '--ring',
  '--chart-1',
  '--chart-2',
  '--chart-3',
  '--chart-4',
  '--chart-5',
  '--sidebar',
  '--sidebar-foreground',
  '--sidebar-primary',
  '--sidebar-primary-foreground',
  '--sidebar-accent',
  '--sidebar-accent-foreground',
  '--sidebar-border',
  '--sidebar-ring',
  '--promo',
  '--promo-foreground',
  '--featured',
  '--featured-foreground',
  '--featured-border',
  '--commerce-primary',
  '--commerce-primary-foreground',
  '--commerce-primary-hover',
  '--commerce-primary-hover-foreground',
  '--commerce-secondary',
  '--commerce-secondary-foreground',
  '--commerce-secondary-hover',
  '--commerce-secondary-hover-foreground',
  '--link',
  '--badge',
  '--foreground-on-dark',
  '--heading-secondary',
  '--paragraph',
  '--split',
  '--docs'
])

function isSemanticColorToken(name) {
  return semanticColorTokens.has(name)
}

function addSeed(seedReasons, name, reason) {
  if (!name || !name.startsWith('--')) return
  if (!seedReasons.has(name)) seedReasons.set(name, new Set())
  seedReasons.get(name).add(reason)
}

function normalizeTailwindUtilityColor(rawColorName) {
  if (!rawColorName || rawColorName.startsWith('[')) return null
  return rawColorName.replace(/\/.*$/, '').replaceAll('_', '-')
}

function summarizeCountsByPath(items) {
  const counts = new Map()
  for (const item of items) counts.set(item.path, (counts.get(item.path) ?? 0) + 1)
  return [...counts.entries()]
    .map(([pathName, count]) => ({ path: pathName, group: cssGroup(pathName), count }))
    .sort((a, b) => a.path.localeCompare(b.path))
}

function extractCodeColorUsage(definitionMap) {
  const seedReasons = new Map()
  const directColorLiterals = []
  const externalTailwindUtilities = new Map()
  const dynamicClassUsage = []
  const colorUtilityPattern = /(?:^|[\s"'`{[(])(?:[A-Za-z0-9_/-]+:)*(bg|text|border|ring|outline|fill|stroke|divide|decoration|accent|caret|from|via|to)-(\[[^\]]+\]|[A-Za-z0-9][A-Za-z0-9-]*(?:\/[0-9]{1,3})?)/g

  for (const source of listCodeFiles()) {
    const content = fs.readFileSync(path.join(repoRoot, source), 'utf8')

    for (const match of content.matchAll(/var\(\s*(--[A-Za-z0-9_-]+)/g)) {
      addSeed(seedReasons, match[1], `code-var:${source}:${lineNumberAt(content, match.index ?? 0)}`)
    }

    for (const match of content.matchAll(colorUtilityPattern)) {
      const utility = match[1]
      const rawColorName = match[2]
      const line = lineNumberAt(content, match.index ?? 0)

      if (rawColorName.includes('${')) {
        dynamicClassUsage.push({ path: source, line, text: rawColorName.slice(0, 160) })
        continue
      }

      if (rawColorName.startsWith('[')) {
        const value = rawColorName.slice(1, -1).replaceAll('_', ' ')
        for (const name of extractVarReferences(value)) {
          addSeed(seedReasons, name, `tailwind-arbitrary-var:${utility}:${source}:${line}`)
        }
        for (const literal of extractColorLiteralValues(value)) {
          directColorLiterals.push({ value: literal, path: source, line, source_kind: 'tailwind-arbitrary', utility })
        }
        continue
      }

      const normalized = normalizeTailwindUtilityColor(rawColorName)
      if (!normalized) continue

      const tokenName = `--color-${normalized}`
      if (definitionMap.has(tokenName)) {
        addSeed(seedReasons, tokenName, `tailwind-class:${utility}-${normalized}:${source}:${line}`)
      } else {
        externalTailwindUtilities.set(`${utility}-${normalized}`, (externalTailwindUtilities.get(`${utility}-${normalized}`) ?? 0) + 1)
      }
    }

    for (const match of content.matchAll(/#[0-9a-fA-F]{3,8}\b|(?:oklch|oklab|rgb|rgba|hsl|hsla|color-mix|lab|lch|color)\([^;{}'"`]*\)/g)) {
      directColorLiterals.push({
        value: match[0].trim(),
        path: source,
        line: lineNumberAt(content, match.index ?? 0),
        source_kind: 'code-literal'
      })
    }
  }

  return {
    seed_reasons: seedReasons,
    direct_color_literals: directColorLiterals,
    external_tailwind_utilities: [...externalTailwindUtilities.entries()]
      .map(([class_name, count]) => ({ class_name, count }))
      .sort((a, b) => b.count - a.count || a.class_name.localeCompare(b.class_name)),
    dynamic_class_usage: dynamicClassUsage
  }
}

function definitionId(definition) {
  return `${definition.path}:${definition.line}:${definition.name}`
}

function categorizeDefinition(definition) {
  if (isSemanticColorToken(definition.name)) return 'semantic-token'
  if (definition.path === 'src/tokens/semantic.bridge.css' && definition.name.startsWith('--color-')) return 'tailwind-bridge-token'
  if (
    definition.path.startsWith('src/tokens/coolors/') ||
    definition.path === 'src/tokens/palette.legacy.css' ||
    (definition.name.startsWith('--color-') && definition.literal_colors.length > 0)
  ) {
    return 'raw-source-color'
  }
  if (definition.name.startsWith('--color-')) return 'tailwind-color-token'
  return 'used-token'
}

function buildExcludedCandidatesSummary(runtimeDefinitions, usedDefinitions) {
  const runtimeFiles = listCssFiles()
  const runtimeFileSet = new Set(runtimeFiles)
  const allSrcFiles = listAllSrcCssFiles()
  const nonRuntimeFiles = allSrcFiles.filter(file => !runtimeFileSet.has(file))
  const nonRuntimeTokenData = parseTokenData(nonRuntimeFiles)
  const referenceTokenData = parseTokenData(listReferenceCssFiles())
  const usedDefinitionIds = new Set(usedDefinitions.map(definitionId))
  const excludedRuntimeDefinitions = runtimeDefinitions.filter(definition => !usedDefinitionIds.has(definitionId(definition)))

  return {
    default_scope: defaultScope,
    runtime_css_file_count: runtimeFiles.length,
    all_src_css_file_count: allSrcFiles.length,
    non_runtime_src_css_file_count: nonRuntimeFiles.length,
    reference_css_file_count: listReferenceCssFiles().length,
    runtime_candidate_definition_count: runtimeDefinitions.length,
    used_definition_count: usedDefinitions.length,
    runtime_excluded_definition_count: excludedRuntimeDefinitions.length,
    non_runtime_source_definition_count: nonRuntimeTokenData.definitions.length,
    reference_definition_count: referenceTokenData.definitions.length,
    excluded_reference_roots: referenceRoots,
    explicitly_excluded_css: explicitlyExcludedCss,
    non_runtime_source_files: nonRuntimeFiles.map(file => ({
      path: file,
      group: cssGroup(file),
      definition_count: nonRuntimeTokenData.definitions.filter(definition => definition.path === file).length,
      reason: explicitlyExcludedCss.includes(file) ? 'explicitly-excluded' : 'not in runtime CSS graph or source CSS usage'
    })),
    excluded_runtime_candidates_by_file: summarizeCountsByPath(excludedRuntimeDefinitions)
  }
}

function tokenIndex() {
  const runtimeFiles = listCssFiles()
  const { definitions, references, definitionMap } = parseTokenData(runtimeFiles)
  const seedReasons = new Map()

  for (const definition of definitions) {
    if (definition.path === 'src/tokens/semantic.bridge.css' && definition.name.startsWith('--color-')) {
      addSeed(seedReasons, definition.name, 'tailwind-bridge-token')
    }
    if (
      isSemanticColorToken(definition.name) &&
      (definition.path === 'src/tokens/semantic.light.css' ||
        definition.path === 'src/tokens/semantic.dark.css' ||
        definition.path === 'src/tokens/themes/brand.css')
    ) {
      addSeed(seedReasons, definition.name, 'semantic-token')
    }
  }

  for (const reference of references) {
    if (!reference.path.startsWith('src/tokens/')) {
      addSeed(seedReasons, reference.name, `runtime-css-var:${reference.path}:${reference.line}`)
    }
  }

  const codeUsage = extractCodeColorUsage(definitionMap)
  for (const [name, reasons] of codeUsage.seed_reasons.entries()) {
    for (const reason of reasons) addSeed(seedReasons, name, reason)
  }

  const usedDefinitions = []
  const usedDefinitionIds = new Set()
  const unresolvedReferences = []
  const queue = [...seedReasons.keys()]
  const visitedNames = new Set()

  while (queue.length > 0) {
    const name = queue.shift()
    if (!name || visitedNames.has(name)) continue
    visitedNames.add(name)

    const matchingDefinitions = definitionMap.get(name)
    if (!matchingDefinitions || matchingDefinitions.length === 0) {
      unresolvedReferences.push({ name, reason: [...(seedReasons.get(name) ?? [])].sort() })
      continue
    }

    for (const definition of matchingDefinitions) {
      const id = definitionId(definition)
      if (!usedDefinitionIds.has(id)) {
        usedDefinitionIds.add(id)
        usedDefinitions.push(definition)
      }

      for (const dependency of definition.depends_on) {
        if (!seedReasons.has(dependency)) seedReasons.set(dependency, new Set())
        seedReasons.get(dependency).add(`var-dependency:${definition.name}`)
        queue.push(dependency)
      }
    }
  }

  const usedDefinitionNames = new Set(usedDefinitions.map(item => item.name))
  const definitionNames = new Set(definitions.map(item => item.name))
  const duplicateDefinitions = [...new Map(usedDefinitions.map(item => [item.name, null])).keys()]
    .map(name => [name, usedDefinitions.filter(item => item.name === name)])
    .filter(([, items]) => items.length > 1)
    .map(([name, items]) => ({ name, definitions: items }))
  const unresolvedStaticReferences = references.filter(item => !definitionNames.has(item.name))
  const usedColorEntries = usedDefinitions
    .map(definition => ({
      ...definition,
      category: categorizeDefinition(definition),
      seed_reasons: [...(seedReasons.get(definition.name) ?? [])].sort()
    }))
    .sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line || a.name.localeCompare(b.name))
  const directCssColorLiterals = runtimeFiles.flatMap(file => {
    const content = readRaw(file)
    return extractColorLiteralValues(content).map(value => ({
      value,
      path: file,
      line: lineNumberAt(content, content.indexOf(value)),
      source_kind: 'runtime-css'
    }))
  })
  const directColorLiterals = [...directCssColorLiterals, ...codeUsage.direct_color_literals]

  return {
    default_scope: defaultScope,
    used_colors: usedColorEntries,
    semantic_tokens: usedColorEntries.filter(item => item.category === 'semantic-token'),
    tailwind_color_tokens: usedColorEntries.filter(item => item.category === 'tailwind-bridge-token' || item.category === 'tailwind-color-token'),
    raw_source_colors: usedColorEntries.filter(item => item.category === 'raw-source-color'),
    direct_color_literals: directColorLiterals,
    definitions: usedColorEntries,
    references,
    summary: {
      definition_count: usedDefinitions.length,
      reference_count: references.length,
      unique_definition_count: usedDefinitionNames.size,
      candidate_definition_count: definitions.length,
      excluded_candidate_count: definitions.length - usedDefinitions.length,
      used_color_count: usedColorEntries.length,
      semantic_token_count: usedColorEntries.filter(item => item.category === 'semantic-token').length,
      tailwind_color_token_count: usedColorEntries.filter(item => item.category === 'tailwind-bridge-token' || item.category === 'tailwind-color-token').length,
      raw_source_color_count: usedColorEntries.filter(item => item.category === 'raw-source-color').length,
      direct_color_literal_count: directColorLiterals.length,
      external_tailwind_color_utility_count: codeUsage.external_tailwind_utilities.length,
      dynamic_class_usage_count: codeUsage.dynamic_class_usage.length,
      duplicate_token_count: duplicateDefinitions.length,
      unresolved_static_reference_count: unresolvedStaticReferences.length,
      unresolved_reference_count: unresolvedReferences.length
    },
    duplicate_definitions: duplicateDefinitions,
    unresolved_static_references: unresolvedStaticReferences,
    unresolved_references: unresolvedReferences,
    theme_overrides: {
      root: usedColorEntries.filter(item => item.scopes.some(scope => scope.includes(':root'))),
      dark: usedColorEntries.filter(item => item.scopes.some(scope => scope.includes('.dark'))),
      theme_classes: usedColorEntries.filter(item => item.scopes.some(scope => scope.includes('theme__color-scheme')))
    },
    excluded_candidates_summary: buildExcludedCandidatesSummary(definitions, usedDefinitions),
    source_usage_summary: {
      tailwind_color_utility_seeds: [...seedReasons.entries()]
        .filter(([name]) => name.startsWith('--color-'))
        .map(([name, reasons]) => ({ name, reasons: [...reasons].sort() }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      external_tailwind_color_utilities: codeUsage.external_tailwind_utilities.slice(0, 250),
      dynamic_class_usage: codeUsage.dynamic_class_usage.slice(0, 250)
    }
  }
}

function resolveCodeImport(sourceRelative, specifier) {
  if (!specifier.startsWith('.')) return null
  const resolved = path.normalize(path.join(path.dirname(sourceRelative), specifier)).replaceAll(path.sep, '/')
  return resolved
}

function usageContext() {
  const cssFiles = new Set(listCssFiles())
  const codeCssUsage = extractCssUsageFromCode()
  const imports = codeCssUsage.imports
  const literalReferences = codeCssUsage.literal_references
  const moduleReferences = []
  const importByCss = new Map()

  for (const source of listCodeFiles()) {
    const content = fs.readFileSync(path.join(repoRoot, source), 'utf8')
    for (const record of imports.filter(item => item.source_path === source)) {
      const resolved = record.resolved_path
      if (resolved) {
        if (!importByCss.has(resolved)) importByCss.set(resolved, [])
        importByCss.get(resolved).push(record)
      }

      if (record.identifier) {
        const referencePattern = new RegExp(`\\b${record.identifier}(?:\\.|\\[)`, 'g')
        for (const reference of content.matchAll(referencePattern)) {
          moduleReferences.push({
            source_path: source,
            css_path: resolved,
            identifier: record.identifier,
            line: lineNumberAt(content, reference.index ?? 0),
            text: content.split('\n')[lineNumberAt(content, reference.index ?? 0) - 1]?.trim().slice(0, 300) ?? ''
          })
        }
      }
    }
  }

  const cssImportedByCode = [...importByCss.keys()].filter(item => cssFiles.has(item)).sort()
  const cssReferencedByCode = unique([...cssImportedByCode, ...literalReferences.map(item => item.resolved_path).filter(Boolean)])
  return {
    imports,
    literal_references: literalReferences,
    module_references: moduleReferences,
    css_imported_by_code: cssImportedByCode,
    css_referenced_by_code: cssReferencedByCode,
    css_not_imported_by_code: [...cssFiles].filter(file => !importByCss.has(file)).sort(),
    css_not_referenced_by_code: [...cssFiles].filter(file => !cssReferencedByCode.includes(file)).sort()
  }
}

function auditReport() {
  const files = inventory()
  const graph = dependencyGraph()
  const tokens = tokenIndex()
  const usage = usageContext()
  const warnings = []

  for (const file of files) {
    if (file.empty) {
      warnings.push({ severity: 'warning', code: 'EMPTY_CSS_FILE', path: file.path, message: 'CSS file is empty.' })
    }
  }

  for (const edge of graph.missing_local_imports) {
    warnings.push({ severity: 'error', code: 'MISSING_CSS_IMPORT', path: edge.from, message: `Missing local import: ${edge.specifier}` })
  }

  for (const edge of graph.denied_or_unallowed_imports) {
    warnings.push({ severity: 'error', code: 'UNALLOWED_CSS_IMPORT', path: edge.from, message: `Import resolves outside CSS insight policy: ${edge.specifier}` })
  }

  for (const reference of tokens.unresolved_static_references) {
    warnings.push({ severity: 'warning', code: 'UNRESOLVED_CSS_VARIABLE', path: reference.path, line: reference.line, message: `${reference.name} is referenced but not defined in indexed CSS.` })
  }

  for (const duplicate of tokens.duplicate_definitions) {
    warnings.push({ severity: 'info', code: 'DUPLICATE_TOKEN_DEFINITION', path: duplicate.definitions[0]?.path ?? '', message: `${duplicate.name} has ${duplicate.definitions.length} definitions.` })
  }

  for (const file of graph.orphan_css) {
    if (usage.css_referenced_by_code.includes(file)) continue
    warnings.push({ severity: 'info', code: 'NON_RUNTIME_CSS', path: file, message: 'CSS file is not reachable from src/globals.css and was not imported by indexed source files.' })
  }

  for (const file of graph.non_runtime_css) {
    warnings.push({ severity: 'info', code: 'EXCLUDED_REFERENCE_CSS', path: file.path, message: `${file.path} is excluded from the default ${defaultScope} MCP scope: ${file.reason}.` })
  }

  return {
    generated_at: nowIso(),
    file_count: files.length,
    warning_count: warnings.length,
    warnings,
    summary: {
      errors: warnings.filter(item => item.severity === 'error').length,
      warnings: warnings.filter(item => item.severity === 'warning').length,
      info: warnings.filter(item => item.severity === 'info').length,
      missing_local_imports: graph.missing_local_imports.length,
      unresolved_static_references: tokens.unresolved_static_references.length,
      non_runtime_css: warnings.filter(item => item.code === 'NON_RUNTIME_CSS').length,
      excluded_reference_css: warnings.filter(item => item.code === 'EXCLUDED_REFERENCE_CSS').length
    }
  }
}

const importSchema = z.object({
  specifier: z.string(),
  line: z.number().int().positive(),
  kind: z.enum(['local', 'external']),
  resolved_path: z.string().nullable(),
  exists: z.boolean(),
  allowed: z.boolean()
})

const inventoryFileSchema = z.object({
  path: z.string(),
  group: z.string(),
  size_bytes: z.number().int().nonnegative(),
  line_count: z.number().int().nonnegative(),
  sha256: z.string(),
  imports: z.array(importSchema),
  at_rules: z.array(z.string()),
  selector_count: z.number().int().nonnegative(),
  custom_property_definition_count: z.number().int().nonnegative(),
  custom_property_reference_count: z.number().int().nonnegative(),
  empty: z.boolean()
})

const bootstrapDataSchema = z.object({
  server: z.object({
    name: z.string(),
    version: z.string(),
    endpoint_path: z.string(),
    current_public_endpoint: z.string().nullable(),
    public_no_auth: z.boolean()
  }),
  repo_root: z.string(),
  css_scope: z.object({
    default: z.string(),
    included_roots: z.array(z.string()),
    reference_roots: z.array(z.string()),
    included_extensions: z.array(z.string()),
    excluded_patterns: z.array(z.string()),
    explicitly_excluded_css: z.array(z.string()),
    runtime_css_file_count: z.number().int().nonnegative(),
    reference_css_file_count: z.number().int().nonnegative(),
    static_only: z.boolean()
  }),
  canonical_tools: z.array(z.string()),
  resources: z.array(z.string()),
  prompts: z.array(z.string()),
  file_groups: z.array(z.string()),
  recommended_workflow: z.array(z.string()),
  public_data_warning: z.string()
})

const inventoryDataSchema = z.object({
  files: z.array(inventoryFileSchema),
  groups: z.record(z.string(), z.number().int().nonnegative()),
  total_files: z.number().int().nonnegative(),
  total_size_bytes: z.number().int().nonnegative()
})

const readDataSchema = z.object({
  files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
      sha256: z.string(),
      size_bytes: z.number().int().nonnegative(),
      line_count: z.number().int().nonnegative(),
      truncated: z.boolean()
    })
  ),
  denied_files: z.array(z.string()),
  missing_files: z.array(z.string())
})

const searchDataSchema = z.object({
  query: z.string(),
  matches: z.array(
    z.object({
      path: z.string(),
      line: z.number().int().positive(),
      text: z.string()
    })
  ),
  searched_files: z.number().int().nonnegative()
})

const dependencyGraphDataSchema = z.object({
  root: z.string(),
  nodes: z.array(
    z.object({
      path: z.string(),
      group: z.string(),
      reachable_from_root: z.boolean(),
      referenced_by_code: z.boolean()
    })
  ),
  edges: z.array(
    z.object({
      from: z.string(),
      specifier: z.string(),
      kind: z.string(),
      to: z.string().nullable(),
      exists: z.boolean(),
      allowed: z.boolean()
    })
  ),
  reachable_from_root: z.array(z.string()),
  code_referenced_css: z.array(z.string()),
  orphan_css: z.array(z.string()),
  non_runtime_css: z.array(z.record(z.string(), z.unknown())),
  external_imports: z.array(z.record(z.string(), z.unknown())),
  missing_local_imports: z.array(z.record(z.string(), z.unknown())),
  denied_or_unallowed_imports: z.array(z.record(z.string(), z.unknown()))
})

const tokenIndexDataSchema = z.object({
  default_scope: z.string(),
  used_colors: z.array(z.record(z.string(), z.unknown())),
  semantic_tokens: z.array(z.record(z.string(), z.unknown())),
  tailwind_color_tokens: z.array(z.record(z.string(), z.unknown())),
  raw_source_colors: z.array(z.record(z.string(), z.unknown())),
  direct_color_literals: z.array(z.record(z.string(), z.unknown())),
  definitions: z.array(z.record(z.string(), z.unknown())),
  references: z.array(z.record(z.string(), z.unknown())),
  summary: z.record(z.string(), z.number()),
  duplicate_definitions: z.array(z.record(z.string(), z.unknown())),
  unresolved_static_references: z.array(z.record(z.string(), z.unknown())),
  unresolved_references: z.array(z.record(z.string(), z.unknown())),
  theme_overrides: z.object({
    root: z.array(z.record(z.string(), z.unknown())),
    dark: z.array(z.record(z.string(), z.unknown())),
    theme_classes: z.array(z.record(z.string(), z.unknown()))
  }),
  excluded_candidates_summary: z.record(z.string(), z.unknown()),
  source_usage_summary: z.record(z.string(), z.unknown())
})

const usageContextDataSchema = z.object({
  imports: z.array(z.record(z.string(), z.unknown())),
  literal_references: z.array(z.record(z.string(), z.unknown())),
  module_references: z.array(z.record(z.string(), z.unknown())),
  css_imported_by_code: z.array(z.string()),
  css_referenced_by_code: z.array(z.string()),
  css_not_imported_by_code: z.array(z.string()),
  css_not_referenced_by_code: z.array(z.string())
})

const auditReportDataSchema = z.object({
  generated_at: z.string(),
  file_count: z.number().int().nonnegative(),
  warning_count: z.number().int().nonnegative(),
  warnings: z.array(z.record(z.string(), z.unknown())),
  summary: z.record(z.string(), z.number())
})

function colorAuditWidgetHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Utekos CSS Color Overview</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #ffffff;
        --fg: #171717;
        --muted: #636363;
        --line: #d7d7d7;
        --chip: #f4f4f4;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #101010;
          --fg: #f7f7f7;
          --muted: #ababab;
          --line: #333333;
          --chip: #1b1b1b;
        }
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: var(--bg);
        color: var(--fg);
        font: 14px/1.45 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main { display: grid; gap: 14px; padding: 16px; }
      header { display: grid; gap: 4px; }
      h1 { margin: 0; font-size: 16px; line-height: 1.2; }
      p { margin: 0; color: var(--muted); }
      .metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
      .metric { border: 1px solid var(--line); border-radius: 8px; padding: 10px; }
      .metric strong { display: block; font-size: 20px; line-height: 1.1; }
      .metric span { color: var(--muted); font-size: 12px; }
      .section { border-top: 1px solid var(--line); padding-top: 12px; }
      .tokens { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
      .token {
        border: 1px solid var(--line);
        border-radius: 999px;
        background: var(--chip);
        padding: 5px 8px;
        font-size: 12px;
      }
      .empty { border: 1px dashed var(--line); border-radius: 8px; padding: 14px; color: var(--muted); }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>Utekos CSS Used Colors</h1>
        <p id="scope">Waiting for css_token_index output.</p>
      </header>
      <section class="metrics" aria-label="Color metrics">
        <div class="metric"><strong id="used">0</strong><span>used definitions</span></div>
        <div class="metric"><strong id="excluded">0</strong><span>excluded candidates</span></div>
        <div class="metric"><strong id="semantic">0</strong><span>semantic tokens</span></div>
        <div class="metric"><strong id="raw">0</strong><span>raw source colors</span></div>
      </section>
      <section class="section">
        <p>Core semantic tokens</p>
        <div id="tokens" class="tokens"></div>
      </section>
      <section id="empty" class="empty">Run css_token_index to populate this read-only overview.</section>
    </main>
    <script>
      const ids = {
        scope: document.getElementById('scope'),
        used: document.getElementById('used'),
        excluded: document.getElementById('excluded'),
        semantic: document.getElementById('semantic'),
        raw: document.getElementById('raw'),
        tokens: document.getElementById('tokens'),
        empty: document.getElementById('empty')
      };

      function payloadFrom(value) {
        if (!value) return null;
        if (value.structuredContent) return value.structuredContent;
        if (value.data && value.data.structuredContent) return value.data.structuredContent;
        if (value.result && value.result.structuredContent) return value.result.structuredContent;
        return value;
      }

      function render(value) {
        const envelope = payloadFrom(value);
        const data = envelope && envelope.data ? envelope.data : envelope;
        if (!data || !data.summary) return;
        ids.scope.textContent = data.default_scope || 'runtime-used-colors';
        ids.used.textContent = String(data.summary.definition_count || 0);
        ids.excluded.textContent = String(data.summary.excluded_candidate_count || 0);
        ids.semantic.textContent = String(data.summary.semantic_token_count || 0);
        ids.raw.textContent = String(data.summary.raw_source_color_count || 0);
        ids.tokens.textContent = '';
        (data.semantic_tokens || []).slice(0, 18).forEach(token => {
          const item = document.createElement('span');
          item.className = 'token';
          item.textContent = token.name;
          ids.tokens.appendChild(item);
        });
        ids.empty.hidden = true;
      }

      window.addEventListener('message', event => render(event.data));
      document.addEventListener('openai:set_globals', event => render(event.detail));
      if (window.openai) render(window.openai.toolOutput || window.openai.toolResult);
    </script>
  </body>
</html>`
}

// ---------------------------------------------------------------------------
// Widget HTML — Palette view
// Receives structuredContent from render_color_palette:
//   { palette_name, description, colors: [{ name, value, oklch, hex, category }] }
// ---------------------------------------------------------------------------
function colorPaletteWidgetHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Utekos Color Palette</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #ffffff; --fg: #171717; --muted: #636363;
        --line: #d7d7d7; --chip: #f4f4f4; --card-bg: #f9f9f9;
        --shadow: 0 1px 4px rgba(0,0,0,.08);
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #101010; --fg: #f7f7f7; --muted: #ababab;
          --line: #2a2a2a; --chip: #1b1b1b; --card-bg: #1a1a1a;
          --shadow: 0 1px 4px rgba(0,0,0,.4);
        }
      }
      *, *::before, *::after { box-sizing: border-box; }
      body {
        margin: 0; padding: 16px;
        background: var(--bg); color: var(--fg);
        font: 13px/1.45 system-ui, -apple-system, sans-serif;
      }
      #header { margin-bottom: 14px; }
      #palette-name { margin: 0 0 4px; font-size: 17px; font-weight: 600; }
      #desc { margin: 0; color: var(--muted); font-size: 12px; }
      /* View toggle */
      #toggle {
        display: flex; gap: 6px; margin-bottom: 14px;
      }
      .tab {
        border: 1px solid var(--line); border-radius: 999px;
        background: var(--chip); color: var(--fg);
        padding: 5px 12px; font-size: 12px; cursor: pointer;
        min-block-size: 32px; font: inherit;
        transition: background .15s;
      }
      .tab.active, .tab[aria-pressed="true"] { background: var(--fg); color: var(--bg); border-color: var(--fg); }
      /* Palette grid */
      #palette-view { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 10px; }
      .swatch-card {
        display: block; width: 100%; border: 1px solid var(--line);
        background: transparent; color: inherit; padding: 0;
        border-radius: 10px; overflow: hidden;
        box-shadow: var(--shadow);
        cursor: pointer; transition: transform .12s;
        text-align: start; font: inherit;
      }
      .swatch-card:hover { transform: translateY(-2px); }
      .swatch-card:focus-visible,
      .tab:focus-visible,
      .filter-chip:focus-visible,
      .back-btn:focus-visible,
      #copy-btn:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
      }
      .swatch-color { height: 72px; width: 100%; }
      .swatch-info {
        background: var(--card-bg); border-top: 1px solid var(--line);
        padding: 7px 8px;
      }
      .swatch-name { font-size: 11px; font-weight: 600; line-height: 1.2; word-break: break-all; }
      .swatch-value { font-size: 10px; color: var(--muted); margin-top: 2px; font-family: monospace; }
      /* Single-card view */
      #card-view { display: none; }
      .back-btn {
        display: inline-flex; align-items: center; gap: 5px;
        border: 1px solid var(--line); border-radius: 999px;
        background: var(--chip); color: var(--fg);
        padding: 5px 12px; font-size: 12px; cursor: pointer;
        margin-bottom: 14px; min-block-size: 32px; font: inherit;
      }
      #card-swatch {
        border-radius: 14px; height: 140px;
        box-shadow: var(--shadow); margin-bottom: 14px;
      }
      #card-name { font-size: 20px; font-weight: 700; margin: 0 0 6px; }
      .detail-row {
        display: flex; align-items: baseline; gap: 8px;
        padding: 8px 0; border-bottom: 1px solid var(--line);
      }
      .detail-label { color: var(--muted); font-size: 11px; width: 70px; flex-shrink: 0; }
      .detail-val { font-family: monospace; font-size: 12px; word-break: break-all; }
      #copy-btn {
        margin-top: 14px; width: 100%;
        border: 1px solid var(--line); border-radius: 8px;
        background: var(--chip); color: var(--fg);
        padding: 9px; font-size: 13px; cursor: pointer;
        min-block-size: 36px; font: inherit;
      }
      #copy-btn:active { opacity: .7; }
      /* Category filter chips */
      #filters { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
      .filter-chip {
        border: 1px solid var(--line); border-radius: 999px;
        background: var(--chip); color: var(--fg);
        padding: 4px 10px; font-size: 11px; cursor: pointer;
        min-block-size: 28px; font: inherit;
      }
      .filter-chip.active, .filter-chip[aria-pressed="true"] { background: var(--fg); color: var(--bg); border-color: var(--fg); }
      #empty { color: var(--muted); font-size: 13px; padding: 24px 0; text-align: center; }
    </style>
  </head>
  <body>
    <div id="header">
      <h1 id="palette-name">Utekos Color Palette</h1>
      <p id="desc">Waiting for render_color_palette output.</p>
    </div>
    <div id="toggle">
      <button class="tab active" data-view="palette">Palette</button>
      <button class="tab" data-view="card">Chosen card</button>
    </div>
    <div id="filters"></div>
    <div id="palette-view"><div id="empty">No color data yet. Ask ChatGPT to render a palette.</div></div>
    <div id="card-view">
      <button class="back-btn" id="back-btn">&#8592; Back to palette</button>
      <div id="card-swatch"></div>
      <h2 id="card-name"></h2>
      <div id="card-details"></div>
      <button id="copy-btn">Copy CSS variable</button>
    </div>
    <script>
      let allColors = []
      let activeCategory = 'all'
      let selectedColor = null
      let currentView = 'palette'

      const els = {
        paletteName: document.getElementById('palette-name'),
        desc: document.getElementById('desc'),
        paletteView: document.getElementById('palette-view'),
        cardView: document.getElementById('card-view'),
        filters: document.getElementById('filters'),
        empty: document.getElementById('empty'),
        cardSwatch: document.getElementById('card-swatch'),
        cardName: document.getElementById('card-name'),
        cardDetails: document.getElementById('card-details'),
        copyBtn: document.getElementById('copy-btn'),
        backBtn: document.getElementById('back-btn'),
        toggleBtns: document.querySelectorAll('#toggle .tab')
      }

      function setView(view) {
        currentView = view
        els.paletteView.style.display = view === 'palette' ? 'grid' : 'none'
        els.cardView.style.display = view === 'card' ? 'block' : 'none'
        els.toggleBtns.forEach(b => {
          const active = b.dataset.view === view
          b.classList.toggle('active', active)
          b.setAttribute('aria-pressed', active ? 'true' : 'false')
        })
      }

      els.toggleBtns.forEach(b => b.addEventListener('click', () => setView(b.dataset.view)))
      els.backBtn.addEventListener('click', () => setView('palette'))

      els.copyBtn.addEventListener('click', () => {
        if (!selectedColor) return
        const text = tokenName(selectedColor.name) + ': ' + (selectedColor.value || selectedColor.oklch || selectedColor.hex || '') + ';'
        navigator.clipboard?.writeText(text).catch(() => {})
        els.copyBtn.textContent = 'Copied!'
        setTimeout(() => { els.copyBtn.textContent = 'Copy CSS variable' }, 1400)
      })

      function tokenName(name) {
        const raw = String(name || '').trim()
        if (!raw) return '--color-unknown'
        return raw.startsWith('--') ? raw : '--color-' + raw
      }

      function colorPaint(color) {
        return color?.oklch || color?.hex || color?.value || 'transparent'
      }

      function renderEmpty(message) {
        els.paletteView.textContent = ''
        const empty = document.createElement('div')
        empty.id = 'empty'
        empty.textContent = message
        els.paletteView.appendChild(empty)
      }

      function appendDetailRow(parent, label, val) {
        const row = document.createElement('div')
        row.className = 'detail-row'
        const labelEl = document.createElement('span')
        labelEl.className = 'detail-label'
        labelEl.textContent = label
        const valEl = document.createElement('span')
        valEl.className = 'detail-val'
        valEl.textContent = String(val || '—')
        row.appendChild(labelEl)
        row.appendChild(valEl)
        parent.appendChild(row)
      }

      function renderFilters(colors) {
        const cats = ['all', ...new Set(colors.map(c => c.category || 'misc').filter(Boolean))]
        els.filters.textContent = ''
        cats.forEach(cat => {
          const btn = document.createElement('button')
          btn.type = 'button'
          btn.className = 'filter-chip' + (cat === activeCategory ? ' active' : '')
          btn.setAttribute('aria-pressed', cat === activeCategory ? 'true' : 'false')
          btn.textContent = cat
          btn.addEventListener('click', () => { activeCategory = cat; renderPalette() })
          els.filters.appendChild(btn)
        })
      }

      function renderPalette() {
        const visible = activeCategory === 'all' ? allColors
          : allColors.filter(c => (c.category || 'misc') === activeCategory)
        els.paletteView.textContent = ''
        if (!visible.length) {
          renderEmpty('No colors in this category.')
          return
        }
        visible.forEach(color => {
          const card = document.createElement('button')
          card.type = 'button'
          card.className = 'swatch-card'
          card.setAttribute('aria-label', 'Open ' + String(color.name || 'color') + ' color details')
          const swatch = document.createElement('div')
          swatch.className = 'swatch-color'
          swatch.style.backgroundColor = colorPaint(color)
          const info = document.createElement('div')
          info.className = 'swatch-info'
          const name = document.createElement('div')
          name.className = 'swatch-name'
          name.textContent = color.name || 'Unknown color'
          const value = document.createElement('div')
          value.className = 'swatch-value'
          value.textContent = String(color.hex || color.value || '').slice(0, 18)
          info.appendChild(name)
          info.appendChild(value)
          card.appendChild(swatch)
          card.appendChild(info)
          card.addEventListener('click', () => showCard(color))
          els.paletteView.appendChild(card)
        })
      }

      function showCard(color) {
        selectedColor = color
        els.cardSwatch.style.backgroundColor = colorPaint(color)
        els.cardName.textContent = color.name || 'Unknown color'
        const rows = [
          { label: 'CSS var', val: tokenName(color.name) },
          { label: 'Value', val: color.value || '—' },
          { label: 'OKLCH', val: color.oklch || '—' },
          { label: 'Hex', val: color.hex || '—' },
          { label: 'RGB', val: color.rgb || '—' },
          { label: 'HSL', val: color.hsl || '—' },
          { label: 'Category', val: color.category || '—' },
          { label: 'Usage', val: Array.isArray(color.usage_in_tokens) ? color.usage_in_tokens.join(', ') : '—' }
        ]
        els.cardDetails.textContent = ''
        rows.filter(row => row.val !== '—').forEach(row => appendDetailRow(els.cardDetails, row.label, row.val))
        setView('card')
      }

      function payloadFrom(val) {
        if (!val) return null
        if (val.structuredContent) return val.structuredContent
        if (val.data?.structuredContent) return val.data.structuredContent
        return val
      }

      function render(raw) {
        const sc = payloadFrom(raw)
        const data = sc?.data ?? sc
        if (!data?.colors?.length) return
        allColors = data.colors
        els.paletteName.textContent = data.palette_name || 'Utekos Colors'
        els.desc.textContent = data.description || (data.colors.length + ' colors')
        renderFilters(allColors)
        renderPalette()
        // if incoming data specifies a single focused color, jump to card view
        if (data.focused_color) showCard(data.focused_color)
      }

      // MCP Apps bridge
      window.addEventListener('message', event => {
        if (event.source !== window.parent) return
        const msg = event.data
        if (!msg || msg.jsonrpc !== '2.0') return
        if (msg.method === 'ui/notifications/tool-result') render(msg.params)
      }, { passive: true })
      // Apps SDK compat
      window.addEventListener('openai:set_globals', e => render(e.detail?.globals?.toolOutput ?? e.detail), { passive: true })
      if (window.openai) render(window.openai.toolOutput || window.openai.toolResult)
    </script>
  </body>
</html>`
}

// ---------------------------------------------------------------------------
// Widget HTML — Single Color Card (deep-dive)
// Receives structuredContent from render_color_card:
//   { name, value, oklch, hex, rgb, hsl, category, usage_in_tokens, description }
// ---------------------------------------------------------------------------
function colorCardWidgetHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Utekos Color Card</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #ffffff; --fg: #171717; --muted: #636363;
        --line: #d7d7d7; --chip: #f4f4f4;
        --shadow: 0 2px 12px rgba(0,0,0,.10);
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #101010; --fg: #f7f7f7; --muted: #ababab;
          --line: #2a2a2a; --chip: #1b1b1b;
          --shadow: 0 2px 12px rgba(0,0,0,.5);
        }
      }
      *, *::before, *::after { box-sizing: border-box; }
      body {
        margin: 0; padding: 16px;
        background: var(--bg); color: var(--fg);
        font: 13px/1.5 system-ui, -apple-system, sans-serif;
      }
      #swatch {
        border-radius: 16px; height: 160px; width: 100%;
        box-shadow: var(--shadow); margin-bottom: 16px;
      }
      #color-name { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
      #color-cat { font-size: 12px; color: var(--muted); margin: 0 0 16px; }
      .row {
        display: flex; align-items: flex-start; gap: 10px;
        padding: 9px 0; border-bottom: 1px solid var(--line);
      }
      .row:last-of-type { border-bottom: none; }
      .label { color: var(--muted); font-size: 11px; width: 72px; flex-shrink: 0; padding-top: 1px; }
      .val { font-family: monospace; font-size: 12px; word-break: break-all; flex: 1; }
      #usage-section { margin-top: 14px; }
      #usage-label { font-size: 12px; font-weight: 600; margin-bottom: 8px; color: var(--muted); }
      #usage-list { display: flex; flex-wrap: wrap; gap: 6px; }
      .usage-chip {
        border: 1px solid var(--line); border-radius: 999px;
        background: var(--chip); padding: 4px 10px; font-size: 11px;
        font-family: monospace;
      }
      #copy-row { display: flex; gap: 8px; margin-top: 16px; }
      .copy-btn {
        flex: 1; border: 1px solid var(--line); border-radius: 8px;
        background: var(--chip); color: var(--fg);
        padding: 9px 6px; font-size: 12px; cursor: pointer;
        min-block-size: 36px; font: inherit;
      }
      .copy-btn:active { opacity: .7; }
      .copy-btn:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
      }
      #empty {
        border: 1px dashed var(--line); border-radius: 12px;
        padding: 24px; color: var(--muted); text-align: center;
      }
    </style>
  </head>
  <body>
    <div id="empty">Ask ChatGPT to show a color card for a specific Utekos color.</div>
    <div id="content" style="display:none">
      <div id="swatch"></div>
      <h1 id="color-name"></h1>
      <p id="color-cat"></p>
      <div id="rows"></div>
      <div id="usage-section">
        <div id="usage-label">Used in semantic tokens</div>
        <div id="usage-list"></div>
      </div>
      <div id="copy-row">
        <button class="copy-btn" id="copy-var">Copy var()</button>
        <button class="copy-btn" id="copy-val">Copy value</button>
      </div>
    </div>
    <script>
      let colorData = null
      const els = {
        empty: document.getElementById('empty'),
        content: document.getElementById('content'),
        swatch: document.getElementById('swatch'),
        name: document.getElementById('color-name'),
        cat: document.getElementById('color-cat'),
        rows: document.getElementById('rows'),
        usageList: document.getElementById('usage-list'),
        copyVar: document.getElementById('copy-var'),
        copyVal: document.getElementById('copy-val')
      }

      els.copyVar.addEventListener('click', () => {
        if (!colorData) return
        navigator.clipboard?.writeText('var(' + tokenName(colorData.name) + ')').catch(() => {})
        els.copyVar.textContent = 'Copied!'
        setTimeout(() => { els.copyVar.textContent = 'Copy var()' }, 1400)
      })
      els.copyVal.addEventListener('click', () => {
        if (!colorData) return
        navigator.clipboard?.writeText(colorData.value || colorData.oklch || colorData.hex || '').catch(() => {})
        els.copyVal.textContent = 'Copied!'
        setTimeout(() => { els.copyVal.textContent = 'Copy value' }, 1400)
      })

      function payloadFrom(val) {
        if (!val) return null
        if (val.structuredContent) return val.structuredContent
        if (val.data?.structuredContent) return val.data.structuredContent
        return val
      }

      function tokenName(name) {
        const raw = String(name || '').trim()
        if (!raw) return '--color-unknown'
        return raw.startsWith('--') ? raw : '--color-' + raw
      }

      function colorPaint(data) {
        return data?.oklch || data?.hex || data?.value || 'transparent'
      }

      function appendRow(parent, label, val) {
        const row = document.createElement('div')
        row.className = 'row'
        const labelEl = document.createElement('span')
        labelEl.className = 'label'
        labelEl.textContent = label
        const valEl = document.createElement('span')
        valEl.className = 'val'
        valEl.textContent = String(val || '—')
        row.appendChild(labelEl)
        row.appendChild(valEl)
        parent.appendChild(row)
      }

      function render(raw) {
        const sc = payloadFrom(raw)
        const data = sc?.data ?? sc
        if (!data?.name) return
        colorData = data
        els.empty.style.display = 'none'
        els.content.style.display = 'block'
        els.swatch.style.backgroundColor = colorPaint(data)
        els.name.textContent = data.name
        els.cat.textContent = data.category ? 'Category: ' + data.category : ''
        const fields = [
          { label: 'CSS var', val: tokenName(data.name) },
          { label: 'Value', val: data.value || '—' },
          { label: 'OKLCH', val: data.oklch || '—' },
          { label: 'Hex', val: data.hex || '—' },
          { label: 'RGB', val: data.rgb || '—' },
          { label: 'HSL', val: data.hsl || '—' },
          { label: 'Description', val: data.description || '—' }
        ]
        els.rows.textContent = ''
        fields.filter(f => f.val !== '—').forEach(f => appendRow(els.rows, f.label, f.val))
        els.usageList.textContent = ''
        ;(data.usage_in_tokens || []).forEach(tok => {
          const chip = document.createElement('span')
          chip.className = 'usage-chip'
          chip.textContent = tok
          els.usageList.appendChild(chip)
        })
        document.getElementById('usage-section').style.display =
          (data.usage_in_tokens?.length) ? 'block' : 'none'
      }

      window.addEventListener('message', event => {
        if (event.source !== window.parent) return
        const msg = event.data
        if (!msg || msg.jsonrpc !== '2.0') return
        if (msg.method === 'ui/notifications/tool-result') render(msg.params)
      }, { passive: true })
      window.addEventListener('openai:set_globals', e => render(e.detail?.globals?.toolOutput ?? e.detail), { passive: true })
      if (window.openai) render(window.openai.toolOutput || window.openai.toolResult)
    </script>
  </body>
</html>`
}

function createServer() {
  const server = new McpServer({
    name: 'utekos-css-insight-public',
    version: serverVersion,
    websiteUrl: 'https://utekos.no'
  })

  server.registerTool(
    'css_insight_bootstrap',
    {
      title: 'CSS Insight Bootstrap',
      description: 'Use this when starting CSS work. Returns the static, read-only, public no-auth runtime-used-colors scope, excluded reference roots, available tools, resources, and recommended workflow.',
      inputSchema: z.object({}),
      outputSchema: envelopeSchema('css_insight_bootstrap', bootstrapDataSchema),
      annotations: toolAnnotations,
      _meta: toolMeta('Loading CSS insight scope', 'CSS insight scope loaded')
    },
    async () => {
      const startedAt = nowIso()
      const groups = unique([...listCssFiles().map(cssGroup), 'excluded-reference'])
      const runtimeFiles = listCssFiles()
      const data = {
        server: {
          name: 'utekos-css-insight-public',
          version: serverVersion,
          endpoint_path: mcpPath,
          current_public_endpoint: process.env.UTEKOS_CSS_INSIGHT_PUBLIC_URL ?? null,
          public_no_auth: true
        },
        repo_root: repoRoot,
        css_scope: {
          default: defaultScope,
          included_roots: allowedRoots,
          reference_roots: referenceRoots,
          included_extensions: cssExtensions,
          excluded_patterns: generatedAndSecretPatterns,
          explicitly_excluded_css: explicitlyExcludedCss,
          runtime_css_file_count: runtimeFiles.length,
          reference_css_file_count: listReferenceCssFiles().length,
          static_only: true
        },
        canonical_tools: canonicalTools,
        resources: canonicalResources,
        prompts: ['css_change_context'],
        file_groups: groups,
        recommended_workflow: [
          'Call css_insight_bootstrap first.',
          'Call css_source_inventory to identify exact runtime CSS files and groups.',
          'Call css_dependency_graph and css_token_index before CSS/token/color recommendations.',
          'Call read_css_sources for exact files before proposing changes.',
          'Use css_audit_report to identify static risks and gaps.'
        ],
        public_data_warning: 'This server intentionally has no auth. It exposes only static runtime CSS and used-color metadata; .agents/css is excluded/reference-only.'
      }

      return textResult(
        createEnvelope('css_insight_bootstrap', startedAt, data, {
          next: ['Call css_source_inventory, css_dependency_graph, and css_token_index.']
        })
      )
    }
  )

  server.registerTool(
    'css_source_inventory',
    {
      title: 'CSS Source Inventory',
      description: 'Use this when you need the default runtime CSS inventory. Static, read-only, public, no-auth, and color-scope limited; excludes .agents/css candidate palettes.',
      inputSchema: z.object({}),
      outputSchema: envelopeSchema('css_source_inventory', inventoryDataSchema),
      annotations: toolAnnotations,
      _meta: toolMeta('Building CSS inventory', 'CSS inventory ready')
    },
    async () => {
      const startedAt = nowIso()
      const files = inventory()
      const groups = {}
      for (const file of files) groups[file.group] = (groups[file.group] ?? 0) + 1
      const data = {
        files,
        groups,
        total_files: files.length,
        total_size_bytes: files.reduce((sum, file) => sum + file.size_bytes, 0)
      }

      return textResult(
        createEnvelope('css_source_inventory', startedAt, data, {
          sources: files.map(file => ({
            path: file.path,
            sha256: file.sha256,
            size_bytes: file.size_bytes,
            line_count: file.line_count
          })),
          next: ['Call read_css_sources for exact content or css_dependency_graph for import topology.']
        })
      )
    }
  )

  server.registerTool(
    'read_css_sources',
    {
      title: 'Read CSS Sources',
      description: 'Use this when exact runtime CSS source text is required. Static, read-only, public, no-auth, and default-scope limited; .agents/css, non-runtime CSS, secrets, generated files, non-CSS, and path escapes are denied.',
      inputSchema: z.object({
        paths: z.array(z.string()).min(1).max(60),
        max_bytes_per_file: z.number().int().min(1000).max(500000).optional()
      }),
      outputSchema: envelopeSchema('read_css_sources', readDataSchema),
      annotations: toolAnnotations,
      _meta: toolMeta('Reading runtime CSS sources', 'Runtime CSS sources read')
    },
    async ({ paths, max_bytes_per_file: maxBytesPerFile }) => {
      const startedAt = nowIso()
      const maxBytes = maxBytesPerFile ?? 100000
      const files = []
      const deniedFiles = []
      const missingFiles = []
      const warnings = []

      for (const requestedPath of paths) {
        try {
          const resolved = resolveProjectPath(requestedPath)
          if (!fs.existsSync(resolved.absolute)) {
            missingFiles.push(resolved.relative)
            continue
          }
          const file = readTextFile(resolved.relative, maxBytes)
          files.push(file)
          if (file.truncated) warnings.push(`${file.path} truncated at ${maxBytes} bytes`)
        } catch (error) {
          deniedFiles.push(requestedPath)
          warnings.push(`${requestedPath}: ${error instanceof Error ? error.message : String(error)}`)
        }
      }

      return textResult(
        createEnvelope(
          'read_css_sources',
          startedAt,
          { files, denied_files: deniedFiles, missing_files: missingFiles },
          {
            ok: deniedFiles.length === 0,
            sources: files.map(fileSource),
            warnings,
            errors:
              deniedFiles.length === 0 ?
                []
              : [
                  makeError(
                    'UTEKOS_CSS_DENIED_PATH',
                    'One or more requested paths were denied by CSS insight policy.',
                    `Request only files returned by css_source_inventory in the default ${defaultScope} scope.`
                  )
                ],
            limits: { max_bytes_per_file: maxBytes },
            next: ['Use css_token_index or css_dependency_graph for cross-file context.']
          }
        )
      )
    }
  )

  server.registerTool(
    'search_css_sources',
    {
      title: 'Search CSS Sources',
      description: 'Use this when you need literal search across default runtime CSS. Static, read-only, public, no-auth, and color-scope limited; .agents/css and non-runtime CSS are excluded.',
      inputSchema: z.object({
        query: z.string().min(2).max(200),
        limit: z.number().int().min(1).max(500).optional()
      }),
      outputSchema: envelopeSchema('search_css_sources', searchDataSchema),
      annotations: toolAnnotations,
      _meta: toolMeta('Searching runtime CSS', 'Runtime CSS search complete')
    },
    async ({ query, limit }) => {
      const startedAt = nowIso()
      const maxMatches = limit ?? 100
      const matches = []
      const files = listCssFiles()

      for (const filePath of files) {
        if (matches.length >= maxMatches) break
        const file = readTextFile(filePath, 1000000)
        const lines = file.content.split('\n')
        for (let index = 0; index < lines.length; index += 1) {
          if (matches.length >= maxMatches) break
          if (!lines[index].includes(query)) continue
          matches.push({
            path: file.path,
            line: index + 1,
            text: lines[index].trim().slice(0, 600)
          })
        }
      }

      return textResult(
        createEnvelope(
          'search_css_sources',
          startedAt,
          { query, matches, searched_files: files.length },
          {
            warnings: matches.length === 0 ? ['No matches found.'] : [],
            limits: { limit: maxMatches },
            next: matches.length > 0 ? ['Call read_css_sources for exact matched files.'] : ['Try a more specific CSS selector, token, or at-rule.']
          }
        )
      )
    }
  )

  server.registerTool(
    'css_dependency_graph',
    {
      title: 'CSS Dependency Graph',
      description: 'Use this when you need runtime CSS topology. Static, read-only, public, no-auth, and color-scope limited; shows src/globals.css reachability, code-referenced CSS, and excluded non-runtime CSS.',
      inputSchema: z.object({}),
      outputSchema: envelopeSchema('css_dependency_graph', dependencyGraphDataSchema),
      annotations: toolAnnotations,
      _meta: toolMeta('Building CSS dependency graph', 'CSS dependency graph ready')
    },
    async () => {
      const startedAt = nowIso()
      const data = dependencyGraph()
      return textResult(
        createEnvelope('css_dependency_graph', startedAt, data, {
          sources: data.nodes.map(node => ({ path: node.path })),
          warnings: data.missing_local_imports.length > 0 ? [`${data.missing_local_imports.length} missing local CSS import(s).`] : [],
          next: ['Call css_usage_context to distinguish route/component CSS imported by code from non-runtime assets.']
        })
      )
    }
  )

  server.registerTool(
    'css_token_index',
    {
      title: 'CSS Used Color Index',
      description: 'Use this when you need the actual used CSS color/token graph. Static, read-only, public, no-auth, and color-scope limited; returns semantic tokens, Tailwind bridge tokens, reached raw source colors, direct color literals, and excluded candidate counts.',
      inputSchema: z.object({}),
      outputSchema: envelopeSchema('css_token_index', tokenIndexDataSchema),
      annotations: toolAnnotations,
      _meta: toolMeta('Analyzing used CSS colors', 'Used CSS colors ready', {
        ui: { resourceUri: widgetTemplateUri },
        'openai/outputTemplate': widgetTemplateUri
      })
    },
    async () => {
      const startedAt = nowIso()
      const data = tokenIndex()
      return textResultWithMeta(
        createEnvelope('css_token_index', startedAt, data, {
          sources: unique(data.definitions.map(item => item.path)).map(filePath => ({ path: filePath })),
          warnings:
            data.unresolved_references.length > 0 ?
              [`${data.unresolved_references.length} unresolved used color reference(s).`]
            : [],
          next: ['Call read_css_sources for files defining or referencing relevant tokens.']
        }),
        { 'openai/outputTemplate': widgetTemplateUri, ui: { resourceUri: widgetTemplateUri } }
      )
    }
  )

  server.registerTool(
    'css_usage_context',
    {
      title: 'CSS Usage Context',
      description: 'Use this when you need source-code CSS usage context. Static, read-only, public, no-auth, and color-scope limited; reports runtime CSS imports, CSS module references, and literal CSS path references.',
      inputSchema: z.object({}),
      outputSchema: envelopeSchema('css_usage_context', usageContextDataSchema),
      annotations: toolAnnotations,
      _meta: toolMeta('Finding CSS usage context', 'CSS usage context ready')
    },
    async () => {
      const startedAt = nowIso()
      const data = usageContext()
      return textResult(
        createEnvelope('css_usage_context', startedAt, data, {
          sources: unique(data.imports.map(item => item.source_path)).map(filePath => ({ path: filePath })),
          next: ['Compare css_dependency_graph.orphan_css with css_imported_by_code before calling CSS non-runtime.']
        })
      )
    }
  )

  server.registerTool(
    'css_audit_report',
    {
      title: 'CSS Audit Report',
      description: 'Use this when you need a static CSS risk report. Read-only, public, no-auth, and color-scope limited; covers missing imports, empty files, unresolved used color refs, duplicate used tokens, and excluded non-runtime CSS.',
      inputSchema: z.object({}),
      outputSchema: envelopeSchema('css_audit_report', auditReportDataSchema),
      annotations: toolAnnotations,
      _meta: toolMeta('Running CSS audit', 'CSS audit ready')
    },
    async () => {
      const startedAt = nowIso()
      const data = auditReport()
      return textResult(
        createEnvelope('css_audit_report', startedAt, data, {
          ok: data.summary.errors === 0,
          warnings: data.warning_count > 0 ? [`${data.warning_count} static CSS audit finding(s).`] : [],
          next: ['Use read_css_sources and css_token_index for any file or token named in warnings.']
        })
      )
    }
  )

  const colorWidgetColorSchema = z.object({
    name: z.string().describe('CSS variable name with or without the --color- prefix, e.g. "havdyp" or "--primary"'),
    value: z.string().optional().describe('Raw CSS value (oklch(...), hex, etc.)'),
    oklch: z.string().optional().describe('OKLCH string if available'),
    hex: z.string().optional().describe('Hex string if available'),
    rgb: z.string().optional().describe('RGB string if available'),
    hsl: z.string().optional().describe('HSL string if available'),
    category: z.string().optional().describe('Grouping label, e.g. "semantic", "raw", "brand"'),
    description: z.string().optional().describe('Human-readable description of the color'),
    usage_in_tokens: z
      .array(z.string())
      .optional()
      .describe('Semantic token names that reference this color, e.g. ["--primary", "--checkout-button"]')
  })

  // -------------------------------------------------------------------------
  // render_color_palette — render tool; requires color data from css_token_index
  // -------------------------------------------------------------------------
  server.registerTool(
    'render_color_palette',
    {
      title: 'Render Color Palette Widget',
      description:
        'Use this when you need to show the Utekos color palette widget. Pass an array of colors from css_token_index output. ' +
        'Always call css_token_index first, then pass its colors here to render the interactive palette UI. ' +
        'Supports palette_name, description, and an optional focused_color for auto-opening the detail card.',
      inputSchema: z.object({
        palette_name: z.string().optional().describe('Display title for the palette, e.g. "Havdyp palette"'),
        description: z.string().optional().describe('Short description shown below the title'),
        colors: z
          .array(
            colorWidgetColorSchema
          )
          .min(1)
          .max(200),
        focused_color: colorWidgetColorSchema
          .optional()
          .describe('If set, widget opens directly to the single-card detail view for this color')
      }),
      outputSchema: z.object({
        palette_name: z.string(),
        description: z.string(),
        color_count: z.number().int(),
        colors: z.array(colorWidgetColorSchema),
        focused_color: colorWidgetColorSchema.optional()
      }),
      annotations: toolAnnotations,
      _meta: {
        ...toolMeta('Rendering color palette', 'Color palette ready'),
        ui: { resourceUri: paletteWidgetUri },
        'openai/outputTemplate': paletteWidgetUri
      }
    },
    async ({ palette_name, description, colors, focused_color }) => {
      const sc = {
        palette_name: palette_name ?? 'Utekos Colors',
        description: description ?? (colors.length + ' colors'),
        color_count: colors.length,
        colors,
        ...(focused_color ? { focused_color } : {})
      }
      return {
        structuredContent: sc,
        content: [
          {
            type: 'text',
            text: 'Palette "' + sc.palette_name + '" — ' + sc.color_count + ' colors.'
          }
        ]
      }
    }
  )

  // -------------------------------------------------------------------------
  // render_color_card — render tool; requires a single color entry
  // -------------------------------------------------------------------------
  server.registerTool(
    'render_color_card',
    {
      title: 'Render Single Color Card',
      description:
        'Use this when you need to show a deep-dive card widget for a single Utekos color. ' +
        'Always call css_token_index first, then pass the resolved color fields here. ' +
        'Shows swatch, all color-space values, semantic token usage, and copy buttons.',
      inputSchema: z.object({
        name: z.string().describe('CSS variable name without --color- prefix, e.g. "flame-orange"'),
        value: z.string().optional().describe('Raw CSS value from the token definition'),
        oklch: z.string().optional().describe('OKLCH string'),
        hex: z.string().optional().describe('Hex string'),
        rgb: z.string().optional().describe('RGB string'),
        hsl: z.string().optional().describe('HSL string'),
        category: z.string().optional().describe('E.g. "semantic", "raw", "brand"'),
        description: z.string().optional().describe('Human-readable description of the color'),
        usage_in_tokens: z
          .array(z.string())
          .optional()
          .describe('Semantic token names that reference this color, e.g. ["--primary", "--checkout-button"]')
      }),
      outputSchema: z.object({
        name: z.string(),
        value: z.string().optional(),
        oklch: z.string().optional(),
        hex: z.string().optional(),
        rgb: z.string().optional(),
        hsl: z.string().optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        usage_in_tokens: z.array(z.string()).optional()
      }),
      annotations: toolAnnotations,
      _meta: {
        ...toolMeta('Rendering color card', 'Color card ready'),
        ui: { resourceUri: cardWidgetUri },
        'openai/outputTemplate': cardWidgetUri
      }
    },
    async ({ name, value, oklch, hex, rgb, hsl, category, description, usage_in_tokens }) => {
      const sc = { name, value, oklch, hex, rgb, hsl, category, description, usage_in_tokens }
      return {
        structuredContent: sc,
        content: [
          {
            type: 'text',
            text: 'Color card: --color-' + name + (value ? ' = ' + value : '') + (category ? ' (' + category + ')' : '')
          }
        ]
      }
    }
  )

  server.registerResource(
    'css-inventory',
    'utekos-css://inventory',
    {
      title: 'Utekos CSS Inventory',
      description: 'JSON inventory of public runtime CSS files in the default runtime-used-colors scope.',
      mimeType: 'application/json'
    },
    async uri => ({
      contents: [{ uri: uri.toString(), mimeType: 'application/json', text: JSON.stringify(inventory(), null, 2) }]
    })
  )

  server.registerResource(
    'css-graph',
    'utekos-css://graph',
    {
      title: 'Utekos CSS Dependency Graph',
      description: 'JSON @import graph rooted at src/globals.css.',
      mimeType: 'application/json'
    },
    async uri => ({
      contents: [{ uri: uri.toString(), mimeType: 'application/json', text: JSON.stringify(dependencyGraph(), null, 2) }]
    })
  )

  server.registerResource(
    'css-tokens',
    'utekos-css://tokens',
    {
      title: 'Utekos CSS Used Color Index',
      description: 'JSON index of runtime-used CSS colors, semantic tokens, reached raw source colors, and excluded candidate counts.',
      mimeType: 'application/json'
    },
    async uri => ({
      contents: [{ uri: uri.toString(), mimeType: 'application/json', text: JSON.stringify(tokenIndex(), null, 2) }]
    })
  )

  server.registerResource(
    'css-color-audit-widget',
    widgetTemplateUri,
    {
      title: 'Utekos CSS Color Overview',
      description: 'Read-only ChatGPT UI for the used CSS color overview.',
      mimeType: 'text/html;profile=mcp-app'
    },
    async uri => ({
      contents: [
        {
          uri: uri.toString(),
          mimeType: 'text/html;profile=mcp-app',
          text: colorAuditWidgetHtml(),
          _meta: {
            'openai/widgetDescription': 'Compact read-only overview of Utekos runtime-used CSS color tokens and excluded candidates.',
            'openai/widgetPrefersBorder': true,
            'openai/widgetCSP': {
              connect_domains: [],
              resource_domains: []
            },
            ui: {
              prefersBorder: true,
              csp: {
                connectDomains: [],
                resourceDomains: []
              }
            }
          }
        }
      ]
    })
  )

  server.registerResource(
    'css-color-palette-widget',
    paletteWidgetUri,
    {
      title: 'Utekos Color Palette Widget',
      description: 'Interactive ChatGPT palette UI: swatch grid, category filter chips, and single-color detail card. Populated by render_color_palette.',
      mimeType: 'text/html;profile=mcp-app'
    },
    async uri => ({
      contents: [
        {
          uri: uri.toString(),
          mimeType: 'text/html;profile=mcp-app',
          text: colorPaletteWidgetHtml(),
          _meta: {
            'openai/widgetDescription': 'Interactive Utekos color palette — browse swatches by category or open a deep-dive card for any color.',
            'openai/widgetPrefersBorder': true,
            'openai/widgetCSP': {
              connect_domains: [],
              resource_domains: []
            },
            ui: {
              prefersBorder: true,
              csp: { connectDomains: [], resourceDomains: [] }
            }
          }
        }
      ]
    })
  )

  server.registerResource(
    'css-color-card-widget',
    cardWidgetUri,
    {
      title: 'Utekos Single Color Card Widget',
      description: 'Deep-dive ChatGPT card for one Utekos color: swatch, all color-space values, semantic token usage, and copy buttons. Populated by render_color_card.',
      mimeType: 'text/html;profile=mcp-app'
    },
    async uri => ({
      contents: [
        {
          uri: uri.toString(),
          mimeType: 'text/html;profile=mcp-app',
          text: colorCardWidgetHtml(),
          _meta: {
            'openai/widgetDescription': 'Single-color deep-dive: swatch, OKLCH/hex/rgb values, semantic token usage, and clipboard copy.',
            'openai/widgetPrefersBorder': true,
            'openai/widgetCSP': {
              connect_domains: [],
              resource_domains: []
            },
            ui: {
              prefersBorder: true,
              csp: { connectDomains: [], resourceDomains: [] }
            }
          }
        }
      ]
    })
  )

  server.registerResource(
    'css-file',
    new ResourceTemplate('utekos-css://file/{encodedPath}', {
      list: async () => ({
        resources: listCssFiles().map(filePath => ({
          uri: `utekos-css://file/${encodeURIComponent(filePath)}`,
          name: filePath,
          title: filePath,
          mimeType: 'text/css'
        }))
      }),
      complete: {
        encodedPath: value =>
          listCssFiles()
            .filter(filePath => filePath.includes(value))
            .slice(0, 50)
            .map(filePath => encodeURIComponent(filePath))
      }
    }),
    {
      title: 'Utekos CSS File',
      description: 'Read a single runtime CSS source file in the default runtime-used-colors scope. encodedPath must be encodeURIComponent(path).',
      mimeType: 'text/css'
    },
    async (uri, variables) => {
      const encodedPath = String(variables.encodedPath ?? '')
      const requestedPath = decodeURIComponent(encodedPath)
      const file = readTextFile(requestedPath, 500000)
      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: 'text/css',
            text: file.content
          }
        ]
      }
    }
  )

  server.registerPrompt(
    'css_change_context',
    {
      title: 'CSS Change Context',
      description: 'Instruction template for agents before recommending or implementing CSS changes in Utekos.',
      argsSchema: {
        task: z.string().describe('The CSS or design-system task to investigate.'),
        paths: z.string().optional().describe('Optional comma-separated CSS paths already suspected relevant.')
      }
    },
    async ({ task, paths }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              `Task: ${task}`,
              paths ? `Suspected CSS paths: ${paths}` : 'Suspected CSS paths: none supplied',
              '',
              'Before recommending changes:',
              '1. Call css_insight_bootstrap.',
              '2. Call css_source_inventory.',
              '3. Call css_dependency_graph and css_token_index for the runtime-used color graph.',
              '4. If selectors/tokens/files are named, call search_css_sources and then read_css_sources for exact files.',
              '5. Treat this MCP surface as public read-only static CSS context; .agents/css is reference-only/excluded and browser-computed styles are outside scope.'
            ].join('\n')
          }
        }
      ]
    })
  )

  return server
}

export function createApp() {
  const allowedHosts =
    process.env.MCP_ALLOWED_HOSTS?.split(',')
      .map(item => item.trim())
      .filter(Boolean) ?? undefined
  const app = createMcpExpressApp({ host, allowedHosts })

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, MCP-Protocol-Version, Mcp-Session-Id, Mcp-Method, Mcp-Name, Last-Event-ID')
    res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id')
    if (req.method === 'OPTIONS') {
      res.status(204).end()
      return
    }
    next()
  })

  app.get('/', (_req, res) => {
    res.json({
      name: 'utekos-css-insight-public',
      version: serverVersion,
      mcp_endpoint: mcpPath,
      health: ['/healthz', '/readyz'],
      public_no_auth: true,
      scope: {
        default: defaultScope,
        allowed_roots: allowedRoots,
        reference_roots: referenceRoots,
        explicitly_excluded_css: explicitlyExcludedCss,
        allowed_extensions: cssExtensions
      },
      resources: canonicalResources,
      tools: canonicalTools
    })
  })

  app.get('/healthz', (_req, res) => {
    res.status(200).json({ ok: true, service: 'utekos-css-insight-public', time: nowIso() })
  })

  app.get('/readyz', (_req, res) => {
    const cssFiles = listCssFiles()
    const ready = cssFiles.length > 0 && fs.existsSync(path.join(repoRoot, 'src/globals.css'))
    res.status(ready ? 200 : 503).json({
      ok: ready,
      css_file_count: cssFiles.length,
      globals_css_present: fs.existsSync(path.join(repoRoot, 'src/globals.css'))
    })
  })

  app.post(mcpPath, async (req, res) => {
    const server = createServer()
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })

    try {
      await server.connect(transport)
      await transport.handleRequest(req, res, req.body)
      res.on('close', () => {
        transport.close()
        server.close()
      })
    } catch (error) {
      console.error(error instanceof Error ? error.stack : String(error))
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null
        })
      }
    }
  })

  app.get(mcpPath, (_req, res) => {
    res.status(405).set('Allow', 'POST').json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed. Use POST for this stateless MCP endpoint.' },
      id: null
    })
  })

  app.delete(mcpPath, (_req, res) => {
    res.status(405).set('Allow', 'POST').json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed. Stateless sessions do not require DELETE.' },
      id: null
    })
  })

  return app
}

export function startServer() {
  const app = createApp()
  const listener = app.listen(port, host, error => {
    if (error) {
      console.error(error instanceof Error ? error.stack : String(error))
      process.exit(1)
    }
    console.log(`Utekos CSS Insight MCP listening on http://${host}:${port}${mcpPath}`)
  })
  return listener
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer()
}
