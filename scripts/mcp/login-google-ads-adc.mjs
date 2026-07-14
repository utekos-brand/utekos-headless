#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { spawnSync } from 'node:child_process'

import dotenv from 'dotenv'

const root = process.cwd()
const envPath = path.join(root, '.env.mcp.local')
const adcDir = path.join(root, '.agent-artifacts/google-ads-adc')
const clientPath = path.join(adcDir, 'oauth-client.json')
const credentialsPath = path.join(
  adcDir,
  'application_default_credentials.json'
)

if (!fs.existsSync(envPath)) {
  console.error('Missing .env.mcp.local')
  process.exit(1)
}

const localEnv = dotenv.parse(fs.readFileSync(envPath, 'utf8'))
const clientId = localEnv.GOOGLE_ADS_CLIENT_ID?.trim()
const clientSecret = localEnv.GOOGLE_ADS_CLIENT_SECRET?.trim()

if (!clientId || !clientSecret) {
  console.error(
    'GOOGLE_ADS_CLIENT_ID and GOOGLE_ADS_CLIENT_SECRET are required in .env.mcp.local.'
  )
  process.exit(1)
}

fs.mkdirSync(adcDir, { recursive: true, mode: 0o700 })
fs.writeFileSync(
  clientPath,
  `${JSON.stringify(
    {
      installed: {
        client_id: clientId,
        client_secret: clientSecret,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url:
          'https://www.googleapis.com/oauth2/v1/certs',
        redirect_uris: ['http://localhost']
      }
    },
    null,
    2
  )}\n`,
  { encoding: 'utf8', mode: 0o600 }
)

console.log(
  'Starting isolated Google Ads ADC login with adwords and cloud-platform scopes.'
)
const result = spawnSync(
  'gcloud',
  [
    'auth',
    'application-default',
    'login',
    `--client-id-file=${clientPath}`,
    '--scopes=https://www.googleapis.com/auth/adwords,https://www.googleapis.com/auth/cloud-platform'
  ],
  {
    cwd: root,
    env: { ...process.env, CLOUDSDK_CONFIG: adcDir },
    stdio: 'inherit'
  }
)

if (result.status !== 0) process.exit(result.status ?? 1)
if (!fs.existsSync(credentialsPath)) {
  console.error('Google login completed without creating the expected ADC file.')
  process.exit(1)
}

const credentials = JSON.parse(
  fs.readFileSync(credentialsPath, 'utf8')
)
const hasRefreshToken =
  credentials.type === 'authorized_user' &&
  typeof credentials.refresh_token === 'string' &&
  credentials.refresh_token.length > 0

if (!hasRefreshToken) {
  console.error('ADC file is missing an authorized-user refresh token.')
  process.exit(1)
}

fs.chmodSync(credentialsPath, 0o600)
console.log(`Google Ads ADC ready: ${credentialsPath}`)
console.log('Refresh token is stored inside the ignored ADC file and was not printed.')
