export function hasNonEmptyTextPart(parts: unknown[]): boolean {
  return parts.some(part => {
    return (
      typeof part === 'object'
      && part !== null
      && 'type' in part
      && part.type === 'text'
      && 'text' in part
      && typeof part.text === 'string'
      && part.text.trim().length > 0
    )
  })
}
