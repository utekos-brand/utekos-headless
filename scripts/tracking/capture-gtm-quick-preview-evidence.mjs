#!/usr/bin/env node

import process from 'node:process'

import {
  captureTargetEvidence,
  getGtmAccessToken,
  readJson
} from './lib/gtm-publish-guard.mjs'

const baselinePath = process.env.GTM_GUARD_BASELINE || 'config/gtm/sgtm-remediation-baseline.json'
const baseline = readJson(baselinePath)
const accessToken = await getGtmAccessToken()
const generatedAt = new Date().toISOString()
const [web, server] = await Promise.all([
  captureTargetEvidence(accessToken, baseline.web, generatedAt),
  captureTargetEvidence(accessToken, baseline.server, generatedAt)
])

process.stdout.write(`${JSON.stringify({ schemaVersion: 1, generatedAt, web, server }, null, 2)}\n`)
