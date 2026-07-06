// Path: src/app/handlehjelp/vask-og-vedlikehold/types/index.ts

export type Technology = {
  readonly icon: string
  readonly title: string
  readonly iconColor: string
  readonly content: string
  readonly products: readonly string[]
}

export type TechnologyGroup = {
  readonly groupTitle: string
  readonly technologies: readonly Technology[]
}
