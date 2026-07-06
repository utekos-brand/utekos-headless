export type SearchItem = {
  id: string
  title: string
  path: string
  parentId?: string | null
  keywords?: string[]
  children?: SearchItem[]
}
export type SearchGroup = {
  key: string
  label: string
  items: SearchItem[]
}
