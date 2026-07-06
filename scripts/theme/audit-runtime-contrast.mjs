#!/usr/bin/env node

import { chromium } from 'playwright'
import { parse, wcagContrast } from 'culori'

const DEFAULT_BASE_URL = 'http://localhost:3000'
const DEFAULT_ROUTES = ['/', '/produkter', '/produkter/utekos-techdown']
const DEFAULT_VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 1000 }
]
const DEFAULT_MODES = ['light', 'dark']
const TEXT_CONTRAST_THRESHOLD = 4.5
const UI_CONTRAST_THRESHOLD = 3
const DEFAULT_FAILURE_LIMIT = 200
const DEFAULT_WARNING_LIMIT = 50

function argValue(name) {
  const prefix = `${name}=`
  const match = process.argv.find(argument => argument.startsWith(prefix))

  return match ? match.slice(prefix.length) : null
}

function parseCsv(value, fallback) {
  return value ?
      value
        .split(',')
        .map(entry => entry.trim())
        .filter(Boolean)
    : fallback
}

function parseViewports(value) {
  if (!value) {
    return DEFAULT_VIEWPORTS
  }

  return value.split(',').map(entry => {
    const [width, height] = entry.split('x').map(Number)

    if (!Number.isFinite(width) || !Number.isFinite(height)) {
      throw new Error(`Invalid viewport "${entry}". Use WIDTHxHEIGHT.`)
    }

    return { width, height }
  })
}

function parseLimit(value, fallback) {
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  if (['0', 'all', 'none', 'false'].includes(value.toLowerCase())) {
    return Number.POSITIVE_INFINITY
  }

  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`Invalid limit "${value}". Use a positive integer or 0/all.`)
  }

  return parsed
}

function limitEntries(entries, limit) {
  return Number.isFinite(limit) ? entries.slice(0, limit) : entries
}

function normalizeUrl(baseUrl, route) {
  return new URL(route, baseUrl).toString()
}

function colorFromCss(cssColor) {
  const color = parse(cssColor)

  if (!color) {
    return null
  }

  return color
}

function alphaFromCssColor(cssColor) {
  if (!cssColor || cssColor === 'transparent') {
    return 0
  }

  const rgba = cssColor.match(
    /rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+(?:\s*,\s*([\d.]+))?\s*\)/
  )

  if (rgba) {
    return rgba[1] === undefined ? 1 : Number(rgba[1])
  }

  const slashAlpha = cssColor.match(/\/\s*([\d.]+%?)\s*\)$/)

  if (!slashAlpha) {
    return 1
  }

  const value = slashAlpha[1]

  return value.endsWith('%') ?
      Number(value.slice(0, -1)) / 100
    : Number(value)
}

function contrastRatio(foreground, background) {
  const foregroundColor = colorFromCss(foreground)
  const backgroundColor = colorFromCss(background)

  if (!foregroundColor || !backgroundColor) {
    return null
  }

  return wcagContrast(foregroundColor, backgroundColor)
}

function roundRatio(ratio) {
  return Number(ratio.toFixed(2))
}

function normalizeGroupValue(value) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  if (typeof value !== 'string') {
    return JSON.stringify(value)
  }

  return value.replace(/\s+/g, ' ').trim()
}

