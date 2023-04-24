import { defaultsDeep } from 'lodash'

import except from '../../lib/except'
import { enumerate } from '../../lib/itertools'
import { createExternalLayer, createLayer, makeBaseLayer } from '../../lib/geomUtils'
import validate from '../../lib/validate'
import { isVoid, reverse, unique } from '../../lib/utils'
import ShareQuery from '../../lib/shareQuery'

import { LAYER_TEMPLATE, LAYER_TEMPLATE_DEFAULTS } from './constants'

export function setMap (context, value) {
  context.dispatch('stopDrawing')

  const sharedGroup = context.state.shared
  const overlaysGroup = context.state.layers._overlaysGroup
  const resultLayer = context.rootState.search.resultsLayer

  sharedGroup.remove()
  overlaysGroup.remove()
  resultLayer.remove()

  if (value) {
    sharedGroup.addTo(value)
    overlaysGroup.addTo(value)
    resultLayer.addTo(value)
  }

  context.commit('mapObject', value)
}

export function invalidateOffset (context) {
  const padding = context.rootGetters['layout/hiddenMap']
  context.state.mapObject.setGlobalPadding(padding)
}

export function invalidateSize (context) {
  context.state.mapObject.invalidateSize()
}

export function setBaseLayer (context, value) {
  // Remove old base layer
  const oldValue = context.state.layers.baseLayer
  if (oldValue) {
    if (oldValue.layer) {
      oldValue.layer.remove()
    }
    oldValue.layer = null
    context.commit('_baseLayer', null)
  }

  // Add new base layer
  const baseLayer = this.$config.basemaps[value]
  if (baseLayer) {
    const map = context.state.mapObject
    const layer = makeBaseLayer(baseLayer, this)
    if (map && layer) {
      layer.setZIndex(0)
      map.addLayer(layer)
      const minZoom = baseLayer.minZoom || 0
      map.setMinZoom(minZoom)
      map.setMaxZoom(baseLayer.maxZoom)
    }
    context.commit('_baseLayer', baseLayer)
  }
}

export function setDefaultBaseLayer (context) {
  let selected = ShareQuery.extract(this.$router.currentRoute.query, 'b')
  if (selected === void 0) {
    selected = this.$config.basemaps.findIndex(basemap => basemap.default)
  }

  if (!selected || selected < 0) {
    selected = 0
  }
  context.dispatch('setBaseLayer', selected)
}

export function setOverlays (context, overlays) {
  context.commit('overlays', overlays)
  context.dispatch('reorderOverlay')
}

export function addOverlay (context, { id, layer, layerType, name, opacity, options, getfeatureinfoSupport }) {
  const overlays = context.state.layers.overlays
  const overlaysGroup = context.state.layers._overlaysGroup
  const popup = options?.popup
  if (id === void 0) {
    id = unique()
  }

  const existing = overlays.find(o => layer === o.layer || id === o.id || (id.equals && id.equals(o.id)))
  if (existing) {
    if (name) {
      existing.name = name
    }
    if (opacity === void 0) {
      opacity = existing.opacity
    }

    if (existing.layer !== layer) {
      existing.setVisible(false)
      existing.layer = layer
      existing.layerType = layerType
    }

    existing.setOpacity(opacity)
    existing.setVisible(true)
  } else {
    const overlay = {
      id,
      name,
      layer,
      layerType,
      options,
      getfeatureinfoSupport,
      popup,
      visible: false,
      setVisible (value) {
        if (typeof value !== 'boolean') {
          throw new TypeError('Invalid param')
        }

        if (value === this.visible) {
          return
        }

        this.layer.remove()
        if (value) {
          overlaysGroup.addLayer(this.layer)
        }
        this.visible = value
      },
      opacity: 1,
      setOpacity (value) {
        if (this.layer.setOpacity) {
          this.layer.setOpacity(value)
          this.opacity = value
        }
      }
    }
    if (!isVoid(opacity)) {
      overlay.setOpacity(opacity)
    }
    overlay.setVisible(true)
    overlays.unshift(overlay)

    context.dispatch('reorderOverlay')
  }
}

export function removeOverlay (context, overlay) {
  const overlays = context.state.layers.overlays
  const i = overlays.indexOf(overlay)
  if (i >= 0) {
    overlays[i].layer.remove()
    overlays.splice(i, 1)
  }
}

export function removeOverlayById (context, id) {
  const overlays = context.state.layers.overlays
  const i = overlays.findIndex(overlay => overlay.id.plainRef === id.plainRef)
  if (i >= 0) {
    overlays[i].layer.remove()
    overlays.splice(i, 1)
  }
}

export function removeOverlayByLayer (context, layer) {
  const overlays = context.state.layers.overlays
  const i = overlays.findIndex(overlay => overlay.layer === layer)
  if (i >= 0) {
    layer.remove()
    overlays.splice(i, 1)
  }
}

export function reorderOverlay (context) {
  const overlays = context.state.layers.overlays
  for (let [i, overlay] of enumerate(reverse(overlays))) {
    if (overlay.layer.setZIndex) {
      overlay.layer.setZIndex(i + 2)
    } else if (overlay.layer.setZIndexOffset) {
      overlay.layer.setZIndexOffset(i + 2)
    }
  }
}

export function draw (context, type) {
  const oldTool = context.rootState.root.currentTool
  context.commit('setCurrentTool', 'draw', { root: true })

  const promise = createLayer({ map: context.state.mapObject, type: type.toLowerCase() })
  promise.then(() => {}, () => {}).then(() => {
    context.commit('setCurrentTool', oldTool, { root: true })
  })
  return promise
}

export function stopDrawing (context) {
  if (context.state.mapObject && context.state.mapObject.editTools.drawing()) {
    context.state.mapObject.editTools.stopDrawing()
  }
}

export function disableDoubleClickZoom (context) {
  context.state.mapObject.doubleClickZoom.disable()
}

export function enableDoubleClickZoom (context) {
  context.state.mapObject.doubleClickZoom.enable()
}

export async function addLayer (context, { id, layerDescriptor, title, options, metaOptions, auth = false, filters }) {
  const map = context.state.mapObject
  const headers = auth ? context.rootGetters['auth/headers'] : void 0
  try {
    const { type, layer } = await createExternalLayer({ layerDescriptor, title, options, map, metaOptions, headers, filters })
    if (!type || !layer) {
      return false
    }
    map.addLayer(layer)

    const name = type === 'WMS' ? layerDescriptor.title : title
    const getfeatureinfoSupport = layerDescriptor.giscube && layerDescriptor.giscube.getfeatureinfo_support
    context.dispatch('addOverlay', { id, layer, layerType: type, name, options, getfeatureinfoSupport })
    return true
  } catch (e) {
    if (e) {
      except(e)
    }
    return false
  }
}

export function addSharedLayer (context, layer) {
  context.state.shared.addLayer(layer)
}

export function addDefaultLayers (context) {
  const layers = this.$config.defaultLayers
  if (!layers || layers.length <= 0) {
    return
  }
  layers.forEach(layer => {
    setTimeout(() => {
      const l = defaultsDeep(layer, LAYER_TEMPLATE_DEFAULTS)
      validate(l, LAYER_TEMPLATE)
      context.dispatch('addLayer', layer)
    }, 0)
  })
}
