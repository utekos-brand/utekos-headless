import type { BrandColorToken } from '@/lib/brand/color-tokens'

const SCALE_SUFFIX = /^(.+)-(\d{2,3})$/

export type BrandTokenGroup = {
  id: string
  title: string
  kind: 'scale' | 'list'
  tokens: BrandColorToken[]
}

function stepNumber(name: string) {
  const match = name.match(/-(\d{2,3})$/)
  return match ? Number(match[1]) : -1
}

function sortScaleTokens(tokens: BrandColorToken[]) {
  return [...tokens].sort((a, b) => {
    const stepA = stepNumber(a.name)
    const stepB = stepNumber(b.name)
    if (stepA === -1 && stepB === -1) {
      return originalOrder(a) - originalOrder(b)
    }
    if (stepA === -1) return -1
    if (stepB === -1) return 1
    return stepA - stepB
  })
}

function originalOrder(token: BrandColorToken) {
  return token.relationships[0]?.occurrence ?? 0
}

function formatTitle(key: string) {
  return key
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function titleForScale(sourceTitle: string, scaleBase: string, scaleCount: number) {
  if (sourceTitle === 'Tokens' || scaleCount === 1) {
    return formatTitle(scaleBase)
  }

  return `${sourceTitle} - ${formatTitle(scaleBase)}`
}

function bucketTokensByRelationship(tokens: BrandColorToken[]) {
  const buckets = new Map<
    string,
    {
      id: string
      title: string
      order: number
      tokens: BrandColorToken[]
    }
  >()

  for (const token of tokens) {
    const relationships = token.relationships.length > 0 ? token.relationships : []

    for (const relationship of relationships) {
      const bucket = buckets.get(relationship.groupId) ?? {
        id: relationship.groupId,
        title: relationship.groupTitle,
        order: relationship.occurrence,
        tokens: []
      }

      bucket.order = Math.min(bucket.order, relationship.occurrence)
      if (!bucket.tokens.some((existingToken) => existingToken.id === token.id)) {
        bucket.tokens.push(token)
      }
      buckets.set(relationship.groupId, bucket)
    }
  }

  return [...buckets.values()].sort((a, b) => a.order - b.order)
}

function splitBucketIntoGroups(bucket: {
  id: string
  title: string
  tokens: BrandColorToken[]
}): BrandTokenGroup[] {
  const stepsByBase = new Map<string, BrandColorToken[]>()
  const baseTokens = new Map<string, BrandColorToken>()
  const unassigned: BrandColorToken[] = []

  for (const token of bucket.tokens) {
    const match = token.name.match(SCALE_SUFFIX)
    if (match) {
      const base = match[1] ?? token.name
      const scaleTokens = stepsByBase.get(base) ?? []
      scaleTokens.push(token)
      stepsByBase.set(base, scaleTokens)
      continue
    }

    const hasNumericStep = bucket.tokens.some((candidate) =>
      candidate.name.startsWith(`${token.name}-`)
    )

    if (hasNumericStep) {
      baseTokens.set(token.name, token)
      continue
    }

    unassigned.push(token)
  }

  const groups: BrandTokenGroup[] = []
  const sortedScales = [...stepsByBase.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  )

  for (const [base, steps] of sortedScales) {
    const sortedSteps = sortScaleTokens(steps)
    const baseToken = baseTokens.get(base)
    const scaleTokens = baseToken ? [baseToken, ...sortedSteps] : sortedSteps

    if (scaleTokens.length >= 2) {
      groups.push({
        id: `${bucket.id}-${base}`,
        title: titleForScale(bucket.title, base, sortedScales.length),
        kind: 'scale',
        tokens: scaleTokens
      })
      baseTokens.delete(base)
      continue
    }

    unassigned.push(...scaleTokens)
  }

  for (const token of baseTokens.values()) {
    unassigned.push(token)
  }

  if (unassigned.length > 0) {
    groups.push({
      id: `${bucket.id}-list`,
      title: bucket.title,
      kind: 'list',
      tokens: [...unassigned].sort((a, b) => originalOrder(a) - originalOrder(b))
    })
  }

  return groups
}

export function groupSectionTokens(tokens: BrandColorToken[]): BrandTokenGroup[] {
  return bucketTokensByRelationship(tokens).flatMap(splitBucketIntoGroups)
}
