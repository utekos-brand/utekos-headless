#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { createHash, randomUUID } from 'node:crypto'

import {
  McpServer,
  StdioServerTransport
} from '@modelcontextprotocol/server'
import { z } from 'zod/v4'

const repoRoot = path.resolve(
  process.env.UTEKOS_REPO_ROOT ?? process.cwd()
)
const realRepoRoot = fs.realpathSync(repoRoot)
const profile = 'utekos_chatgpt_source_insight'
const mode = 'read-only-source'

const allowedRoots = ['src', 'supabase']
const allowedFiles = [
  'next.config.mts',
  'package.json',
  'vercel.json',
  'global.d.ts'
]
const deniedPathPatterns = [
  '.env*',
  'src/api/lib/cloud-credentials/',
  'supabase/md.md'
]

const toolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: false,
  idempotentHint: true
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
  read_only: z.literal(true),
  allowed_roots: z.array(z.string()),
  allowed_files: z.array(z.string()),
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

function auditToolCall(toolName) {
  console.error(
    JSON.stringify({
      time: nowIso(),
      level: 'INFO',
      msg: 'utekos_source_insight_tool_call',
      profile,
      mode,
      tool: toolName
    })
  )
}

function permissions() {
  return {
    read_only: true,
    allowed_roots: allowedRoots,
    allowed_files: allowedFiles,
    denied_patterns: deniedPathPatterns
  }
}

function makeError(
  code,
  message,
  suggestedFix,
  category = 'access_control'
) {
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

function createEnvelope(
  toolName,
  startedAt,
  data,
  options = {}
) {
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
    content: [
      { type: 'text', text: JSON.stringify(envelope, null, 2) }
    ],
    structuredContent: envelope
  }
}

function relativePath(filePath) {
  return path
    .relative(repoRoot, filePath)
    .replaceAll(path.sep, '/')
}

function isDeniedPath(relative) {
  const segments = relative.split('/')
  if (segments.some(segment => segment.startsWith('.env')))
    return true
  if (
    relative === 'src/api/lib/cloud-credentials' ||
    relative.startsWith('src/api/lib/cloud-credentials/')
  ) {
    return true
  }
  return relative === 'supabase/md.md'
}

function isAllowedPath(relative) {
  if (isDeniedPath(relative)) return false
  if (allowedFiles.includes(relative)) return true
  return allowedRoots.some(
    root => relative === root || relative.startsWith(`${root}/`)
  )
}

function assertRealPathAllowed(absolute, originalPath) {
  if (!fs.existsSync(absolute)) return
  const realAbsolute = fs.realpathSync(absolute)
  const realRelative = path
    .relative(realRepoRoot, realAbsolute)
    .replaceAll(path.sep, '/')
  if (
    realRelative.startsWith('..') ||
    path.isAbsolute(realRelative) ||
    !isAllowedPath(realRelative)
  ) {
    throw new Error(
      `Path resolves outside Utekos source policy: ${originalPath}`
    )
  }
}

