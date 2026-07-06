import type { Config } from 'prettier'
import type { PluginOptions } from 'prettier-plugin-tailwindcss'

const config: Config & PluginOptions = {
  arrowParens: 'avoid',
  bracketSameLine: false,
  bracketSpacing: true,
  endOfLine: 'lf',
  experimentalTernaries: true,
  jsxSingleQuote: true,
  printWidth: 65,
  proseWrap: 'always',
  objectWrap: 'collapse',
  quoteProps: 'consistent',
  semi: false,
  singleQuote: true,
  tailwindFunctions: ['clsx', 'cn', 'cva', 'twMerge'],
  tabWidth: 2,
  trailingComma: 'none',
  plugins: [
    'prettier-plugin-tailwindcss',
    'prettier-plugin-markdown-html',
    'prettier-plugin-expand-json'
  ],
  tailwindStylesheet: './src/globals.css'
}

export default config
