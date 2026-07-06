// Path: types/menu.types.ts

export type MenuItem = {
  title: string
  url: string
  items?: MenuItem[] | undefined
}

export type Action = { type: 'OPEN_MENU' } | { type: 'CLOSE_MENU' }

export type State = {
  status: 'OPEN' | 'CLOSED'
}
