#!/usr/bin/env node

import fs from 'node:fs'
import process from 'node:process'
import { OAuth2Client } from 'google-auth-library'

const GTM_SCOPES = [
  'https://www.googleapis.com/auth/tagmanager.edit.containers',
  'https://www.googleapis.com/auth/tagmanager.edit.containerversions',
  'https://www.googleapis.com/auth/tagmanager.publish'
]

function resolvePath(envValue, fallback) {
  return envValue?.trim() || fallback
}

function extractAuthCode(input) {
  const value = input.trim()

  if (!value) {
    throw new Error('Missing auth code. Pass the code or full localhost redirect URL.')
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    const url = new URL(value)
    const code = url.searchParams.get('code')

    if (!code) {
      throw new Error('Redirect URL did not contain a code query parameter.')
    }

    return code
  }

  return value
}

function createOAuthClient(credentialsPath) {
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'))
  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web

  return new OAuth2Client(client_id, client_secret, redirect_uris?.[0] || 'http://localhost')
}

async function main() {
  const credentialsPath = resolvePath(
    process.env.GTM_CREDENTIALS_FILE,
    `${process.env.HOME}/.config/gtm-mcp/credentials.json`
  )
  const tokenPath = resolvePath(
    process.env.GTM_TOKEN_FILE,
    `${process.env.HOME}/.config/gtm-mcp/token.json`
  )

  if (process.argv[2] === '--print-auth-url') {
    const client = createOAuthClient(credentialsPath)
    const authUrl = client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: GTM_SCOPES
    })

    console.log(authUrl)
    return
  }

  const rawInput = process.argv[2] || process.env.GTM_AUTH_CODE

  if (!rawInput) {
    console.error('Usage:')
    console.error('  node scripts/tracking/exchange-gtm-auth-code.mjs --print-auth-url')
    console.error('  node scripts/tracking/exchange-gtm-auth-code.mjs "<code-or-localhost-url>"')
    process.exit(1)
  }

  const client = createOAuthClient(credentialsPath)
  const code = extractAuthCode(rawInput)
  const { tokens } = await client.getToken(code)

  fs.writeFileSync(tokenPath, `${JSON.stringify(tokens, null, 2)}\n`)

  console.log(JSON.stringify({
    ok: true,
    tokenPath,
    scopes: tokens.scope?.split(' ') ?? []
  }, null, 2))
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
