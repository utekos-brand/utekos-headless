import assert from 'node:assert/strict'
import test from 'node:test'
import { protos } from '@google-ads/datamanager'
import type { CanonicalViewItem } from '../viewItemEvent'
import { mapCanonicalViewItemToGoogleDataManager } from './mapCanonicalViewItemToGoogleDataManager'

const emailHash = 'a'.repeat(64)
const phoneHash = 'b'.repeat(64)
const { Event: DataManagerEvent } =
  protos.google.ads.datamanager.v1

function normalize(
  event: protos.google.ads.datamanager.v1.Event
) {
  assert.equal(DataManagerEvent.verify(event), null)

  return DataManagerEvent.toObject(event, {
    defaults: false,
    enums: String,
    longs: Number
  })
}

function viewItem(
  overrides: Partial<CanonicalViewItem> = {}
): CanonicalViewItem {
  return {
    schema_version: 1,
    event_name: 'view_item',
    event_id: '61c2ef59-6e6f-4f56-a63a-567ca398f9de',
    page_view_id: 'ed4fb82a-f2f2-41f9-978a-3f99cf64ec2f',
    event_time: '2026-07-16T10:00:00.123Z',
    source: 'web',
    environment: 'test',
    page_url: 'https://utekos.no/produkter/comfyrobe',
    referrer_url: 'https://utekos.no/produkter',
    page_title: 'Comfyrobe™ | Utekos',
    consent: {
      analytics: 'granted',
      marketing: 'granted',
      preferences: 'denied',
      source: 'cookiebot',
      version: '1'
    },
    browser_id: {
      ga_cookie: 'GA1.1.97245370.1784201643',
      ga_session_id: '1784201643'
    },
    click_id: {
      dclid: 'display-click-id',
      gbraid: 'gbraid-value',
      gclid: 'google-click-id',
      wbraid: 'wbraid-value'
    },
    external_id: 'anon_550e8400-e29b-41d4-a716-446655440000',
    impression_id: 'google-impression-id',
    client_ip_address: '203.0.113.10',
    event_device_info: {
      language: 'nb-NO',
      pixel_ratio: 2,
      platform: 'MacIntel',
      screen_height: 1243,
      screen_width: 1920,
      user_agent: 'Mozilla/5.0',
      viewport_height: 577,
      viewport_width: 1280
    },
    region_code: '03',
    location: {
      city: 'Oslo',
      country_code: 'NO',
      postal_code: '0150',
      region_code: '03',
      source: 'server_request'
    },
    user_data: {
      email_sha256: [emailHash],
      phone_sha256: [phoneHash]
    },
    custom_data: {
      currency: 'NOK',
      value: 799.2,
      gross_value: 999,
      tax_value: 199.8,
      items: [
        {
          item_id: 'gid://shopify/ProductVariant/43959919051000',
          product_id: 'gid://shopify/Product/8036341448952',
          variant_id: 'gid://shopify/ProductVariant/43959919051000',
          item_name: 'Comfyrobe™',
          item_brand: 'Utekos',
          item_variant: 'Fjellnatt / XS / Unisex',
          item_category: 'Skalljakke',
          item_category2: 'Utekos',
          item_category3: 'Bestseller',
          item_category4: 'New product',
          item_category5: 'Utekos Katalog',
          product_handle: 'comfyrobe',
          product_type: 'Skalljakke',
          sku: 'COMFYROBE-FJELLNATT-XS',
          gtin: '07090062980085',
          quantity: 1,
          unit_price: 799.2,
          gross_unit_price: 999,
          compare_at_unit_price: 1352,
          gross_compare_at_unit_price: 1690,
          discount: 552.8,
          gross_discount: 691,
          tax_amount: 199.8,
          tax_rate: 0.25,
          taxable: true,
          price_includes_tax: true,
          available_for_sale: true,
          currently_not_in_stock: false,
          quantity_available: 20,
          selected_options: [
            { name: 'Farge', value: 'Fjellnatt' },
            { name: 'Størrelse', value: 'XS' },
            { name: 'Kjønn', value: 'Unisex' }
          ],
          collection_ids: ['gid://shopify/Collection/1'],
          collection_titles: ['Utekos']
        }
      ]
    },
    ...overrides
  }
}

