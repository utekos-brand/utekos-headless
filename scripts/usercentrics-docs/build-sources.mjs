#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = join(process.cwd(), 'docs/consent-management/usercentrics')
const OUT = join(process.cwd(), 'scripts/usercentrics-docs/sources.json')

/** @type {Record<string, string | null>} */
const MANUAL = {
  'consent-management/web/features/auto-block.md':
    'https://usercentrics.com/docs/web/features/auto-blocking/',
  'consent-management/web/features/cross-device-consent-sharing.md':
    'https://usercentrics.com/docs/web/features/cross-device-consent-sharing/cross-device-consent-sharing/',
  'consent-management/web/features/control-ui.md':
    'https://usercentrics.com/docs/web/features/api/control-ui/',
  'consent-management/web/features/interfaces.md':
    'https://usercentrics.com/docs/web/features/api/interfaces/',
  'consent-management/web/features/types.md':
    'https://usercentrics.com/docs/web/features/api/types/',
  'consent-management/web/features/google-service-account.md':
    'https://usercentrics.com/docs/sst/sgtm/features/google-service-account/',
  'consent-management/web/features/resilient-script-loader.md':
    'https://usercentrics.com/docs/sst/sgtm/features/resilient-script-loader/',
  'consent-management/get-started-cmp.md':
    'https://usercentrics.com/docs/web/get-started/',
  'consent-management/web/web-cmp-latest-version/overview.md':
    'https://usercentrics.com/docs/web/v3/',
  'consent-management/web/web-cmp-latest-version/implementation/embeddings.md':
    'https://usercentrics.com/docs/web/features/embeddings/embeddings/',
  'consent-management/web/web-cmp-latest-version/implementation/google-tag-manager-config.md':
    'https://usercentrics.com/docs/web/features/google-tag-manager/',
  'consent-management/web/web-cmp-latest-version/implementation/script-implementation/ui/browser-ui-implementation.md':
    'https://usercentrics.com/docs/web/implementation/ui/',
  'consent-management/web/web-cmp-latest-version/implementation/script-implementation/ui/optional-steps.md':
    'https://usercentrics.com/docs/web/implementation/ui/#optional-steps',
  'consent-management/web/web-cmp-latest-version/implementation/script-implementation/ui/supported-attributes/interfaces.md':
    'https://usercentrics.com/docs/web/implementation/ui/supported-attributes/interfaces/',
  'consent-management/web/web-cmp-latest-version/implementation/script-implementation/ui/supported-attributes/types.md':
    'https://usercentrics.com/docs/web/implementation/ui/supported-attributes/types/',
  'consent-management/web/web-cmp-latest-version/implementation/browser-events/current_status.md':
    'https://usercentrics.com/docs/web/features/events/consent-events/browser-events/consent_status/',
  'consent-management/web/web-cmp-latest-version/implementation/browser-events/custom-events.md':
    'https://usercentrics.com/docs/web/features/events/examples/window-events/',
  'consent-management/web/web-cmp-latest-version/implementation/browser-events/UC_UI_INITIALIZED.md':
    'https://usercentrics.com/docs/web/features/events/uc-ui-initialized/',
  'consent-management/web/web-cmp-latest-version/implementation/browser-events/UC_UI_VIEW_CHANGED.md':
    'https://usercentrics.com/docs/web/features/events/uc-ui-view-changed/',
  'consent-management/web/web-cmp-latest-version/implementation/browser-events/UC_UI_CMP_EVENT.md':
    'https://usercentrics.com/docs/web/features/events/uc-ui-cmp-event/',
  'consent-management/web/web-cmp-latest-version/implementation/browser-events/UC_CONSENT.md':
    'https://usercentrics.com/docs/web/features/events/uc-consent/',
  'consent-management/web/web-cmp-latest-version/implementation/browser-events/examples/Window-Event.md':
    'https://usercentrics.com/docs/web/features/events/examples/window-events/',
  'consent-management/web/web-cmp-latest-version/implementation/browser-events/examples/add-a-script-to-the-head-via-event-listener.md':
    'https://usercentrics.com/docs/web/features/events/examples/add-script-to-head/',
  'consent-management/web/web-cmp-latest-version/implementation/browser-events/examples/detecting-first-time-visits-by-listening-to-the-consent-status-in-datalayer.md':
    'https://usercentrics.com/docs/web/features/events/examples/first-visit/',
  'consent-management/web/web-cmp-latest-version/implementation/browser-events/examples/hide-iframes-when-the-banner-is-shown.md':
    'https://usercentrics.com/docs/web/features/events/examples/hide-iframes/',
  'consent-management/web/web-cmp-latest-version/implementation/browser-events/examples/load-iframe-via-event-listener.md':
    'https://usercentrics.com/docs/web/features/events/examples/load-iframe/',
  'consent-management/web/web-cmp-latest-version/implementation/browser-events/examples/reload-page.md':
    'https://usercentrics.com/docs/web/features/events/examples/reload-page/',
  'general_info.md':
    'https://usercentrics.com/docs/web/features/google-consent-mode/general-information/',
  'google-consent-mode-implementation-example.md':
    'https://usercentrics.com/docs/web/features/google-consent-mode/implementation-example/',
  'ga.md':
    'https://usercentrics.com/docs/web/features/google-consent-mode/supported-google-services/',
  'server-side-tagging/introduction.md':
    'https://usercentrics.com/docs/sst/introduction/',
  'server-side-tagging/sgtm/get_started.md':
    'https://usercentrics.com/docs/sst/sgtm/get-started/',
  'server-side-tagging/sgtm/consent-signals-in-a-server-side-container.md':
    'https://usercentrics.com/docs/sst/sgtm/consent-server-side/',
  'server-side-tagging/sgtm/features/bot-detection.md':
    'https://usercentrics.com/docs/sst/sgtm/features/bot-detection/',
  'server-side-tagging/sgtm/features/geolocation-headers.md':
    'https://usercentrics.com/docs/sst/sgtm/features/geolocation-headers/',
  'server-side-tagging/sgtm/features/about-sst/about-server-side-tagging.md':
    'https://usercentrics.com/docs/sst/sgtm/learn-more/what-is-server-side-tracking/',
  'server-side-tagging/sgtm/features/about-sst/data-flows-within-server-side .md':
    'https://usercentrics.com/docs/sst/sgtm/learn-more/data-flows-within-server-side/',
  'server-side-tagging/sgtm/features/about-sst/subdomain-vs-same-origin-endpoints.md':
    'https://usercentrics.com/docs/sst/sgtm/learn-more/subdomain-vs-same-origin-endpoints/',
  'server-side-tagging/sgtm/use-cases/google-ads.md':
    'https://usercentrics.com/docs/sst/sgtm/use-cases/google-ads/',
  'server-side-tagging/sgtm/use-cases/bing.md':
    'https://usercentrics.com/docs/sst/sgtm/use-cases/bing/',
  'server-side-tagging/sgtm/use-cases/meta/meta.md':
    'https://usercentrics.com/docs/sst/sgtm/use-cases/meta/',
  'server-side-tagging/sgtm/use-cases/meta/meta-get-started-signal_gateway.md':
    'https://usercentrics.com/docs/sst/msgw/get-started-with-msgw/',
  'server-side-tagging/sgtm/use-cases/meta/meta_server_capi.md':
    'https://usercentrics.com/docs/sst/sgtm/use-cases/meta/capi-tag-template/',
  'server-side-tagging/sgtm/use-cases/meta/meta_signal_gateway.md':
    'https://usercentrics.com/docs/sst/msgw/overview/',
  'web/features/events/consent-events/consent-modes-and-consent-signal/microsoft-clarity-consent-mode.md':
    'https://usercentrics.com/docs/web/features/consent-modes-and-consent-signals/microsoft-clarity-consent-mode/',
  'web/features/events/consent-events/consent-modes-and-consent-signal/microsoft-uet.md':
    'https://usercentrics.com/docs/web/features/consent-modes-and-consent-signals/microsoft-uet/',
  'web/features/events/consent-events/browser-events/current_status.md':
    'https://usercentrics.com/docs/web/features/events/consent-events/browser-events/consent_status/',
  'web/features/geolocation-ruleset.md':
    'https://usercentrics.com/docs/web/features/geolocation/rulesets/',
  'articles/blog.md': 'https://usercentrics.com/resources/blog/',
  'articles/Transparent_Content_Framework.v2.3.md': null,
  'web/features/events/consent-events/browser-events/docs/usercentrics/web/features/events/consent-events/browser-events/current_status.md':
    null,
}

