import colorbrewer from 'colorbrewer'
import DottedPath from 'src/lib/DottedPath'

export const DEFAULT_COLOR = '#9ebcda'
export const DEFAULT_COLOR_MAP = [['default', DEFAULT_COLOR]]

export const PROPERTIES_PATH = Object.freeze(new DottedPath(['feature', 'properties']))

export const COLOR_SCHEMES = Object.entries(colorbrewer.schemeGroups)
  .map(([ _, schemeName ]) => schemeName)
  .flat()
  .map(schemeName => {
    const groups = colorbrewer[schemeName]
    const keys = Object.keys(groups).map(v => parseInt(v, 10))
    return {
      groups,
      maxGroups: Math.max(...keys),
      minGroups: Math.min(...keys)
    }
  })
