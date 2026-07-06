/** OKLCH → sRGB → relative luminance → WCAG 2.2 contrast ratio. */

export type Oklch = readonly [lightness: number, chroma: number, hue: number]

function oklchToRgb([l, c, h]: Oklch): [number, number, number] {
  const hRad = (h * Math.PI) / 180
  const a = c * Math.cos(hRad)
  const b = c * Math.sin(hRad)
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.291485548 * b
  const r = +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_
  const g = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_
  const bl = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_
  const gamma = (x: number) =>
    x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(0, x), 1 / 2.4) - 0.055
  return [gamma(r), gamma(g), gamma(bl)].map(v => Math.max(0, Math.min(1, v))) as [number, number, number]
}

function relativeLuminance(rgb: [number, number, number]): number {
  const linear = rgb.map(v => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))) as [
    number,
    number,
    number
  ]
  const [r, g, b] = linear
  return r * 0.2126 + g * 0.7152 + b * 0.0722
}

export function contrastRatio(foreground: Oklch, background: Oklch): number {
  const l1 = relativeLuminance(oklchToRgb(foreground))
  const l2 = relativeLuminance(oklchToRgb(background))
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

export function meetsWcag(ratio: number, requirement: 'normal' | 'large' | 'ui'): boolean {
  switch (requirement) {
    case 'normal':
      return ratio >= 4.5
    case 'large':
      return ratio >= 3
    case 'ui':
      return ratio >= 3
    default: {
      const _exhaustive: never = requirement
      return _exhaustive
    }
  }
}
