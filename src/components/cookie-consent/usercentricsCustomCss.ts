import 'server-only'

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { USERCENTRICS_SETTINGS_ID } from './usercentricsConfig'

export const USERCENTRICS_CUSTOM_CSS_PATH = join(
  process.cwd(),
  'src/components/cookie-consent/usercentrics.custom.css'
)

export const USERCENTRICS_CUSTOM_CSS_DOCS_URL =
  'https://usercentrics.com/docs/web/features/custom-css/configuration/'

export function readUsercentricsCustomCss(): string {
  return readFileSync(USERCENTRICS_CUSTOM_CSS_PATH, 'utf8')
}

export function getUsercentricsCustomCssDeployInstructions(): string {
  return [
    'Paste the CSS below into Usercentrics Admin:',
    'Appearance → Styling → Custom CSS',
    `Settings ID: ${USERCENTRICS_SETTINGS_ID}`,
    `Docs: ${USERCENTRICS_CUSTOM_CSS_DOCS_URL}`,
    ''
  ].join('\n')
}
