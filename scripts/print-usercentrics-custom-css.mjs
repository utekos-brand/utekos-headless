import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const cssPath = join(process.cwd(), 'src/components/cookie-consent/usercentrics.custom.css')
const settingsId = process.env.NEXT_PUBLIC_USERCENTRICS_SETTINGS_ID || '9suQr3rGddL3Tb'
const css = readFileSync(cssPath, 'utf8')

process.stdout.write(
  [
    'Usercentrics Custom CSS — copy everything below into Admin:',
    'Appearance → Styling → Custom CSS',
    `Settings ID: ${settingsId}`,
    'Docs: https://usercentrics.com/docs/web/features/custom-css/configuration/',
    '',
    '--- CSS START ---',
    css.trim(),
    '--- CSS END ---',
    ''
  ].join('\n')
)