function groupFailures(failures, keyFields) {
  const groups = new Map()

  for (const failure of failures) {
    const keyParts = keyFields.map(field => normalizeGroupValue(failure[field]))
    const key = JSON.stringify(keyParts)
    const existing = groups.get(key) ?? {
      count: 0,
      key: Object.fromEntries(
        keyFields.map((field, index) => [field, keyParts[index]])
      ),
      minRatio: null,
      maxRatio: null,
      required: failure.required ?? null,
      routes: new Set(),
      modes: new Set(),
      viewports: new Set(),
      foregrounds: new Set(),
      backgrounds: new Set(),
      borderColors: new Set()
    }

    existing.count += 1

    if (typeof failure.ratio === 'number') {
      existing.minRatio =
        existing.minRatio === null ?
          failure.ratio
        : Math.min(existing.minRatio, failure.ratio)
      existing.maxRatio =
        existing.maxRatio === null ?
          failure.ratio
        : Math.max(existing.maxRatio, failure.ratio)
    }

    if (failure.route) {
      existing.routes.add(failure.route)
    }

    if (failure.mode) {
      existing.modes.add(failure.mode)
    }

    if (failure.viewport) {
      existing.viewports.add(`${failure.viewport.width}x${failure.viewport.height}`)
    }

    if (failure.foreground) {
      existing.foregrounds.add(failure.foreground)
    }

    if (failure.background) {
      existing.backgrounds.add(failure.background)
    }

    if (failure.borderColor) {
      existing.borderColors.add(failure.borderColor)
    }

    groups.set(key, existing)
  }

  return Array.from(groups.values())
    .map(group => ({
      ...group,
      routes: Array.from(group.routes).sort(),
      modes: Array.from(group.modes).sort(),
      viewports: Array.from(group.viewports).sort(),
      foregrounds: Array.from(group.foregrounds).sort(),
      backgrounds: Array.from(group.backgrounds).sort(),
      borderColors: Array.from(group.borderColors).sort()
    }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count
      }

      return (a.minRatio ?? Number.POSITIVE_INFINITY) -
        (b.minRatio ?? Number.POSITIVE_INFINITY)
    })
}

