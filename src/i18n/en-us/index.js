export default {
  actions: {
    accept: 'OK',
    addToMap: 'add to map',
    apply: 'apply',
    askUpdate: 'Would you like to load the latest version?',
    askUpdateTitle: 'New version available',
    dontAsk: 'don\'t ask me again',
    close: 'close',
    cancel: 'cancel',
    copy: 'copy',
    download: 'download',
    delete: 'delete',
    discard: 'discard',
    previous: 'previous',
    pinToMap: 'pin to map',
    print: 'print',
    next: 'next',
    save: 'save',
    search: 'search',
    zoom: 'zoom',
    zoomToData: 'zoom to data',
    zoomToSelection: 'zoom to selection'
  },
  capitalize (value) {
    value = value.toString()
    return value.charAt(0).toUpperCase() + value.slice(1)
  },
  messages: {
    badPopupConfig: 'This popup is improperly configured'
  },
  names: {
    actions: 'actions',
    coords: 'coordinates',
    element: 'no elements | {count} element | {count} elements',
    keywords: 'keywords',
    layers: 'layers',
    lat: 'latitude',
    lng: 'longitude',
    message: 'message',
    metadata: 'metadata',
    opacity: 'opacity',
    options: 'options'
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

      authenticatedAs: 'Authenticated as user',
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
      colFilter: 'Filter for "{label}"',
      defaultProperties: 'Default properties of the new elements',
      deleteElements: 'Delete {elements}',
      dialogNew: 'Show form',
      dialogNewGeom: 'Show form after adding an element',
      edit: 'Edit',
      editElements: 'Edit {elements}',
      filterByPolygon: 'Polygon',
      filterByView: 'Map',
      filters: 'Filters',
      findInTable: 'Find in table',
      invalidDate: 'Invalid date',
      multipleNew: 'Add multiple elements',
      newElement: 'New element',
      qDiscardChanges: 'Are you sure you want to discard all the changes?',
      qInvalidCommit: 'Some values seem to be invalid. Would you like to save anyways?',
      requiredField: 'Required Field',
      recordsPerPage: 'Page size:',
      stopDrawing: 'Stop drawing elements',
      selectByPolygon: 'Polygon',
      selectNews: 'Select created elements',
      selection: 'Selection',
      someDeleted: 'Some of the selected elements have been marked as deleted.',
      thisDeleted: 'This element has been marked as deleted.',
      undoConfirm: 'Are you sure you want to undo the changes in this element?',
      undoConfirmN: 'Are you sure you want to undo the changes in {elements}?',
      undoElements: 'Undo {elements}',

      quitWhileSaving: 'Saving, please wait...',
      quitWithChanges: 'You have unsaved changes'
    },
    draw: {
      headerName: 'Draw',
      title: 'Draw and measue',
      help: 'Draw geometries on the map and measure its distances or areas.',

      area: 'Area',
      explanation: 'Please select geometry type, then click on the map. Double-click to finish drawing.',
      marker: 'Point',
      path: 'Path',
      save: 'Save as GeoJSON',
      stop: 'Stop drawing'
    },
    fullscreen: {
      headerName: 'Fullscreen',
      help: 'Switch to fullscreen mode.'
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

      message: '@:names.message',
      options: '@:names.options',
      openMessage: 'Open @:names.message',
      markerAtCenter: 'Marker at the center'
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
