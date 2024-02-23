import { DEFAULT_COLOR_MAP, COLOR_SCHEMES } from './constants'

export default {
  aggregated: null,
  aggregatedData: null,
  aggregatedTitle: null,
  aggregatedFields: [],
  filter: '',
  colFilters: {},
  filterPolygon: null,
  processes: {
    loading: {
      current: 0,
      total: 0
    }
  },
  byOption: null,
  by: null,
  result: null,
  palette: {
    scheme: COLOR_SCHEMES[0],
    groups: 3
  },
  legend: null,
  colorMap: new Map(DEFAULT_COLOR_MAP)
}