async function scanPage(page) {
  return page.evaluate(() => {
    const hiddenTags = new Set([
      'SCRIPT',
      'STYLE',
      'NOSCRIPT',
      'TEMPLATE'
    ])
    const controlSelector = [
      'button',
      'a',
      'input',
      'select',
      'textarea',
      '[role="button"]',
      '[role="menuitem"]',
      '[role="tab"]'
    ].join(',')

    function parseAlpha(color) {
      if (!color || color === 'transparent') {
        return 0
      }

      const match = color.match(
        /rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+(?:\s*,\s*([\d.]+))?\s*\)/
      )

      if (match) {
        return match[1] === undefined ? 1 : Number(match[1])
      }

      const slashAlpha = color.match(/\/\s*([\d.]+%?)\s*\)$/)

      if (!slashAlpha) {
        return 1
      }

      const value = slashAlpha[1]

      return value.endsWith('%') ?
          Number(value.slice(0, -1)) / 100
        : Number(value)
    }

    function isVisibleElement(element) {
      const style = window.getComputedStyle(element)

      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        Number(style.opacity) === 0
      ) {
        return false
      }

      if (
        element.classList.contains('sr-only') ||
        style.clipPath === 'inset(50%)' ||
        style.clip === 'rect(0px, 0px, 0px, 0px)'
      ) {
        return false
      }

      const rect = element.getBoundingClientRect()

      return rect.width > 0 && rect.height > 0
    }

    function effectiveBackground(element) {
      let current = element

      while (current && current instanceof Element) {
        const style = window.getComputedStyle(current)
        const backgroundColor = style.backgroundColor

        if (backgroundColor && parseAlpha(backgroundColor) > 0.98) {
          return backgroundColor
        }

        current = current.parentElement
      }

      return window.getComputedStyle(document.body).backgroundColor
    }

    function selectorFor(element) {
      const testId = element.getAttribute('data-testid')
      const track = element.getAttribute('data-track')
      const id = element.id

      if (testId) {
        return `[data-testid="${testId}"]`
      }

      if (track) {
        return `[data-track="${track}"]`
      }

      if (id) {
        return `#${id}`
      }

      const tag = element.tagName.toLowerCase()
      const className =
        typeof element.className === 'string' ?
          element.className
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 3)
            .map(name => `.${CSS.escape(name)}`)
            .join('')
        : ''

      return `${tag}${className}`
    }

    function isSvgTextElement(element) {
      return Boolean(element.closest('svg'))
    }

    function isDevelopmentToolElement(element) {
      const labelledElement = element.closest('[aria-label]')
      const ariaLabel = labelledElement?.getAttribute('aria-label') ?? ''

      return /tanstack query devtools/i.test(ariaLabel)
    }

    function graphicColorEntries(element) {
      const style = window.getComputedStyle(element)
      const rawEntries = [
        ['fill', style.fill],
        ['stroke', style.stroke]
      ]
      const renderedColors = new Set(
        rawEntries
          .map(([, color]) => color)
          .filter(color => color && color !== 'none' && parseAlpha(color) > 0.05)
      )

      if (
        style.color &&
        style.color !== 'none' &&
        parseAlpha(style.color) > 0.05 &&
        !renderedColors.has(style.color)
      ) {
        rawEntries.push(['color', style.color])
      }

      return rawEntries
        .filter(([, color]) => {
          if (!color || color === 'none' || color === 'transparent') {
            return false
          }

          return parseAlpha(color) > 0.05
        })
        .map(([property, color]) => ({ property, color }))
    }

    function boxShadowColors(boxShadow) {
      if (!boxShadow || boxShadow === 'none') {
        return []
      }

      return boxShadow.match(/(?:rgba?\([^)]+\)|oklch\([^)]+\)|color\([^)]+\))/g) ?? []
    }

    function hasVisibleBorder(style) {
      const widths = [
        style.borderTopWidth,
        style.borderRightWidth,
        style.borderBottomWidth,
        style.borderLeftWidth
      ].map(width => Number.parseFloat(width))
      const styles = [
        style.borderTopStyle,
        style.borderRightStyle,
        style.borderBottomStyle,
        style.borderLeftStyle
      ]

      return widths.some((width, index) =>
        Number.isFinite(width) &&
        width > 0 &&
        styles[index] !== 'none' &&
        styles[index] !== 'hidden'
      )
    }

    function visibleFocusIndicators(element) {
      const previousActiveElement = document.activeElement
      const previousStyle = window.getComputedStyle(element)
      const previousBoxShadow = previousStyle.boxShadow
      const previousBoxShadowColors = new Set(boxShadowColors(previousBoxShadow))
      const previousOutline = {
        color: previousStyle.outlineColor,
        style: previousStyle.outlineStyle,
        width: previousStyle.outlineWidth
      }

      try {
        element.focus({ preventScroll: true })

        if (
          document.activeElement !== element &&
          !element.contains(document.activeElement)
        ) {
          return []
        }

        const style = window.getComputedStyle(element)
        const indicatorBackground = effectiveBackground(element.parentElement ?? element)
        const indicators = []
        const outlineWidth = Number.parseFloat(style.outlineWidth)
        const outlineChanged =
          style.outlineColor !== previousOutline.color ||
          style.outlineStyle !== previousOutline.style ||
          style.outlineWidth !== previousOutline.width

        if (
          outlineChanged &&
          style.outlineStyle !== 'none' &&
          Number.isFinite(outlineWidth) &&
          outlineWidth > 0 &&
          parseAlpha(style.outlineColor) > 0.05
        ) {
          indicators.push({
            property: 'outlineColor',
            color: style.outlineColor,
            background: indicatorBackground
          })
        }

        if (style.boxShadow !== previousBoxShadow) {
          for (const color of boxShadowColors(style.boxShadow)) {
            if (
              parseAlpha(color) > 0.05 &&
              !previousBoxShadowColors.has(color)
            ) {
              indicators.push({
                property: 'boxShadow',
                color,
                background: indicatorBackground
              })
            }
          }
        }

        const seen = new Set()

        return indicators.filter(indicator => {
          const key = `${indicator.property}:${indicator.color}:${indicator.background}`

          if (seen.has(key)) {
            return false
          }

          seen.add(key)
          return true
        })
      } catch {
        return []
      } finally {
        if (
          previousActiveElement &&
          previousActiveElement !== document.activeElement &&
          typeof previousActiveElement.focus === 'function'
        ) {
          previousActiveElement.focus({ preventScroll: true })
        } else if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
      }
    }

    function visibleTextForControl(element) {
      const textParts = []
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT
      )

      while (walker.nextNode()) {
        const node = walker.currentNode
        const parent = node.parentElement
        const text = node.textContent?.replace(/\s+/g, ' ').trim()

        if (
          !text ||
          !parent ||
          hiddenTags.has(parent.tagName) ||
          isSvgTextElement(parent)
        ) {
          continue
        }

        if (
          parent.closest('[aria-hidden="true"]') ||
          !isVisibleElement(parent)
        ) {
          continue
        }

        textParts.push(text)
      }

      return textParts.join(' ').replace(/\s+/g, ' ').trim().slice(0, 120)
    }

    const textNodes = []
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT
    )

    while (walker.nextNode()) {
      const node = walker.currentNode
      const text = node.textContent?.replace(/\s+/g, ' ').trim()

      if (!text || text.length < 2) {
        continue
      }

      const element = node.parentElement

      if (
        !element ||
        hiddenTags.has(element.tagName) ||
        isSvgTextElement(element)
      ) {
        continue
      }

      if (element.closest('[aria-hidden="true"]')) {
        continue
      }

      if (!isVisibleElement(element)) {
        continue
      }

      const style = window.getComputedStyle(element)

      textNodes.push({
        kind: 'text',
        text: text.slice(0, 120),
        selector: selectorFor(element),
        foreground: style.color,
        background: effectiveBackground(element),
        fontSize: Number.parseFloat(style.fontSize),
        fontWeight: style.fontWeight
      })
    }

    const controls = Array.from(
      document.querySelectorAll(controlSelector)
    )
      .filter(element => isVisibleElement(element) && !isDevelopmentToolElement(element))
      .map(element => {
        const style = window.getComputedStyle(element)
        const visibleText = visibleTextForControl(element)

        return {
          kind: 'control',
          text:
            visibleText ||
            element.getAttribute('aria-label') ||
            selectorFor(element),
          hasVisibleText: Boolean(visibleText),
          selector: selectorFor(element),
          foreground: style.color,
          background: effectiveBackground(element),
          borderColor: style.borderColor,
          borderVisible: hasVisibleBorder(style),
          outlineColor: style.outlineColor,
          focusIndicators: visibleFocusIndicators(element)
        }
      })

    const svgGraphics = []
    const seenSvgGraphics = new Set()

    for (const svg of Array.from(document.querySelectorAll('svg'))) {
      if (!isVisibleElement(svg)) {
        continue
      }

      if (isDevelopmentToolElement(svg)) {
        continue
      }

      const control = svg.closest(controlSelector)
      const ariaHidden = svg.closest('[aria-hidden="true"]')

      if (!control && ariaHidden) {
        continue
      }

      const sourceText =
        control ?
          visibleTextForControl(control) ||
          control.getAttribute('aria-label') ||
          selectorFor(control)
        : svg.getAttribute('aria-label') || selectorFor(svg)

      const graphicElements = [svg, ...Array.from(svg.querySelectorAll('*'))]

      for (const graphicElement of graphicElements) {
        if (!isVisibleElement(graphicElement)) {
          continue
        }

        for (const entry of graphicColorEntries(graphicElement)) {
          const background = effectiveBackground(graphicElement)
          const selector = `${selectorFor(svg)} ${selectorFor(graphicElement)}`
          const key = `${selector}:${entry.property}:${entry.color}:${background}`

          if (seenSvgGraphics.has(key)) {
            continue
          }

          seenSvgGraphics.add(key)
          svgGraphics.push({
            kind: `svg-${entry.property}-contrast`,
            selector,
            text: sourceText,
            foreground: entry.color,
            background,
            colorProperty: entry.property
          })
        }
      }
    }

    return { textNodes, controls, svgGraphics }
  })
}

