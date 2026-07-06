// Path: src/lib/utils/menuReducer.ts

import type { Action, State } from '@types'

export function menuReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'OPEN_MENU':
      return { status: 'OPEN' }
    case 'CLOSE_MENU':
      return { status: 'CLOSED' }
    default:
      return state
  }
}
