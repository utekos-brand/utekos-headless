import { join } from 'node:path'

export const ROOT = join(process.cwd(), 'src/components/klarna')
export const DOCS_INDEX = '/src/components/klarna/agents.txt'
export const LLMS_INDEX = '/src/components/klarna/llms.md'
export const PARENT_INDEX = '/docs/agents.txt'
export const BLOCKQUOTE =
  '> Klarna agent index: [agents.txt](/src/components/klarna/agents.txt).'
export const DEFAULT_AI_DIRECTIVE =
  'Read docs_index before implementing. Do not infer Klarna API or SDK signatures without OpenAPI mirror or Context7.'
export const DEFAULT_DOMAIN = 'Klarna'
export const DEFAULT_VERSION_TARGET = 'klarna-payments-api-v1'
export const LAST_UPDATED = '2026-06-27'

/** @type {Set<string>} */
export const SKIP_NORMALIZE = new Set(['llms.md', 'agents.txt'])
