import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const template = fs.readFileSync(new URL('./monitoring-receipt.tpl', import.meta.url), 'utf8')

test('exports a complete server template with minimal monitoring permissions', () => {
  for (const section of [
    '___INFO___',
    '___TEMPLATE_PARAMETERS___',
    '___SANDBOXED_JS_FOR_SERVER___',
    '___SERVER_PERMISSIONS___',
    '___TESTS___',
    '___NOTES___'
  ]) assert.match(template, new RegExp(section))

  for (const api of ['addEventCallback', 'getClientName', 'getContainerVersion', 'hmacSha256', 'sendHttpRequest']) {
    assert.match(template, new RegExp(`require\\('${api}'\\)`))
  }

  assert.match(template, /"publicId": "read_event_metadata"/)
  assert.match(template, /"publicId": "read_container_data"/)
  assert.match(template, /"publicId": "read_event_data"/)
  assert.match(template, /"publicId": "send_http"/)
  assert.match(template, /"publicId": "use_custom_private_keys"/)
  assert.doesNotMatch(template, /page_location|client_id|user_data|email|phone|address/)
  assert.match(template, /idempotencyKey: eventId \+ ':sgtm_ingress'/)
  assert.match(template, /idempotencyKey: eventId \+ ':tag_execution:' \+ tag\.id/)
  assert.doesNotMatch(template, /generateRandom|observedAt \+ ':' \+ nonce|tag\.id \+ ':' \+ observedAt/)
})