test('maps a canonical view_item to a GA4 Data Manager event', () => {
  const mapped = normalize(
    mapCanonicalViewItemToGoogleDataManager(viewItem())
  )

  assert.deepEqual(mapped, {
    eventName: 'view_item',
    eventTimestamp: {
      seconds: 1784196000,
      nanos: 123000000
    },
    eventSource: 'WEB',
    clientId: '97245370.1784201643',
    userId: 'anon_550e8400-e29b-41d4-a716-446655440000',
    currency: 'NOK',
    conversionValue: 799.2,
    consent: {
      adUserData: 'CONSENT_GRANTED',
      adPersonalization: 'CONSENT_GRANTED'
    },
    adIdentifiers: {
      dclid: 'display-click-id',
      gbraid: 'gbraid-value',
      gclid: 'google-click-id',
      wbraid: 'wbraid-value',
      impressionId: 'google-impression-id'
    },
    userData: {
      userIdentifiers: [
        { emailAddress: emailHash },
        { phoneNumber: phoneHash }
      ]
    },
    eventDeviceInfo: {
      ipAddress: '203.0.113.10',
      userAgent: 'Mozilla/5.0',
      languageCode: 'nb-NO',
      screenHeight: 1243,
      screenWidth: 1920
    },
    eventLocation: {
      city: 'Oslo',
      regionCode: 'NO',
      subdivisionCode: 'NO-03'
    },
    additionalEventParameters: [
      {
        parameterName: 'event_id',
        value: '61c2ef59-6e6f-4f56-a63a-567ca398f9de'
      },
      {
        parameterName: 'page_view_id',
        value: 'ed4fb82a-f2f2-41f9-978a-3f99cf64ec2f'
      },
      {
        parameterName: 'page_location',
        value: 'https://utekos.no/produkter/comfyrobe'
      },
      {
        parameterName: 'page_title',
        value: 'Comfyrobe™ | Utekos'
      },
      {
        parameterName: 'page_referrer',
        value: 'https://utekos.no/produkter'
      },
      {
        parameterName: 'session_id',
        value: '1784201643'
      }
    ],
    cartData: {
      items: [
        {
          itemId: 'gid://shopify/ProductVariant/43959919051000',
          quantity: 1,
          unitPrice: 799.2,
          additionalItemParameters: [
            { parameterName: 'item_name', value: 'Comfyrobe™' },
            { parameterName: 'item_brand', value: 'Utekos' },
            {
              parameterName: 'item_variant',
              value: 'Fjellnatt / XS / Unisex'
            },
            { parameterName: 'item_category', value: 'Skalljakke' },
            { parameterName: 'item_category2', value: 'Utekos' },
            { parameterName: 'item_category3', value: 'Bestseller' },
            { parameterName: 'item_category4', value: 'New product' },
            {
              parameterName: 'item_category5',
              value: 'Utekos Katalog'
            },
            { parameterName: 'discount', value: '552.8' },
            {
              parameterName: 'product_id',
              value: 'gid://shopify/Product/8036341448952'
            },
            {
              parameterName: 'variant_id',
              value: 'gid://shopify/ProductVariant/43959919051000'
            },
            {
              parameterName: 'product_handle',
              value: 'comfyrobe'
            },
            {
              parameterName: 'sku',
              value: 'COMFYROBE-FJELLNATT-XS'
            },
            { parameterName: 'gtin', value: '07090062980085' },
            { parameterName: 'tax_amount', value: '199.8' },
            { parameterName: 'tax_rate', value: '0.25' },
            { parameterName: 'taxable', value: 'true' },
            {
              parameterName: 'price_includes_tax',
              value: 'true'
            },
            {
              parameterName: 'gross_unit_price',
              value: '999'
            },
            {
              parameterName: 'compare_at_unit_price',
              value: '1352'
            },
            {
              parameterName: 'gross_compare_at_unit_price',
              value: '1690'
            },
            { parameterName: 'gross_discount', value: '691' },
            {
              parameterName: 'available_for_sale',
              value: 'true'
            },
            {
              parameterName: 'currently_not_in_stock',
              value: 'false'
            }
          ]
        }
      ]
    }
  })
})

