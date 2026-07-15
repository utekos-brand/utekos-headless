import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getVercelRuntimeContext,
  requireProductionRuntimeForProviderWrite
} from './getVercelRuntimeContext'

test('maps Vercel system variables into a stable runtime context', () => {
  const context = getVercelRuntimeContext({
    NODE_ENV: 'production',
    VERCEL_ENV: 'preview',
    VERCEL_REGION: 'arn1',
    VERCEL_DEPLOYMENT_ID: 'dpl_test',
    VERCEL_GIT_COMMIT_SHA: 'abc123'
  })

  assert.deepEqual(context, {
    environment: 'preview',
    region: 'arn1',
    deploymentId: 'dpl_test',
    commitSha: 'abc123',
    isProductionDeployment: false
  })
})

test('provider writes fail closed outside Vercel production', () => {
  assert.throws(
    () => requireProductionRuntimeForProviderWrite('example', getVercelRuntimeContext({
      NODE_ENV: 'production',
      VERCEL_ENV: 'preview'
    })),
    /only allowed from a Vercel production deployment/
  )
})

test('provider writes are allowed in Vercel production', () => {
  assert.doesNotThrow(() => requireProductionRuntimeForProviderWrite(
    'example',
    getVercelRuntimeContext({ VERCEL_ENV: 'production' })
  ))
})
