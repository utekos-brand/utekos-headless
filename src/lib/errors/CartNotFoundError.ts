// Path: src/lib/errors/CartNotFoundError.ts

export class CartNotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CartNotFoundError'
  }
}
