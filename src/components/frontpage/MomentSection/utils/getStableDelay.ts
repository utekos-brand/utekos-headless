// Path: src/utils/animationUtils.ts

export function getStableDelay(seed: number, modifier: number): string {
  return ((seed * modifier) % 3).toFixed(2)
}
