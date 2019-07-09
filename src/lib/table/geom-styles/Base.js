import DottedPath from 'src/lib/DottedPath'
import StyleRule from './StyleRule'
import { tryToNumber } from './utils'

// Parses a value into a getter function and the dependencies that it will used
//   by it
//
// Params:
//   - value: value to parse. May contain properties references. eg:
//       * 1
//       * fas fa-cross
//       * #FFFFFF
//       * fas fa-{icon}
//
// Returns: [getter, dependencies]
//   - getter (row => literal): returns a literal with a given row
//   - dependencies (array): Array of the key values used by the getter
//
function makeGetter (value) {
  if (value === void 0 || value === null) {
    return [ value, [] ]
  } else if (typeof value !== 'string') {
    return [ () => value, [] ]
  }

  // Only string may contain properties references
  const re = /{([^}]+)}/g
  const parts = []
  const deps = []

  let part
  let last = 0
  while ((part = re.exec(value)) !== null) {
    const v = value.substring(last, part.index)
    if (v) {
      parts.push(v)
    }

    if (part[1]) {
      const v = new DottedPath(part[1])
      parts.push(v)
      deps.push(v.parts[0])
    }

    last = re.lastIndex
  }

  {
    const v = value.substring(last)
    if (v) {
      parts.push(v)
    }
  }

  for (let i = parts.length - 2; i >= 0; --i) {
    if (typeof parts[i] === 'string' && typeof parts[i + 1] === 'string') {
      parts.splice(i, 2, parts[i] + parts[i + 1])
    }
  }

  let func
  if (parts.length === 1 && typeof parts[0] === 'string') {
    func = () => tryToNumber(parts[0])
  } else {
    func = row => {
      let result = ''
      parts.forEach(part => {
        if (typeof part === 'string') {
          result += part
        } else {
          result += part.extractFrom(row.properties)
        }
      })
      return tryToNumber(result)
    }
  }

  return [ func, deps ]
}

export default class GeomStyle {
  constructor (info) {
    const baseStyle = this.makeStyle(info.style)
    const rules = this.makeRules(info.style_rules)

    this.defaultStyle = this.getDefaultStyle()
    this.baseStyle = baseStyle.style
    this.rules = rules.rules
    this.deps = new Set([ ...baseStyle.deps, ...rules.deps ])
  }

  generate (row) {
    const result = {}
    const conformingRule = this.rules.find(rule => rule.check(row))
    Object.keys(this.defaultStyle).forEach(key => {
      const func = (conformingRule && conformingRule.style[key]) || this.baseStyle[key]
      result[key] = func ? func(row) : this.defaultStyle[key]
    })
    return result
  }

  makeStyle (styleDict) {
    const style = this.fromInfo(styleDict)
    const deps = new Set()
    Object.keys(style).forEach(key => {
      const [ getter, deps2 ] = makeGetter(style[key])
      style[key] = getter
      deps2.forEach(d => deps.add(d))
    })
    return { style, deps }
  }

  makeRules (styleRules) {
    const _deps = new Set()
    const rules = styleRules.map(rule => {
      const { style, deps } = this.makeStyle(rule)
      deps.forEach(d => _deps.add(d))
      return new StyleRule(rule.field, rule.comparator, rule.value, style)
    })

    return { deps: _deps, rules }
  }

  apply (row) {
    if (row.layer) {
      this._apply(row)
    }
  }

  get reactive () {
    return false
  }
}
