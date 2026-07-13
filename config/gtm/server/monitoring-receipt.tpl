+___INFO___

{
  "type": "TAG",
  "id": "cvt_temp_public_id",
  "version": 1,
  "securityGroups": [],
  "displayName": "Utekos sGTM monitoring receipt",
  "brand": {
    "id": "brand_dummy",
    "displayName": "Utekos"
  },
  "description": "Sends minimal signed ingress and tag execution receipts after an sGTM event finishes.",
  "containerContexts": [
    "SERVER"
  ]
}


___TEMPLATE_PARAMETERS___

[
  {
    "type": "TEXT",
    "name": "receiptUrl",
    "displayName": "Receipt endpoint",
    "simpleValueType": true,
    "defaultValue": "https://utekos.no/api/tracking/receipts",
    "valueValidators": [
      {
        "type": "REGEX",
        "args": [
          "^https://utekos\\.no/api/tracking/receipts$"
        ]
      }
    ]
  },
  {
    "type": "TEXT",
    "name": "hmacKeyId",
    "displayName": "SGTM_CREDENTIALS key ID",
    "simpleValueType": true,
    "defaultValue": "receipt-key",
    "valueValidators": [
      {
        "type": "REGEX",
        "args": [
          "^receipt-key$"
        ]
      }
    ]
  },
  {
    "type": "TEXT",
    "name": "monitoringTagId",
    "displayName": "This monitoring tag ID",
    "simpleValueType": true,
    "help": "Used only to omit this tag from tag_execution receipts.",
    "valueValidators": [
      {
        "type": "NON_EMPTY"
      }
    ]
  }
]


___SANDBOXED_JS_FOR_SERVER___

const addEventCallback = require('addEventCallback');
const generateRandom = require('generateRandom');
const getClientName = require('getClientName');
const getContainerVersion = require('getContainerVersion');
const getEventData = require('getEventData');
const getTimestampMillis = require('getTimestampMillis');
const hmacSha256 = require('hmacSha256');
const JSON = require('JSON');
const sendHttpRequest = require('sendHttpRequest');

const eventId = getEventData('event_id');
const eventName = getEventData('event_name');
const clientName = getClientName();
const containerVersion = getContainerVersion();

if (!eventId || !eventName) {
  data.gtmOnSuccess();
  return;
}

const sendReceipt = (receipt) => {
  const body = JSON.stringify(receipt);
  const signature = hmacSha256(body, data.hmacKeyId, {outputEncoding: 'hex'});

  sendHttpRequest(data.receiptUrl, {
    method: 'POST',
    timeout: 1000,
    headers: {
      'content-type': 'application/json',
      'x-sgtm-signature': signature
    }
  }, body);
};

addEventCallback((containerId, eventMetadata) => {
  const observedAt = getTimestampMillis();
  const nonce = generateRandom(100000000, 999999999);

  sendReceipt({
    idempotencyKey: eventId + ':sgtm_ingress:' + observedAt + ':' + nonce,
    eventId: eventId,
    eventName: eventName,
    observationType: 'sgtm_ingress',
    containerId: containerId,
    containerVersion: containerVersion.version,
    clientName: clientName,
    observedAt: observedAt
  });

  const tags = eventMetadata.tags || [];
  for (let index = 0; index < tags.length; index++) {
    const tag = tags[index];
    if (tag.id === data.monitoringTagId) {
      continue;
    }

    sendReceipt({
      idempotencyKey: eventId + ':tag_execution:' + tag.id + ':' + observedAt,
      eventId: eventId,
      eventName: eventName,
      observationType: 'tag_execution',
      containerId: containerId,
      containerVersion: containerVersion.version,
      clientName: clientName,
      tagId: tag.id,
      tagStatus: tag.status,
      tagExecutionTimeMs: tag.executionTime,
      observedAt: observedAt
    });
  }
});

data.gtmOnSuccess();


___SERVER_PERMISSIONS___

[
  {
    "instance": {
      "key": {
        "publicId": "read_event_metadata",
        "versionId": "1"
      },
      "param": []
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "read_container_data",
        "versionId": "1"
      },
      "param": []
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "read_event_data",
        "versionId": "1"
      },
      "param": [
        {
          "key": "keyPatterns",
          "value": {
            "type": 2,
            "listItem": [
              {
                "type": 1,
                "string": "event_id"
              },
              {
                "type": 1,
                "string": "event_name"
              }
            ]
          }
        },
        {
          "key": "eventDataAccess",
          "value": {
            "type": 1,
            "string": "specific"
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "send_http",
        "versionId": "1"
      },
      "param": [
        {
          "key": "allowedUrls",
          "value": {
            "type": 1,
            "string": "specific"
          }
        },
        {
          "key": "urls",
          "value": {
            "type": 2,
            "listItem": [
              {
                "type": 1,
                "string": "https://utekos.no/api/tracking/receipts"
              }
            ]
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "use_custom_private_keys",
        "versionId": "1"
      },
      "param": [
        {
          "key": "keyIds",
          "value": {
            "type": 2,
            "listItem": [
              {
                "type": 1,
                "string": "receipt-key"
              }
            ]
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  }
]


___TESTS___

scenarios:
- name: Missing event identity exits without a request
  code: |-
    mock('getEventData', () => undefined);
    runCode({
      receiptUrl: 'https://utekos.no/api/tracking/receipts',
      hmacKeyId: 'receipt-key',
      monitoringTagId: '99'
    });
    assertApi('sendHttpRequest').wasNotCalled();
    assertApi('gtmOnSuccess').wasCalled();


___NOTES___

This template is intentionally PII-free. It reads only event_id and event_name
from event data and only the tag ID, status and execution time from event
metadata. The HTTP promise is deliberately not awaited, so receipt delivery
cannot block the provider tag path. The imported permission set must remain
restricted to the exact endpoint and receipt-key ID.