test('caps optional item parameters for every item in an event', () => {
  const event = viewItem()
  const firstItem = event.custom_data.items[0]

  assert.ok(firstItem)

  const mapped = normalize(
    mapCanonicalViewItemToGoogleDataManager({
      ...event,
      custom_data: {
        ...event.custom_data,
        items: [
          firstItem,
          {
            ...firstItem,
            item_id: 'gid://shopify/ProductVariant/2',
            variant_id: 'gid://shopify/ProductVariant/2'
          }
        ]
      }
    })
  )
  const items = mapped.cartData?.items ?? []

  assert.equal(items.length, 2)

  for (const item of items) {
    const parameters = item.additionalItemParameters ?? []
    const names = parameters.map(
      (parameter: { parameterName?: string }) =>
        parameter.parameterName
    )

    assert.equal(parameters.length, 24)
    assert.ok(names.includes('currently_not_in_stock'))
    assert.ok(!names.includes('product_type'))
    assert.ok(!names.includes('quantity_available'))
  }
})

test('normalizes the observed 529-character referrer without mutating the canonical event', () => {
  const referrerUrl = [
    'https://utekos.no/skreddersy-varmen?utm_campaign=Sales+Campaign',
    'utm_source=facebook',
    'utm_medium=paid',
    'utm_id=120246491016390788',
    'hsa_acc=772268237116474',
    'hsa_cam=120246491016390788',
    'hsa_grp=120246491016400788',
    'hsa_ad=120246491016410788',
    'hsa_src=fb',
    'hsa_net=facebook',
    'hsa_ver=3',
    'fbclid=IwcGRvZgNmZGlkFlCqq5wNEOPlO8uW0HWyK5bsUmHLrnBleHRuA2FlbQEwAGFkaWQBqzOMqNaLVHNydGMGYXBwX2lkCjY2Mjg1NjgzNzkAAR5oK2c2vK6yD8ylw-4pB9IEqTMMVnw4NUb5wHk4yeirsC1SwpaRt5gL06rpXA_aem_TdoHEa1uTQZEmbN3JZ_p4A',
    'utm_content=120246491016410788',
    'utm_term=120246491016400788'
  ].join('&')
  const canonicalEvent = viewItem({ referrer_url: referrerUrl })

  assert.equal(referrerUrl.length, 529)

  const mapped = normalize(
    mapCanonicalViewItemToGoogleDataManager(canonicalEvent)
  )
  const referrer = mapped.additionalEventParameters?.find(
    (candidate: { parameterName?: string }) =>
      candidate.parameterName === 'page_referrer'
  )

  assert.equal(
    referrer?.value,
    'https://utekos.no/skreddersy-varmen'
  )
  assert.equal(canonicalEvent.referrer_url, referrerUrl)

  const hashed = normalize(
    mapCanonicalViewItemToGoogleDataManager(
      viewItem({
        referrer_url:
          'https://utekos.no/produkter?source=test#details'
      })
    )
  )
  const hashedReferrer =
    hashed.additionalEventParameters?.find(
      (candidate: { parameterName?: string }) =>
        candidate.parameterName === 'page_referrer'
    )

  assert.equal(
    hashedReferrer?.value,
    'https://utekos.no/produkter'
  )
})