/**
 * @param {string} dir
 * @returns {string[]}
 */
function walkMd(dir) {
  /** @type {string[]} */
  const files = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      files.push(...walkMd(full))
    } else if (entry.endsWith('.md')) {
      files.push(relative(ROOT, full))
    }
  }
  return files.sort()
}

/**
 * @param {string} content
 * @returns {string | null}
 */
function extractUrlFromContent(content) {
  const yamlUrl = content.match(/^url:\s*['"]?(https:\/\/usercentrics\.com\/docs\/[^'"\n]+)['"]?/m)
  if (yamlUrl) return yamlUrl[1].replace(/\/$/, '') + (yamlUrl[1].endsWith('/') ? '' : '')

  const sourceLine = content.match(/^Source:\s*(https:\/\/usercentrics\.com\/docs\/\S+)/m)
  if (sourceLine) return sourceLine[1].replace(/\/$/, '') + '/'

  const docsLink = content.match(/https:\/\/usercentrics\.com\/docs\/[^\s)\]`'"]+/ )
  if (docsLink) {
    let url = docsLink[0]
    if (!url.endsWith('/')) url += '/'
    return url
  }

  return null
}

const files = walkMd(ROOT)
/** @type {Record<string, string | null>} */
const sources = {}

for (const rel of files) {
  const content = readFileSync(join(ROOT, rel), 'utf8')
  sources[rel] = MANUAL[rel] ?? extractUrlFromContent(content)
}

writeFileSync(OUT, `${JSON.stringify(sources, null, 2)}\n`)
console.log(`Wrote ${Object.keys(sources).length} entries to ${OUT}`)
