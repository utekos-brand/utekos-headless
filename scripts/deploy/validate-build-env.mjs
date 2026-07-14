#!/usr/bin/env node

import { pathToFileURL } from 'node:url'

import { z } from 'zod'

const vercelBuildEnvSchema = z.object({
  NEXT_PUBLIC_KLARNA_CLIENT_ID: z
    .string()
    .trim()
    .min(
      1,
      'NEXT_PUBLIC_KLARNA_CLIENT_ID must contain the Klarna Client Identifier.'
    )
})

export function validateBuildEnv(env = process.env) {
  if (env.VERCEL !== '1') {
    return { checked: false }
  }

  vercelBuildEnvSchema.parse(env)
  return { checked: true }
}

const isDirectExecution =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href

if (isDirectExecution) {
  try {
    const result = validateBuildEnv()
    console.log(
      result.checked ?
        'Vercel build environment is valid.'
      : 'Local build environment check skipped.'
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        error.issues.map(issue => issue.message).join('\n')
      )
    } else {
      console.error(error)
    }

    process.exit(1)
  }
}
