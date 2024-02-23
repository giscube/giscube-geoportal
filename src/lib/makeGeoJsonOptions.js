import Vue from 'vue'
import { Platform } from 'quasar'
import defaults from 'lodash/defaults.js'
import omitBy from 'lodash/omitBy.js'
import forOwn from 'lodash/forOwn.js'
import template from 'lodash/template.js'
import L from './leaflet'
import IconsGenerator from './table/geom-styles/icons/IconsGenerator'

function transform (t, value, ...args) {
  return t ? t(value, ...args) : value
}

function conformsNullRule (obj, op, value) {
  return false
}

function conformsNumberRule (obj, op, value) {
  switch (op) {
    case '=':
      return obj === value
    case '!=':
      return obj !== value
    case '>':
      return obj > value
    case '>=':
      return obj >= value
    case '<':
      return obj < value
    case '<=':
      return obj <= value
    default:
      console.warn('Unsupported operand: ' + op)
      return false
  }
}

function conformsStringRule (obj, op, value) {
  switch (op) {
    case '=':
    case '!=':
    case '>':
    case '>=':
    case '<':
    case '<=':
      return conformsNumberRule(obj.localeCompare(value), op, 0)
    default:
      console.warn('Unsupported operand: ' + op)
      return false
  }
}

function conformsBooleanRule (obj, op, value) {
  value = ['true', 't', '1', true].includes(value)
  switch (op) {
    case '=':
      return obj === value
    case '!=':
      return obj !== value
    default:
      console.warn('Unsupported boolean operand: ' + op)
      return false
  }
}

function conformsRule (obj, op, value) {
  const type = typeof obj

  if (obj === null || obj === undefined) {
    return conformsNullRule(obj, op, value)
  } else if (type === 'string') {
    return conformsStringRule(obj, op, value)
  } else if (type === 'number') {
    return conformsNumberRule(obj, op, parseFloat(value))
  } else if (type === 'boolean') {
    return conformsBooleanRule(obj, op, value)
  } else {
    console.warn('Unsupported obj type: ' + type)
    return false
  }
}

function applyFeatureStyle (feature, style) {
  const customStyle = Object.assign({}, style)
  const rxp = /{([^}]+)}/g
  for (const [keyStyle, valueStyle] of Object.entries(customStyle)) {
    if (typeof valueStyle === 'string') {
      customStyle[keyStyle] = customStyle[keyStyle].replace(rxp, m => feature.properties[m.slice(1, -1)])
    }
  }
  return customStyle
}

function makeRules (r, base, generate = (v => v)) {
  const rules = r.map(rule => {
    // const fieldName =
    const clearKeys = ['field', 'op', 'value']
    const options = defaults(omitBy(rule, (value, key) => value === null || clearKeys.includes(key)), base)
    return {
      check: feature => conformsRule(feature.properties[rule.field], rule.comparator, rule.value),
      result: transform(generate, options)
    }
  })
  rules.default = transform(generate, base)
  rules.getResult = feature => {
    for (let rule of rules) {
      if (rule.check(feature)) {
        return applyFeatureStyle(feature, rule.result)
      }
    }
    return applyFeatureStyle(feature, rules.default)
  }

  return rules
}

export function makeTemplate (t) {
  if (!t) {
    return null
  }
  try {
    const options = {}
    if (!t.includes('<%-')) {
      options.escape = /{([\s\S]+?)}/g
    }
    return template(t, options)
  } catch (e) {
    return _ => { throw e }
  }
}

function toNumber (value, d) {
  try {
    value = parseFloat(value)
    if (!isNaN(value)) {
      return value
    }
  } catch (e) {}

  return d
}

