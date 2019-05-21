export class UnknownParameter extends Error {
  constructor (key) {
    super(`Trying to use the unknown parameter "${key}"`)
    this.name = 'UnknownParameter'
    this.key = key
  }
}

export class ParseError extends Error {
  constructor (type, value) {
    super(`Value "${value}" couldn't be parsed into ${type}`)
    this.name = 'ParseError'
    this.type = type
    this.value = value
  }
}

export class UnsupportedTypeError extends ParseError {
  constructor (type, value) {
    super(type, value)
    this.message += ' because its type is unsupported'
  }
}