test('enforces documented GA4 parameter value limits', () => {
  const longLocation =
    `https://utekos.no/produkter/comfyrobe?campaign=${'x'.repeat(1100)}`
  const longTitle = 'T'.repeat(350)
  const longItemName = 'I'.repeat(150)
  const longSku = 'S'.repeat(101)
  const baseEvent = viewItem()
  const baseItem = baseEvent.custom_data.items[0]

  assert.ok(baseItem)

  const canonicalEvent = viewItem({
    page_url: longLocation,
    page_title: longTitle,
    custom_data: {
      ...baseEvent.custom_data,
      items: [
        {
          ...baseItem,
          item_name: longItemName,
          sku: longSku
        }
      ]
    }
  })

  const mapped = normalize(
    mapCanonicalViewItemToGoogleDataManager(canonicalEvent)
  )
  const eventParameters = mapped.additionalEventParameters ?? []
  const itemParameters =
    mapped.cartData?.items?.[0]?.additionalItemParameters ?? []
  const pageLocation = eventParameters.find(
    (candidate: { parameterName?: string }) =>
      candidate.parameterName === 'page_location'
  )
  const pageTitle = eventParameters.find(
    (candidate: { parameterName?: string }) =>
      candidate.parameterName === 'page_title'
  )
  const itemName = itemParameters.find(
    (candidate: { parameterName?: string }) =>
      candidate.parameterName === 'item_name'
  )
  const sku = itemParameters.find(
    (candidate: { parameterName?: string }) =>
      candidate.parameterName === 'sku'
  )

  assert.ok(String(pageLocation?.value).length <= 1000)
  assert.equal(String(pageTitle?.value).length, 300)
  assert.equal(String(itemName?.value).length, 100)
  assert.equal(sku, undefined)
  assert.equal(canonicalEvent.page_url, longLocation)
  assert.equal(canonicalEvent.page_title, longTitle)
})

test('counts encoded URLs and Unicode parameter values safely', () => {
  const pageUrl = `https://utekos.no/produkter/${'å'.repeat(400)}`
  const pageTitle = `${'T'.repeat(299)}🏕️mer`
  const canonicalEvent = viewItem({
    page_url: pageUrl,
    page_title: pageTitle
  })

  const mapped = normalize(
    mapCanonicalViewItemToGoogleDataManager(canonicalEvent)
  )
  const eventParameters = mapped.additionalEventParameters ?? []
  const pageLocation = eventParameters.find(
    (candidate: { parameterName?: string }) =>
      candidate.parameterName === 'page_location'
  )
  const mappedPageTitle = eventParameters.find(
    (candidate: { parameterName?: string }) =>
      candidate.parameterName === 'page_title'
  )

  assert.ok(String(pageLocation?.value).length <= 1000)
  assert.ok(!String(pageLocation?.value).endsWith('%'))
  assert.ok(!/%[0-9A-F]$/i.test(String(pageLocation?.value)))
  assert.equal(
    Array.from(String(mappedPageTitle?.value)).length,
    300
  )
  assert.ok(!String(mappedPageTitle?.value).endsWith('\uFFFD'))
  assert.equal(canonicalEvent.page_url, pageUrl)
  assert.equal(canonicalEvent.page_title, pageTitle)
})

test('fails closed without analytics consent', () => {
  assert.throws(
    () =>
      mapCanonicalViewItemToGoogleDataManager(
        viewItem({
          consent: {
            analytics: 'denied',
            marketing: 'granted',
            preferences: 'denied',
            source: 'cookiebot',
            version: '1'
          }
        })
      ),
    /analytics consent/i
  )
})

test('fails closed without a valid GA client ID', () => {
  assert.throws(
    () =>
      mapCanonicalViewItemToGoogleDataManager(
        viewItem({ browser_id: { ga_cookie: 'invalid' } })
      ),
    /client ID/i
  )
})

test('keeps analytics measurement but removes advertising identifiers without marketing consent', () => {
  const event = viewItem({
    consent: {
      analytics: 'granted',
      marketing: 'denied',
      preferences: 'denied',
      source: 'cookiebot',
      version: '1'
    }
  })

  const mapped = normalize(
    mapCanonicalViewItemToGoogleDataManager(event)
  )

  assert.deepEqual(mapped.consent, {
    adUserData: 'CONSENT_DENIED',
    adPersonalization: 'CONSENT_DENIED'
  })
  assert.equal(mapped.adIdentifiers, undefined)
  assert.equal(mapped.userData, undefined)
  assert.equal(mapped.userId, undefined)
  assert.equal(mapped.clientId, '97245370.1784201643')
})
