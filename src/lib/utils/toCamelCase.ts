// Path: src/lib/utils/toCamelCase.ts

export function toCamelCase(s: string): string {
  return s.replace(/([-_][a-z])/gi, $1 => {
    return $1.toUpperCase().replace('-', '').replace('_', '')
  })
}
