import assert from 'node:assert/strict'
import test from 'node:test'
import { UserData } from 'facebook-nodejs-business-sdk'
import { buildMetaRequestContext } from './buildMetaRequestContext'
import { MetaServerEvent } from './MetaServerEvent'

const consent = {
  analytics: 'denied',
  marketing: 'granted',
  preferences: 'denied',
  source: 'cookiebot',
  version: '1'
} as const

test('preserves explicit canonical identifiers while adding the builder referrer', () => {
  const fbc = 'fb.1.1784368700000.meta-click.AQQCAQMB'
  const fbp = 'fb.1.1784368600000.123456789.AQQCAQMB'
  const clientIpAddress = '203.0.113.8'
  const event = {
    schema_version: 1,
    event_name: 'page_view',
    event_id: '61c2ef59-6e6f-4f56-a63a-567ca398f9de',
    event_time: '2026-07-18T10:00:00.000Z',
    source: 'web',
    environment: 'test',
    consent,
    browser_id: { fbc, fbp },
    client_ip_address: clientIpAddress,
    page_url: 'https://utekos.no/kampanje?fbclid=meta-click',
    referrer_url: 'https://www.facebook.com/'
  } as const
  const serverEvent = new MetaServerEvent()

  serverEvent
    .setEventName('PageView')
    .setUserData(
      new UserData()
        .setFbc(fbc)
        .setFbp(fbp)
        .setClientIpAddress(clientIpAddress)
    )
    .setEventSourceUrl(event.page_url)
  serverEvent.setRequestContext(buildMetaRequestContext(event))

  const payload = serverEvent.normalize() as {
    event_source_url: string
    referrer_url: string
    user_data: {
      client_ip_address: string
      fbc: string
      fbp: string
    }
  }

  assert.equal(payload.user_data.fbc, fbc)
  assert.equal(payload.user_data.fbp, fbp)
  assert.equal(
    payload.user_data.client_ip_address,
    clientIpAddress
  )
  assert.equal(payload.event_source_url, event.page_url)
  assert.match(
    payload.referrer_url,
    /^https:\/\/www\.facebook\.com\/\.[A-Za-z0-9]{8}$/
  )
})

test('fills missing identifiers and URLs from server-owned request context', () => {
  const event = {
    schema_version: 1,
    event_name: 'page_view',
    event_id: 'd9dd30a0-a209-474b-88c2-372f06cebf54',
    event_time: '2026-07-18T10:00:00.000Z',
    source: 'web',
    environment: 'test',
    consent,
    click_id: { fbclid: 'server-query-click' },
    client_ip_address: '203.0.113.9',
    page_url: 'https://utekos.no/produkter'
  } as const
  const serverEvent = new MetaServerEvent()

  serverEvent.setRequestContext(buildMetaRequestContext(event))

  const payload = serverEvent.normalize() as {
    event_source_url: string
    user_data: {
      client_ip_address: string
      fbc: string
      fbp: string
    }
  }

  assert.match(
    payload.user_data.fbc,
    /^fb\.1\.\d+\.server-query-click\.[A-Za-z0-9]{8}$/
  )
  assert.match(
    payload.user_data.fbp,
    /^fb\.1\.\d+\.\d+\.[A-Za-z0-9]{8}$/
  )
  assert.match(
    payload.user_data.client_ip_address,
    /^203\.0\.113\.9\.[A-Za-z0-9]{8}$/
  )
  assert.match(
    payload.event_source_url,
    /^https:\/\/utekos\.no\/produkter\.[A-Za-z0-9]{8}$/
  )
})