function resolveAllowedPath(inputPath) {
  const cleaned = String(inputPath ?? '').trim()
  if (!cleaned) throw new Error('Path is empty')
  if (cleaned.includes('\0'))
    throw new Error('Path contains invalid null byte')

  const absolute = path.resolve(repoRoot, cleaned)
  const relative = relativePath(absolute)
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Path escapes repo root: ${cleaned}`)
  }
  if (!isAllowedPath(relative)) {
    throw new Error(
      `Path is outside Utekos source policy: ${relative}`
    )
  }

  assertRealPathAllowed(absolute, cleaned)
  return { absolute, relative }
}

function hashBuffer(value) {
  return createHash('sha256').update(value).digest('hex')
}

function isBinaryBuffer(buffer) {
  const sample = buffer.subarray(
    0,
    Math.min(buffer.byteLength, 8000)
  )
  return sample.includes(0)
}

function readTextFile(relative, maxBytes) {
  const resolved = resolveAllowedPath(relative)
  const stat = fs.statSync(resolved.absolute)
  if (!stat.isFile())
    throw new Error(`Not a file: ${resolved.relative}`)

  const buffer = fs.readFileSync(resolved.absolute)
  if (isBinaryBuffer(buffer)) {
    throw new Error(
      `Binary files are not exposed: ${resolved.relative}`
    )
  }

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

function walkAllowedRoot(relativeRoot) {
  const resolved = resolveAllowedPath(relativeRoot)
  if (!fs.existsSync(resolved.absolute)) return []
  const files = []

  function walk(current) {
    for (const entry of fs.readdirSync(current, {
      withFileTypes: true
    })) {
      const absolute = path.join(current, entry.name)
      const relative = relativePath(absolute)
      if (!isAllowedPath(relative)) continue
      if (entry.isSymbolicLink()) continue
      if (entry.isDirectory()) walk(absolute)
      else if (entry.isFile()) files.push(relative)
    }
  }

  walk(resolved.absolute)
  return files
}

function listAllowedFiles() {
  const files = allowedFiles.filter(file =>
    fs.existsSync(path.join(repoRoot, file))
  )
  for (const root of allowedRoots)
    files.push(...walkAllowedRoot(root))
  return [...new Set(files)].sort()
}

function filesForScopes(scopes) {
  const allFiles = listAllowedFiles()
  if (!scopes?.length) return allFiles

  const resolvedScopes = scopes.map(resolveAllowedPath)
  return allFiles.filter(file =>
    resolvedScopes.some(scope => {
      if (!fs.existsSync(scope.absolute)) return false
      const stat = fs.statSync(scope.absolute)
      return stat.isFile() ?
          file === scope.relative
        : file.startsWith(`${scope.relative}/`)
    })
  )
}

const bootstrapDataSchema = z.object({
  repo_root: z.string(),
  canonical_tools: z.array(z.string()),
  access_contract: z.array(z.string())
})

const fileSummarySchema = z.object({
  path: z.string(),
  size_bytes: z.number().int().nonnegative()
})

const inventoryDataSchema = z.object({
  files: z.array(fileSummarySchema),
  total_files: z.number().int().nonnegative(),
  returned_files: z.number().int().nonnegative(),
  truncated: z.boolean()
})

const searchMatchSchema = z.object({
  path: z.string(),
  line: z.number().int().positive(),
  text: z.string()
})

const searchDataSchema = z.object({
  query: z.string(),
  matches: z.array(searchMatchSchema),
  searched_files: z.number().int().nonnegative(),
  skipped_binary_files: z.number().int().nonnegative()
})

const contextFileSchema = z.object({
  path: z.string(),
  content: z.string(),
  sha256: z.string(),
  size_bytes: z.number().int().nonnegative(),
  line_count: z.number().int().nonnegative(),
  truncated: z.boolean()
})

const readDataSchema = z.object({
  files: z.array(contextFileSchema),
  denied_files: z.array(z.string()),
  missing_files: z.array(z.string())
})

const canonicalTools = [
  'source_access_bootstrap',
  'source_file_inventory',
  'search_source_files',
  'read_source_files'
]

const server = new McpServer({
  name: 'utekos-source-insight',
  version: '1.0.0'
})

server.registerTool(
  'source_access_bootstrap',
  {
    title: 'Source Access Bootstrap',
    description:
      'Use first. Returns the exact read-only Utekos source-code scope and canonical tools available to ChatGPT.',
    inputSchema: z.object({}),
    outputSchema: envelopeSchema(
      'source_access_bootstrap',
      bootstrapDataSchema
    ),
    annotations: toolAnnotations
  },
  async () => {
    const startedAt = nowIso()
    auditToolCall('source_access_bootstrap')
    return textResult(
      createEnvelope(
        'source_access_bootstrap',
        startedAt,
        {
          repo_root: repoRoot,
          canonical_tools: canonicalTools,
          access_contract: [
            'Read-only access only; no write, Git mutation, shell, network, database, or provider tools are exposed.',
            'Allowed directories: src/ and supabase/.',
            'Allowed root files: next.config.mts, package.json, vercel.json, and global.d.ts.',
            'Environment files, local MCP configs, cloud credential paths, and supabase/md.md are denied.',
            'Use search_source_files before read_source_files when the exact implementation file is unknown.'
          ]
        },
        {
          next: [
            'Call source_file_inventory to discover files.',
            'Call search_source_files for implementation symbols or literal text.'
          ]
        }
      )
    )
  }
)

server.registerTool(
  'source_file_inventory',
  {
    title: 'Source File Inventory',
    description:
      'Lists files inside the allowed Utekos source scope. Optionally narrow the result to an allowed directory or file.',
    inputSchema: z.object({
      paths: z.array(z.string()).min(1).max(20).optional(),
      limit: z.number().int().min(1).max(5000).optional()
    }),
    outputSchema: envelopeSchema(
      'source_file_inventory',
      inventoryDataSchema
    ),
    annotations: toolAnnotations
  },
  async ({ paths, limit }) => {
    const startedAt = nowIso()
    auditToolCall('source_file_inventory')
    const maxFiles = limit ?? 1000

    try {
      const scopedFiles = filesForScopes(paths)
      const returned = scopedFiles
        .slice(0, maxFiles)
        .map(file => ({
          path: file,
          size_bytes: fs.statSync(path.join(repoRoot, file)).size
        }))
      return textResult(
        createEnvelope(
          'source_file_inventory',
          startedAt,
          {
            files: returned,
            total_files: scopedFiles.length,
            returned_files: returned.length,
            truncated: returned.length < scopedFiles.length
          },
          {
            warnings:
              returned.length < scopedFiles.length ?
                [`Inventory truncated at ${maxFiles} files.`]
              : [],
            limits: { limit: maxFiles },
            next: [
              'Call search_source_files or read_source_files for exact content.'
            ]
          }
        )
      )
    } catch (error) {
      return textResult(
        createEnvelope(
          'source_file_inventory',
          startedAt,
          {
            files: [],
            total_files: 0,
            returned_files: 0,
            truncated: false
          },
          {
            ok: false,
            warnings: [
              error instanceof Error ?
                error.message
              : String(error)
            ],
            errors: [
              makeError(
                'UTEKOS_SOURCE_DENIED_PATH',
                'The requested inventory path is outside the allowed source scope.',
                'Request only src/, supabase/, or one of the four allowed root files.'
              )
            ]
          }
        )
      )
    }
  }
)

server.registerTool(
  'search_source_files',
  {
    title: 'Search Source Files',
    description:
      'Literal text search across the allowed Utekos source scope. Optionally narrow the search to allowed files or directories.',
    inputSchema: z.object({
      query: z.string().min(2).max(300),
      paths: z.array(z.string()).min(1).max(20).optional(),
      case_sensitive: z.boolean().optional(),
      limit: z.number().int().min(1).max(500).optional()
    }),
    outputSchema: envelopeSchema(
      'search_source_files',
      searchDataSchema
    ),
    annotations: toolAnnotations
  },
  async ({
    query,
    paths,
    case_sensitive: caseSensitive,
    limit
  }) => {
    const startedAt = nowIso()
    auditToolCall('search_source_files')
    const maxMatches = limit ?? 80
    const matches = []
    let skippedBinaryFiles = 0

    try {
      const files = filesForScopes(paths)
      const expected =
        caseSensitive === true ? query : (
          query.toLocaleLowerCase()
        )

      for (const filePath of files) {
        if (matches.length >= maxMatches) break
        const buffer = fs.readFileSync(
          path.join(repoRoot, filePath)
        )
        if (isBinaryBuffer(buffer)) {
          skippedBinaryFiles += 1
          continue
        }

        const lines = buffer.toString('utf8').split('\n')
        for (let index = 0; index < lines.length; index += 1) {
          if (matches.length >= maxMatches) break
          const candidate =
            caseSensitive === true ?
              lines[index]
            : lines[index].toLocaleLowerCase()
          if (!candidate.includes(expected)) continue
          matches.push({
            path: filePath,
            line: index + 1,
            text: lines[index].slice(0, 600)
          })
        }
      }

      return textResult(
        createEnvelope(
          'search_source_files',
          startedAt,
          {
            query,
            matches,
            searched_files: files.length,
            skipped_binary_files: skippedBinaryFiles
          },
          {
            warnings:
              matches.length === 0 ? ['No matches found.'] : [],
            limits: { limit: maxMatches },
            next:
              matches.length > 0 ?
                [
                  'Call read_source_files for the exact matched files.'
                ]
              : [
                  'Try another literal term or a narrower allowed path.'
                ]
          }
        )
      )
    } catch (error) {
      return textResult(
        createEnvelope(
          'search_source_files',
          startedAt,
          {
            query,
            matches: [],
            searched_files: 0,
            skipped_binary_files: skippedBinaryFiles
          },
          {
            ok: false,
            warnings: [
              error instanceof Error ?
                error.message
              : String(error)
            ],
            errors: [
              makeError(
                'UTEKOS_SOURCE_DENIED_PATH',
                'One or more search paths were denied by policy.',
                'Search only src/, supabase/, or one of the four allowed root files.'
              )
            ]
          }
        )
      )
    }
  }
)

server.registerTool(
  'read_source_files',
  {
    title: 'Read Source Files',
    description:
      'Reads explicit text files inside the allowed Utekos source scope. Secret, binary, out-of-scope, and traversal paths are denied.',
    inputSchema: z.object({
      paths: z.array(z.string()).min(1).max(40),
      max_bytes_per_file: z
        .number()
        .int()
        .min(1000)
        .max(240000)
        .optional()
    }),
    outputSchema: envelopeSchema(
      'read_source_files',
      readDataSchema
    ),
    annotations: toolAnnotations
  },
  async ({ paths, max_bytes_per_file: maxBytesPerFile }) => {
    const startedAt = nowIso()
    auditToolCall('read_source_files')
    const maxBytes = maxBytesPerFile ?? 80000
    const files = []
    const deniedFiles = []
    const missingFiles = []
    const warnings = []

    for (const requestedPath of paths) {
      try {
        const resolved = resolveAllowedPath(requestedPath)
        if (!fs.existsSync(resolved.absolute)) {
          missingFiles.push(resolved.relative)
          continue
        }
        const file = readTextFile(resolved.relative, maxBytes)
        files.push(file)
        if (file.truncated) {
          warnings.push(
            `${file.path} truncated at ${maxBytes} bytes`
          )
        }
      } catch (error) {
        deniedFiles.push(requestedPath)
        warnings.push(
          `${requestedPath}: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    }

    return textResult(
      createEnvelope(
        'read_source_files',
        startedAt,
        {
          files,
          denied_files: deniedFiles,
          missing_files: missingFiles
        },
        {
          ok: deniedFiles.length === 0,
          sources: files.map(fileSource),
          warnings,
          errors:
            deniedFiles.length === 0 ?
              []
            : [
                makeError(
                  'UTEKOS_SOURCE_DENIED_PATH',
                  'One or more requested files were denied by policy.',
                  'Request only non-secret text files inside the configured source scope.'
                )
              ],
          limits: { max_bytes_per_file: maxBytes },
          next: [
            'Use current official documentation before implementation-sensitive conclusions.'
          ]
        }
      )
    )
  }
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error(
    'Utekos Source Insight MCP server running on stdio'
  )
}

main().catch(error => {
  console.error(
    error instanceof Error ? error.stack : String(error)
  )
  process.exit(1)
})
