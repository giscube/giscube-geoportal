import AppGeoportal from './App'
import AppHeader from 'components/AppHeader'
import AppFooter from 'components/AppFooter'
import AuthPanel from 'components/AuthPanel'
import GeoportalMap from 'components/GeoportalMap'
import GiscubeLayout from 'layouts/GiscubeLayout'
import CatalogPanel from 'components/CatalogPanel'
import CatalogResult from 'components/CatalogResult'
import CoordsPanel from 'components/CoordsPanel'
import DataPanel from 'components/data-layer/DataPanel'
import Sidebar from 'components/Sidebar'
import DrawPanel from 'components/DrawPanel'
import PlacePanel from 'components/PlacePanel'
import PlacePanelStrategy from 'components/PlacePanelStrategy'
import SearchBar from 'components/SearchBar'
import SearchPanel from 'components/SearchPanel'
import SharePanel from 'components/SharePanel'
import ShareQuery from 'src/lib/shareQuery'
import QueryOnClick from 'components/QueryOnClick'
import LayersControl from 'components/LayersControl'
import HelpPanel from 'components/HelpPanel'
import StatisticsPanel from 'components/statistics/Panel'
import StreetViewPanel from 'components/StreetViewPanel'
import geoportalBoot from './boot'
import store from './store/index.js'
import config from './config/lib.js'
import { except as exceptLib } from './lib/except.js'
import i18n from './i18n/index.js'
import Search from './lib/search'

const boot = geoportalBoot.setup

// Importacions generiques
import lib from './lib/'
import components from './components'

export {
  AppGeoportal,
  AppHeader,
  AppFooter,
  AuthPanel,
  CatalogPanel,
  CatalogResult,
  CoordsPanel,
  DataPanel,
  GeoportalMap,
  GiscubeLayout,
  Sidebar,
  DrawPanel,
  PlacePanel,
  PlacePanelStrategy,
  SearchBar,
  SearchPanel,
  SharePanel,
  ShareQuery,
  QueryOnClick,
  LayersControl,
  HelpPanel,
  StatisticsPanel,
  StreetViewPanel,
  boot,
  store,
  config,
  exceptLib,
  i18n,
  Search,
  components,
  lib
}
