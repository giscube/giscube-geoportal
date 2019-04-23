import Vue from 'vue'
import defaults from 'lodash/defaults.js'
import omitBy from 'lodash/omitBy.js'
import template from 'lodash/template.js'
import L from './leaflet'
import IconsGenerator from 'components/icons/IconsGenerator'

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

function conformsRule (obj, op, value) {
  const type = typeof obj

  if (obj === null || obj === undefined) {
    return conformsNullRule(obj, op, value)
  } else if (type === 'string') {
    return conformsStringRule(obj, op, value)
  } else if (type === 'number') {
    return conformsNumberRule(obj, op, parseFloat(value))
  } else {
    console.warn('Unsupported obj type: ' + type)
    return false
  }
}

function makeRules (r, base, generate) {
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
        return rule.result
      }
    }
    return rules.default
  }

  return rules
}

export function makeTemplate (t) {
  if (!t) {
    return null
  }
  try {
    return template(t, {
      escape: /{([\s\S]+?)}/g,
      interpolate: null,
      evaluate: null
    })
  } catch (e) {
    return _ => { throw e }
  }
}

export default function makeGeoJsonOptions ({ style, styleRules, design }, { parent, map, popup = {}, afterEachSelect, modStyle } = {}) {
  /* popup = { componenet, propsData, onEachPopup, openCondition } */

  const isMarker = (style.shapetype === 'marker')

  let rules
  if (isMarker) {
    const base = {
      icon_type: style.icon_type === 'img' ? 'img' : 'preset',
      marker_color: style.marker_color || 'blue',
      icon: style.icon || 'fas fa-circle',
      icon_color: style.icon_color || 'white',
      size: style.size || 25
    }
    rules = makeRules(styleRules, base, style => {
      const options = {
        type: style.icon_type,
        fill: style.marker_color,
        icon: style.icon,
        color: style.icon_color,
        size: style.size
      }
      return IconsGenerator.icon(options)
    })
  } else {
    rules = makeRules(styleRules, style, style => {
      return {
        weight: style.stroke_width,
        color: style.stroke_color,
        opacity: 1,
        fillColor: style.fill_color,
        fillOpacity: style.fill_opacity,
        radius: style.shape_radius
      }
    })
  }

  // popup
  const PopupContent = popup.component && (typeof popup.component === 'object' ? Vue.extend(popup.component) : popup.component)
  const renderContents = typeof design.popup === 'function' ? design.popup : makeTemplate(design.popup)

  function createPopup (feature, layer, popupOffset) {
    const content = new PopupContent({
      parent,
      propsData: {
        ...(popup.propsData || {}),
        feature,
        renderContents
      }
    }).$mount()

    const container = L.popup({
      closeOnClick: true,
      closeOnEscapeKey: true,
      offset: popupOffset
    }, layer)
    container.setContent(content.$el)
    content.$on('updatePopupSize', _ => container.update())
    transform(popup.onEachPopup, { container, content })

    return ({ container, content })
  }

  // result
  const result = {
    onEachFeature (feature, layer) {
      let popupOffset
      if (isMarker) {
        const icon = rules.getResult(feature)
        layer.setIcon(icon)
        popupOffset = [
          0,
          -(icon.options.props.size * 1.2615068493150685 - 5) // size * (anchorRatio - (1-iconRatio)/2) - 5
        ]
      }

      let container
      let content

      // Manually handle popup visibility
      layer.on('click', ({ sourceTarget }) => {
        if (popup.openCondition && !popup.openCondition()) {
          return
        }

        if (!container) {
          ({ container, content } = createPopup(feature, layer, popupOffset))
        }

        container.update()
        const latlng = sourceTarget.getCenter ? sourceTarget.getCenter() : sourceTarget.getLatLng()
        map.openPopup(container, latlng)
      })

      layer.on('remove', _ => {
        if (container) {
          map.closePopup(container)
          container = null
        }
        if (content) {
          content.$destroy()
          content = null
        }
      })

      transform(afterEachSelect, { feature, layer })
    }
  }

  if (isMarker) {
    // Set result properties
    result.pointToLayer = (_, latlng) => L.marker(latlng)
  } else {
    // Set result properties
    result.pointToLayer = (_, latlng) => L.circleMarker(latlng)
    result.style = feature => transform(modStyle, rules.getResult(feature), feature)
  }

  return result
}