export default function makeGeoJsonOptions ({ style, styleRules, design }, { parent, map, popup = {}, afterEachSelect, modStyle, root }) {
  /* popup = { component, propsData, onEachPopup, openCondition } */
  const isMarker = (style.shapetype.toLowerCase() === 'marker')
  const isImage = (style.shapetype.toLowerCase() === 'image')
  styleRules = styleRules || []

  let rules
  if (isImage) {
    let { size, width, height } = style
    size = toNumber(size, 32)
    width = toNumber(width, size)
    height = toNumber(height, size)

    rules = makeRules(styleRules, {
      icon: style.icon,
      sizes: [width, height]
    })
  } else if (isMarker) {
    const base = {
      icon_type: style.icon_type === 'img' ? 'img' : 'preset',
      fill_color: style.fill_color || style.marker_color || 'blue',
      icon: style.icon || 'fas fa-circle',
      icon_color: style.icon_color || 'white',
      size: style.size || 34
    }
    rules = makeRules(styleRules, base, style => {
      return {
        type: style.icon_type,
        fill: style.fill_color,
        icon: style.icon,
        color: style.icon_color,
        size: style.size
      }
    })
  } else {
    rules = makeRules(styleRules, style, style => {
      return {
        bubblingMouseEvents: false,
        weight: toNumber(style.stroke_width, 1),
        color: style.stroke_color || '#ffbc40',
        opacity: toNumber(style.stroke_opacity, 1),
        fillColor: style.fill_color || '#ffa500',
        fillOpacity: toNumber(style.fill_opacity, 0.75),
        radius: toNumber(style.shape_radius, 10),
        dashArray: style.stroke_dash_array || null
      }
    })
  }

  // popup
  const PopupContent = popup.component && (typeof popup.component === 'object' ? Vue.extend(popup.component) : popup.component)
  const renderContents = design.popup && (typeof design.popup === 'function' ? design.popup : makeTemplate(design.popup))
  const renderTooltip = design.tooltip && (typeof design.tooltip === 'function' ? design.tooltip : makeTemplate(design.tooltip))

  // Setup feature to have a single popup and, if using markes, a single icon which are reused
  function prepareFeature (feature) {
    if (feature._settedUp) {
      return
    }

    Object.defineProperties(feature, {
      _settedUp: {
        configurable: false,
        enumerable: false,
        writable: false,
        value: true
      },

      _icon: {
        configurable: false,
        enumerable: false,
        writable: false,
        value: (_ => {
          if (isImage) {
            return IconsGenerator.imgIcon(rules.getResult(feature))
          } else if (isMarker) {
            return IconsGenerator.icon({
              ...rules.getResult(feature),
              status: feature.status
            })
          }
        })()
      },

      _content: {
        configurable: false,
        enumerable: false,
        writable: true
      },
      _container: {
        configurable: false,
        enumerable: false,
        writable: true
      },
      _setUpPopup: {
        configurable: false,
        enumerable: false,
        get () {
          return () => {
            if (this._content) {
              return
            }

            this._content = new PopupContent({
              parent: parent || root,
              propsData: {
                ...(popup.propsData || {}),
                feature: this,
                renderContents
              }
            }).$mount()

            const popupConfig = {
              closeOnClick: true,
              closeOnEscapeKey: true
            }
            if (isMarker) {
              popupConfig.offset = [
                0,
                -(this._icon.options.props.size * 0.9) // size * (anchorRatio - (1-iconRatio)/2) - 5
              ]
            }
            this._container = L.popup(popupConfig)
            this._container.setContent(this._content.$el)
            this._content.$on('update-popup-size', _ => this._container.update())

            transform(popup.onEachPopup, { content: this._content, container: this._container })
            this._container.on('add', (...args) => this._content.onOpen && this._content.onOpen(...args))
            this._container.on('remove', (...args) => this._content.onClose && this._content.onClose(...args))
          }
        }
      },
      _openDialog: {
        configurable: false,
        enumerable: false,
        get () {
          return () => {
            root.$store.dispatch('layout/createDialog', {
              root,
              ...(popup.propsData || {}),
              feature: this,
              renderContents,
              component: popup.dialog
            })
          }
        }
      },

      _tooltip: {
        configurable: false,
        enumerable: false,
        writable: false,
        value: (_ => {
          if (!renderTooltip) {
            return
          }

          try {
            const r = renderTooltip({ ...feature.properties, obj: feature })
            if (r) {
              const el = document.createElement('div')
              el.innerHTML = r
              return el
            }
          } catch (e) {
            // Only show it in cansole (do not use except)
            console.error(e)
          }
        })()
      },

      assignLayer: {
        configurable: false,
        enumerable: false,
        get () {
          return layer => {
            layer.options.interactive = design.interactive

            if (isImage || isMarker) {
              layer.setIcon(this._icon)
            }

            if (this._tooltip) {
              layer.bindTooltip(this._tooltip, {
                sticky: true
              })
            }

            layer.on('click', ({ latlng, sourceTarget }) => {
              if (popup.openCondition && !popup.openCondition()) {
                return
              }

              if (Platform.is.mobile) {
                this._openDialog()
              } else {
                this._setUpPopup()

                let anchor = latlng
                if (sourceTarget instanceof L.Marker || sourceTarget instanceof L.CircleMarker) {
                  anchor = sourceTarget.getCenter ? sourceTarget.getCenter() : sourceTarget.getLatLng()
                }
                map.openPopup(this._container, anchor)
              }
            })

            layer.on('remove', _ => {
              if (this._container) {
                map.closePopup(this._container)
                this._container = void 0
              }
              if (this._content) {
                this._content.$destroy()
                this._content = void 0
              }
            })

            transform(afterEachSelect, { feature, layer })
          }
        }
      }
    })
  }

  // result
  const result = {
    onEachFeature (feature, layer) {
      prepareFeature(feature)
      if ('_layers' in layer) {
        forOwn(layer._layers, innerLayer => {
          feature.assignLayer(innerLayer)
        })
      } else {
        feature.assignLayer(layer)
      }
    }
  }

  if (isImage || isMarker) {
    // Set result properties
    result.pointToLayer = (_, latlng) => L.marker(latlng)
  } else {
    // Set result properties
    result.pointToLayer = (_, latlng) => L.circleMarker(latlng, { bubblingMouseEvents: false })
    result.style = feature => transform(modStyle, rules.getResult(feature), feature)
  }

  return result
}
