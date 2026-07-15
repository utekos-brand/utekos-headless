#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const configPath = path.join(
  root,
  'config/mcp/chatgpt-profiles.json'
)
const managedPrefix = 'utekos_chatgpt_'

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
    timeout: options.timeout ?? 120000
  })
}

function firstLine(value) {
  return (
    (value ?? '')
      .split('\n')
      .find(line => line.trim() !== '')
      ?.trim() ?? ''
  )
}

function must(command, args, options = {}) {
  const result = run(command, args, options)
  if (result.status === 0) return result

  console.error(`Failed: ${command} ${args.join(' ')}`)
  console.error(
    firstLine(result.stderr) ||
      firstLine(result.stdout) ||
      'unknown error'
  )
  process.exit(result.status ?? 1)
}

function loadConfig() {
  return JSON.parse(fs.readFileSync(configPath, 'utf8'))
}

function expandValue(value, config) {
  if (typeof value === 'string')
    return value.replaceAll('${repoRoot}', config.repoRoot)
  if (Array.isArray(value))
    return value.map(item => expandValue(item, config))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        expandValue(entry, config)
      ])
    )
  }
  return value
}

function catalogRef(config, servers) {
  return `catalog://${config.catalog.replace(/:latest$/, '')}/${servers.join('+')}`
}

function profileExists(id) {
  return (
    run('docker', [
      'mcp',
      'profile',
      'show',
      id,
      '--format',
      'json'
    ]).status === 0
  )
}

function readProfile(id) {
  const result = run('docker', [
    'mcp',
    'profile',
    'show',
    id,
    '--format',
    'json'
  ])
  if (result.status !== 0) return null
  return JSON.parse(result.stdout)
}

function profileServerNames(profile) {
  return new Set(
    (profile?.servers ?? [])
      .map(server => server?.snapshot?.server?.name)
      .filter(Boolean)
  )
}

function ensureDynamicTools(config) {
  const desired = config.globalDockerFeatures?.['dynamic-tools']
  if (desired !== false) return

  const features = run('docker', ['mcp', 'feature', 'ls'])
  if (features.status !== 0) {
    console.warn(
      `WARN docker:mcp:features: ${firstLine(features.stderr) || 'feature list unavailable'}`
    )
    return
  }

  if (
    !features.stdout.includes('dynamic-tools        enabled')
  ) {
    console.log('OK docker:mcp:dynamic-tools: disabled')
    return
  }

  must('docker', ['mcp', 'feature', 'disable', 'dynamic-tools'])
  console.log('OK docker:mcp:dynamic-tools: disabled')
}

function getCatalogTools(config, serverName) {
  const result = run('docker', [
    'mcp',
    'catalog',
    'server',
    'inspect',
    config.catalog,
    serverName,
    '--format',
    'json'
  ])
  if (result.status !== 0) return []

  const json = JSON.parse(result.stdout)
  return (json.snapshot?.server?.tools ?? [])
    .map(tool => tool.name)
    .filter(Boolean)
}

function configureProfileTools(config, profile) {
  const allowlist = new Set(profile.toolAllowlist ?? [])
  const explicitForbidden = new Set(profile.forbiddenTools ?? [])
  const disableArgs = []

  for (const serverName of profile.servers) {
    must('docker', [
      'mcp',
      'profile',
      'tools',
      profile.id,
      '--enable-all',
      serverName
    ])

    const tools = getCatalogTools(config, serverName)
    const toolSet = new Set(tools)

    if (allowlist.size > 0) {
      for (const toolName of tools) {
        if (!allowlist.has(toolName))
          disableArgs.push(`${serverName}.${toolName}`)
      }
    }

    for (const toolName of explicitForbidden) {
      if (toolName.includes('.')) {
        disableArgs.push(toolName)
      } else if (toolSet.has(toolName)) {
        disableArgs.push(`${serverName}.${toolName}`)
      }
    }
  }

  const unique = [...new Set(disableArgs)]
  for (let index = 0; index < unique.length; index += 40) {
    const chunk = unique.slice(index, index + 40)
    must('docker', [
      'mcp',
      'profile',
      'tools',
      profile.id,
      ...chunk.flatMap(tool => ['--disable', tool])
    ])
  }
}

function configureProfile(config, profile) {
  if (!profile.id.startsWith(managedPrefix)) {
    console.error(
      `Refusing to manage non-Utekos ChatGPT profile: ${profile.id}`
    )
    process.exit(1)
  }

  if (!profileExists(profile.id)) {
    must('docker', [
      'mcp',
      'profile',
      'create',
      '--name',
      profile.name,
      '--id',
      profile.id,
      '--server',
      catalogRef(config, profile.servers)
    ])
  }

  const current = readProfile(profile.id)
  const existingServers = profileServerNames(current)
  const desiredServers = new Set(profile.servers)
  const extraServers = [...existingServers].filter(
    name => !desiredServers.has(name)
  )
  if (extraServers.length > 0) {
    must('docker', [
      'mcp',
      'profile',
      'server',
      'remove',
      profile.id,
      ...extraServers
    ])
  }

  const refreshed = readProfile(profile.id)
  const refreshedServers = profileServerNames(refreshed)
  const missingServers = profile.servers.filter(
    name => !refreshedServers.has(name)
  )
  if (missingServers.length > 0) {
    must('docker', [
      'mcp',
      'profile',
      'server',
      'add',
      profile.id,
      '--server',
      catalogRef(config, missingServers)
    ])
  }

  for (const [key, rawValue] of Object.entries(
    profile.config ?? {}
  )) {
    const value = expandValue(rawValue, config)
    const serialized =
      typeof value === 'string' ? value : JSON.stringify(value)
    must('docker', [
      'mcp',
      'profile',
      'config',
      profile.id,
      '--set',
      `${key}=${serialized}`
    ])
  }

  configureProfileTools(config, profile)
  must('docker', [
    'mcp',
    'gateway',
    'run',
    '--profile',
    profile.id,
    '--dry-run'
  ])
  console.log(`OK profile:${profile.id}: applied`)
}

function main() {
  const config = loadConfig()

  must('docker', ['mcp', 'version'])
  ensureDynamicTools(config)

  for (const profile of config.profiles) {
    if (profile.mcpCommand) {
      console.log(
        `OK profile:${profile.id}: canonical stdio surface; Docker profile not applied`
      )
      continue
    }
    configureProfile(config, profile)
  }

  console.log(
    `mcp:chatgpt:apply OK (${config.profiles.length} profiles)`
  )
}

main()
