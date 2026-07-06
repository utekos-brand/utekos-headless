/*
  WCAG 2.2 contrast scanner (1.4.3) for in-browser execution via
  CDP Runtime.evaluate. Walks visible text nodes, resolves effective
  foreground/background colors (with alpha compositing against
  ancestor backgrounds), and reports pairs below AA thresholds:
  4.5:1 normal text, 3:1 large text (>=24px, or >=18.66px bold).
  Elements rendered over background images are reported separately
  for manual review since their effective background is unknown.
*/
(() => {
  const parse = c => {
    const m = c.match(/rgba?\(([^)]+)\)/)
    if (!m) return null
    const [r, g, b, a = '1'] = m[1].split(/[,\s/]+/).filter(Boolean)
    return [+r, +g, +b, +a]
  }
  const lum = ([r, g, b]) => {
    const lin = v => {
      v /= 255
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
  }
  const ratio = (f, bg) => {
    const l1 = lum(f)
    const l2 = lum(bg)
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
  }
  const composite = (top, bottom) => {
    const a = top[3]
    return [
      top[0] * a + bottom[0] * (1 - a),
      top[1] * a + bottom[1] * (1 - a),
      top[2] * a + bottom[2] * (1 - a),
      1
    ]
  }
  const effectiveBg = el => {
    const layers = []
    let node = el
    let overImage = false
    while (node && node !== document.documentElement.parentNode) {
      const cs = getComputedStyle(node)
      if (cs.backgroundImage && cs.backgroundImage !== 'none') overImage = true
      const bg = parse(cs.backgroundColor)
      if (bg && bg[3] > 0) {
        layers.push(bg)
        if (bg[3] >= 1) break
      }
      node = node.parentElement
    }
    if (!layers.length) return { color: [255, 255, 255, 1], overImage }
    let result = layers[layers.length - 1]
    if (result[3] < 1) result = composite(result, [255, 255, 255, 1])
    for (let i = layers.length - 2; i >= 0; i--) {
      result = composite(layers[i], result)
    }
    return { color: result, overImage }
  }
  const failures = []
  const overImage = []
  const seen = new Set()
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  let tn
  while ((tn = walker.nextNode())) {
    const text = tn.textContent.trim()
    if (!text || text.length < 2) continue
    const el = tn.parentElement
    if (!el || seen.has(el)) continue
    seen.add(el)
    if (el.closest('[aria-hidden="true"], script, style, noscript, [hidden]')) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) continue
    if (el.closest('button:disabled, [disabled], [aria-disabled="true"]')) continue
    let fg = parse(cs.color)
    if (!fg || fg[3] === 0) continue
    const bgInfo = effectiveBg(el)
    if (fg[3] < 1) fg = composite(fg, bgInfo.color)
    const size = parseFloat(cs.fontSize)
    const weight = +cs.fontWeight || 400
    const large = size >= 24 || (size >= 18.66 && weight >= 700)
    const threshold = large ? 3 : 4.5
    const r = ratio(fg, bgInfo.color)
    const entry = {
      text: text.slice(0, 60),
      tag: el.tagName.toLowerCase(),
      cls: (el.className && String(el.className).slice(0, 90)) || '',
      fg: cs.color,
      bg: `rgb(${bgInfo.color.slice(0, 3).map(Math.round).join(',')})`,
      size: `${size}px/${weight}`,
      ratio: Math.round(r * 100) / 100,
      threshold
    }
    if (bgInfo.overImage) {
      if (r < threshold) overImage.push(entry)
    } else if (r < threshold) {
      failures.push(entry)
    }
  }
  failures.sort((a, b) => a.ratio - b.ratio)
  overImage.sort((a, b) => a.ratio - b.ratio)
  return JSON.stringify(
    {
      url: location.pathname,
      dark: document.documentElement.classList.contains('dark'),
      textNodesChecked: seen.size,
      failures: failures.slice(0, 40),
      failureCount: failures.length,
      overImageNeedsManualReview: overImage.slice(0, 15),
      overImageCount: overImage.length
    },
    null,
    1
  )
})()
