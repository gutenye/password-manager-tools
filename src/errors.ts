export class AppError extends Error {
  constructor(message: string, props = {}) {
    super(message)
    this.name = this.constructor.name
    Object.assign(this, props)
  }
  toJSON() {
    return { ...this, message: this.message, stack: this.stack }
  }
}