async function main() {
  const baseUrl = argValue('--base-url') ?? DEFAULT_BASE_URL
  const routes = parseCsv(argValue('--routes'), DEFAULT_ROUTES)
  const modes = parseCsv(argValue('--modes'), DEFAULT_MODES)
  const viewports = parseViewports(argValue('--viewports'))
  const failureLimit = parseLimit(
    argValue('--max-failures'),
    DEFAULT_FAILURE_LIMIT
  )
  const warningLimit = parseLimit(
    argValue('--max-warnings'),
    DEFAULT_WARNING_LIMIT
  )
  const failures = []
  const warnings = []
  const browser = await chromium.launch({ headless: true })

  try {
    for (const viewport of viewports) {
      for (const mode of modes) {
        const context = await browser.newContext({ viewport })
        const page = await context.newPage()

        await page.addInitScript(selectedMode => {
          window.localStorage.setItem('theme', selectedMode)
          document.documentElement.classList.remove('light', 'dark')
          document.documentElement.classList.add(selectedMode)
        }, mode)

        for (const route of routes) {
          const url = normalizeUrl(baseUrl, route)
          const response = await page.goto(url, {
            waitUntil: 'networkidle',
            timeout: 45000
          })

          if (!response?.ok()) {
            failures.push({
              route,
              mode,
              viewport,
              kind: 'navigation',
              status: response?.status() ?? null
            })
            continue
          }

          const htmlClassList = await page.evaluate(() =>
            Array.from(document.documentElement.classList)
          )

          if (!htmlClassList.includes(mode)) {
            failures.push({
              route,
              mode,
              viewport,
              kind: 'mode-class',
              htmlClassList
            })
          }

          const { textNodes, controls, svgGraphics } = await scanPage(page)

          for (const item of textNodes) {
            const ratio = contrastRatio(item.foreground, item.background)

            if (ratio === null) {
              warnings.push({ route, mode, viewport, item })
              continue
            }

            if (ratio < TEXT_CONTRAST_THRESHOLD) {
              failures.push({
                route,
                mode,
                viewport,
                kind: 'text-contrast',
                selector: item.selector,
                text: item.text,
                ratio: roundRatio(ratio),
                required: TEXT_CONTRAST_THRESHOLD,
                foreground: item.foreground,
                background: item.background
              })
            }
          }

          for (const item of controls) {
            const foregroundRatio = contrastRatio(
              item.foreground,
              item.background
            )

            if (
              foregroundRatio !== null &&
              item.hasVisibleText &&
              foregroundRatio < TEXT_CONTRAST_THRESHOLD
            ) {
              failures.push({
                route,
                mode,
                viewport,
                kind: 'control-text-contrast',
                selector: item.selector,
                text: item.text,
                ratio: roundRatio(foregroundRatio),
                required: TEXT_CONTRAST_THRESHOLD,
                foreground: item.foreground,
                background: item.background
              })
            }

            const borderRatio = contrastRatio(
              item.borderColor,
              item.background
            )

            if (
              borderRatio !== null &&
              item.borderVisible &&
              alphaFromCssColor(item.borderColor) > 0.05 &&
              item.borderColor !== item.background &&
              borderRatio < UI_CONTRAST_THRESHOLD
            ) {
              failures.push({
                route,
                mode,
                viewport,
                kind: 'control-border-contrast',
                selector: item.selector,
                text: item.text,
                ratio: roundRatio(borderRatio),
                required: UI_CONTRAST_THRESHOLD,
                borderColor: item.borderColor,
                background: item.background
              })
            }

            for (const indicator of item.focusIndicators) {
              const indicatorRatio = contrastRatio(
                indicator.color,
                indicator.background
              )

              if (
                indicatorRatio !== null &&
                indicatorRatio < UI_CONTRAST_THRESHOLD
              ) {
                failures.push({
                  route,
                  mode,
                  viewport,
                  kind: `control-focus-${indicator.property}-contrast`,
                  selector: item.selector,
                  text: item.text,
                  ratio: roundRatio(indicatorRatio),
                  required: UI_CONTRAST_THRESHOLD,
                  foreground: indicator.color,
                  background: indicator.background
                })
              }
            }
          }

          for (const item of svgGraphics) {
            const ratio = contrastRatio(item.foreground, item.background)

            if (ratio === null) {
              warnings.push({ route, mode, viewport, item })
              continue
            }

            if (ratio < UI_CONTRAST_THRESHOLD) {
              failures.push({
                route,
                mode,
                viewport,
                kind: item.kind,
                selector: item.selector,
                text: item.text,
                ratio: roundRatio(ratio),
                required: UI_CONTRAST_THRESHOLD,
                foreground: item.foreground,
                background: item.background,
                colorProperty: item.colorProperty
              })
            }
          }
        }

        await context.close()
      }
    }
  } finally {
    await browser.close()
  }

  const result = {
    ok: failures.length === 0,
    baseUrl,
    routes,
    modes,
    viewports,
    summary: {
      failures: failures.length,
      warnings: warnings.length,
      emittedFailures: Math.min(failures.length, failureLimit),
      emittedWarnings: Math.min(warnings.length, warningLimit)
    },
    failureGroups: {
      bySurface: groupFailures(failures, [
        'kind',
        'selector',
        'text',
        'foreground',
        'background',
        'borderColor'
      ]),
      byRouteMode: groupFailures(failures, [
        'route',
        'mode',
        'kind',
        'selector',
        'text'
      ])
    },
    failures: limitEntries(failures, failureLimit),
    warnings: limitEntries(warnings, warningLimit)
  }

  console.log(JSON.stringify(result, null, 2))
  process.exit(result.ok ? 0 : 1)
}

main().catch(error => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      },
      null,
      2
    )
  )
  process.exit(1)
})
