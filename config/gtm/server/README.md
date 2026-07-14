# Server GTM monitoring receipt

`monitoring-receipt.tpl` is the complete, reviewable server custom tag template
export. It includes the fields, sandboxed JavaScript, narrowed permissions and a
fail-closed test. It intentionally reads only `event_id`, `event_name`, client
name, container version and Monitoring API tag execution metadata.

Required template fields:

- `receiptUrl`: URL, fixed to the production `/api/tracking/receipts` endpoint.
- `hmacKeyId`: text, the key ID in the JSON file referenced by `SGTM_CREDENTIALS`.
- `monitoringTagId`: text, used to exclude the monitoring tag from its own tag-execution receipts.

Required permissions:

- `read_event_data`: only `event_id` and `event_name`.
- `read_container_data`: client name and container version.
- `read_event_metadata`: tag ID, status and execution time.
- `send_http`: only the HTTPS receipt endpoint.
- `use_custom_private_keys`: only the configured HMAC key ID.

The `SGTM_CREDENTIALS` file must use Google's documented shape:

```json
{
  "keys": {
    "receipt-key": "BASE64_ENCODED_HMAC_KEY"
  }
}
```

The Vercel Production secret `SGTM_RECEIPT_HMAC_KEY_BASE64` must contain the
same base64 value as `keys.receipt-key`. The receipt route decodes that value
before verification, matching the key bytes used by sGTM's `hmacSha256` API.
The ingress idempotency key is exactly `eventId:sgtm_ingress`; tag execution is
exactly `eventId:tag_execution:tagId`. Timestamps remain observation data and
must never change those keys.

Import, tag creation, Quick Preview and publish remain GTM provider mutations
and require the explicit release approval in `DEPLOYMENT.md`. Import the `.tpl`
unchanged, set `monitoringTagId` to the created tag ID, and verify that the UI
shows only the five permissions committed in the export before Quick Preview.
