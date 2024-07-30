export default {
  actions: {
    accept: 'OK',
    addToMap: 'add to map',
    apply: 'apply',
    askUpdate: 'Would you like to load the latest version?',
    askUpdateTitle: 'New version available',
    dontAsk: 'don\'t ask me again',
    clip: 'clip',
    close: 'close',
    cancel: 'cancel',
    copy: 'copy',
    download: 'download',
    delete: 'delete',
    discard: 'discard',
    explore: 'explore',
    previous: 'previous',
    pinToMap: 'pin to map',
    print: 'print',
    next: 'next',
    save: 'save',
    search: 'search',
    showTags: 'mostrar etiquetes',
    tooltip: 'show/hide tooltips',
    zoom: 'zoom',
    zoomToData: 'zoom to data',
    zoomToSelection: 'zoom to selection'
  },
  capitalize (value) {
    value = value.toString()
    return value.charAt(0).toUpperCase() + value.slice(1)
  },
  cmp: {
    equals: 'equals to',
    from: 'from',
    lessEqual: 'less than or equal to',
    less: 'less than',
    moreEqual: 'more than or equal to',
    more: 'more than',
    to: 'to'
  },
  messages: {
    badPopupConfig: 'This popup is improperly configured'
  },
  metadata: {
    date: 'date',
    summary: 'summary',
    category: 'category',
    language: 'language',
    information: 'information',
    provider_web: 'provider\'s web',
    provider_name: 'provider\'s name',
    provider_email: 'provider\'s mail'
  },
  names: {
    actions: 'actions',
    coords: 'coordinates',
    data: 'data',
    description: 'description',
    downloads: 'downloads',
    element: 'no elements | {count} element | {count} elements',
    horizontally: 'horizontally',
    info: 'info',
    keywords: 'keywords',
    layers: 'layers',
    layerInfo: 'informació de la capa',
    permissions: 'permissions',
    lat: 'latitude',
    lng: 'longitude',
    legend: 'legend',
    message: 'message',
    metadata: 'metadata',
    publicLayer: 'public layer',
    privateLayer: 'private layer',
    opacity: 'opacity',
    options: 'options',
    searchResult: 'search result',
    statistics: 'statistics',
    type: 'type',
    utilities: 'utilities',
    vertically: 'vertically'
  },
  states: {
    empty: 'empty',
    loading: 'loading',
    new: 'new'
  },
  tools: {
    auth: {
      headerName: 'Log in',
      title: 'User authentication',
      help: 'Log in using your credentials.',

      adminUrl: 'Manage',
      authenticatedAs: 'Authenticated as user',
      changePassword: 'Change password',
      closeWindow: 'Close window',
      invalidCredentials: 'Invalid credentials',
      logIn: 'Log in',
      loginCodeError: 'Login failed',
      loginCodeOk: 'Login succeeded, you can close this window',
      logOut: 'Log out',
      password: 'Password',
      pleaseLogin: 'Please use the button below to authenticate.',
      username: 'Username'
    },
    cancelPrint: { headerName: 'Cancel' },
    catalog: {
      headerName: 'Catalog',
      title: 'Catalog',
      help: 'View data organized in categories.',

      noItems: 'No items found in this subcategory'
    },
    catalogTree: {
      headerName: 'Catalog',
      title: 'Catalog',
      help: 'View data organized in categories.',
      filter: 'Filter',

      noItems: 'No items found in this subcategory'
    },
    cleanMap: {
      headerName: 'Clean mapa',
      title: 'Clean mapa'
    },
    contact: {
      headerName: 'Contact',
      help: 'Contact to report to if you find any error or problem.'
    },
    data: {
      headerName: 'Data',
      title: 'Data layer',
      help: 'View and edit database tables.',

      allDeleted: 'All the selected elements have been marked as deleted.',
      changedLeaveTitle: 'Changing tool with changes',
      changedLeaveMsg: 'You can come back later to save it or continue editing it',
      changesSaved: 'Changes saved',
      colFilter: 'Filter for "{label}"',
      defaultProperties: 'Default properties of the new elements',
      deleteElements: 'Delete {elements}',
      dialogNew: 'Show form',
      dialogNewGeom: 'Show form after adding an element',
      edit: 'Edit',
      editElements: 'Edit {elements}',
      errorsLoadingSources: 'Errors while loading the data sources',
      filterByPolygon: 'Polygon',
      filterByView: 'Map',
      filters: 'Filters',
      findInTable: 'Find in table',
      invalidDate: 'Invalid date',
      multipleNew: 'Add multiple elements',
      newElement: 'New element',
      qDeleteElement: 'Are you sure you want to delete this element?',
      qDiscardChanges: 'Are you sure you want to discard all the changes?',
      qInvalidCommit: 'Some values seem to be invalid. Would you like to save anyways?',
      requiredField: 'Required Field',
      recordsPerPage: 'Page size:',
      savingChanges: 'Saving changes',
      selectByPolygon: 'Polygon',
      selectNews: 'Select created elements',
      selection: 'Selection',
      someDeleted: 'Some of the selected elements have been marked as deleted.',
      stopDrawing: 'Stop drawing elements',
      thisDeleted: 'This element has been marked as deleted.',
      undoConfirm: 'Are you sure you want to undo the changes in this element?',
      undoConfirmN: 'Are you sure you want to undo the changes in {elements}?',
      undoElements: 'Undo {elements}',

      quitWhileSaving: 'Saving, please wait...',
      quitWithChanges: 'You have unsaved changes'
    },
    draw: {
      headerName: 'Draw',
      title: 'Draw and measure',
      help: 'Draw geometries on the map and measure its distances or areas.',

      area: 'Area',
      circle: 'Circle',
      drawMulti: 'Continue drawing',
      drawMultiCaption: 'Allow drawing new measurements when finishing the element',
      explanation: 'Please select geometry type, then click on the map. Double-click to finish drawing.',
      explanationCircle: 'Click onto the map to draw a circle. Define a radius and click or click and drag.',
      marker: 'Point',
      path: 'Path',
      radius: 'Radius',
      save: 'Save as GeoJSON',
      stop: 'Stop drawing'
    },
    fullscreen: {
      headerName: 'Fullscreen',
      help: 'Switch to fullscreen mode.'
    },
    heatMap: {
      defaultOption: 'Default (geometry)',
      blur: 'Blur',
      intensity: 'Intensity',
      radius: 'Radius',
      title: 'Heat map'
    },
    help: {
      headerName: 'Help',
      title: 'Help',

      start: 'Start tour'
    },
    home: {
      headerName: 'Home',
      help: 'Go to the inital map view.'
    },
    incidence: {
      headerName: 'Incidence',
      title: 'Create and send incidence',
      help: 'Draw geometries on the map and measure its distances or areas.',

      titleInput: 'Title',
      descriptionInput: 'Description',
      emailInput: 'Email',
      emailErrorMessage: 'Please enter a valid email address. (name@example.com)',
      post: 'Post',
      message: 'Incidence sent',
      errorMessage: 'Something went wrong while sending the incidence',

      area: 'Area',
      delete: 'Delete geometries',
      marker: 'Point',
      stop: 'Stop drawing'
    },
    print: {
      headerName: 'Print',
      help: 'Print the map.'
    },
    printPage: { headerName: 'Print' },
    search: {
      headerName: 'Search',
      help: 'Use the search bar to find what you\'re looking for quickly.',

      history: 'search history',
      instructions: 'Please type something to search',
      noResults: 'No matches found',
      results: 'Results for {q}',
      resultsError: 'Error retrieving results',
      search: 'search'
    },
    share: {
      headerName: 'Share',
      title: 'Share',
      help: 'Share map with the drawn geometries.',

      catalogState: 'Catalog state',
      message: '@:names.message',
      options: '@:names.options',
      openMessage: 'Open @:names.message',
      markerAtCenter: 'Marker at the center',
      simpleView: 'Simple view',
      hideLayersControl: 'Hide layers control',
      selectLayer: 'Select one layer',
      openLayerPanel: 'Open layer panel'
    },
    statistics: {
      columnCount: 'Count',
      columnColor: 'Color',
      groupBy: 'Group by',
      palette: 'Palette',
      tabData: 'Data',
      tabResults: 'Results',
      title: 'Statistics',
      titleFor: '@:tools.statistics.title for {layerName}'
    },
    streetview: {
      headerName: 'Street View',
      title: 'Google Street View',
      help: 'Open panel with Google Street View.',

      noDataError: 'Street View data not found for this location.',
      centerMap: 'Center map'
    }
  },
  units: {
    meters: 'meters'
  },
  validations: {
    empty: 'This field cannot be empty'
  },
  values: {
    empty: 'empty value',
    false: 'false',
    true: 'true'
  },
  yes: 'yes',
  no: 'no'
}
