import colorbrewer from 'colorbrewer'
import DottedPath from 'src/lib/DottedPath'

/**
 * @babel/polyfill@^7.4.0 is supposed to include "flat", but that doesn't work of us -
 * presumably because transitive dependencies still include babel 6 and the
 * corresponding babel-polyfill package. So we include this "manual" polyfill for now.
 *
 * https://github.com/babel/babel/issues/9749
 */
function flat (arrays) {
  return [].concat.apply([], arrays)
}

export const DEFAULT_COLOR = '#9ebcda'
export const DEFAULT_COLOR_MAP = [['default', DEFAULT_COLOR]]

export const PROPERTIES_PATH = Object.freeze(new DottedPath(['feature', 'properties']))

export const COLOR_SCHEMES = flat(
  Object.entries(colorbrewer.schemeGroups).map(([ _, schemeName ]) => schemeName)
)
  .map(schemeName => {
    const groups = colorbrewer[schemeName]
    const keys = Object.keys(groups).map(v => parseInt(v, 10))
    return {
      groups,
      maxGroups: Math.max(...keys),
      minGroups: Math.min(...keys)
    }
  })
