export default {
  actions: {
    accept: 'OK',
    addToMap: 'add to map',
    apply: 'apply',
    close: 'close',
    cancel: 'cancel',
    delete: 'delete',
    discard: 'discard',
    previous: 'previous',
    pinToMap: 'pin to map',
    print: 'print',
    next: 'next',
    save: 'save',
    search: 'search',
    zoom: 'zoom',
    zoomToData: 'zoom to data'
  },
  capitalize (value) {
    value = value.toString()
    return value.charAt(0).toUpperCase() + value.slice(1)
  },
  messages: {
    badPopupConfig: 'This popup is improperly configured'
  },
  names: {
    coords: 'coordinates',
    element: 'no elements | {count} element | {count} elements',
    keywords: 'keywords',
    layers: 'layers',
    lat: 'latitude',
    lng: 'longitude',
    metadata: 'metadata',
    opacity: 'opacity'
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

      authenticatedAs: 'Authenticated as user',
      closeWindow: 'Close window',
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

      noItems: 'No items found in this subcategory'
    },
    contact: { headerName: 'Contact' },
    data: {
      headerName: 'Data',
      title: 'Data layer',

      allDeleted: 'All the selected elements have been marked as deleted.',
      changedLeaveTitle: 'Changing tool with changes',
      changedLeaveMsg: 'You can come back later to save it or continue editing it',
      colFilter: 'Filter for "{label}"',
      defaultProperties: 'Default properties of the new elements',
      deleteElements: 'Delete {elements}',
      dialogNew: 'Show form after adding an element',
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
      stopDrawing: 'Stop drawing elements',
      selectByPolygon: 'Polygon',
      selectNews: 'Select created elements',
      selection: 'Selection',
      someDeleted: 'Some of the selected elements have been marked as deleted.',
      thisDeleted: 'This element has been marked as deleted.',
      undoConfirm: 'Are you sure you want to undo the changes in this element?',

      quitWhileSaving: 'Saving, please wait...',
      quitWithChanges: 'You have unsaved changes'
    },
    fullscreen: { headerName: 'Fullscreen' },
    help: {
      headerName: 'Help',
      title: 'Help',

      start: 'Start tour'
    },
    home: {
      headerName: 'Home'
    },
    measure: {
      headerName: 'Measure',
      title: 'Measure',

      area: 'Area',
      explanation: 'Please select measure type, then click on the map. Double-click to finish a measure.',
      path: 'Path',
      stop: 'Stop measuring'
    },
    print: { headerName: 'Print' },
    printPage: { headerName: 'Print' },
    search: {
      headerName: 'Search',

      history: 'search history',
      instructions: 'Please type something to search',
      noResults: 'No matches found',
      results: 'Results for {q}',
      resultsError: 'Error retrieving results',
      search: 'search'
    },
    share: {
      headerName: 'Share',
      title: 'Share'
    },
    streetview: {
      headerName: 'Street View',
      title: 'Google Street View'
    }
  },
  units: {
    meters: 'meters'
  },
  values: {
    empty: 'empty value',
    false: 'false',
    true: 'true'
  },
  yes: 'yes',
  no: 'no'
}
