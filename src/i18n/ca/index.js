export default {
  actions: {
    accept: 'entesos',
    addToMap: 'afegeix al mapa',
    apply: 'aplica',
    askUpdate: 'Voldries carregar la última versió?',
    askUpdateTitle: 'Nova versió disponible',
    dontAsk: 'no m\'ho preguntis més',
    download: 'descarrega',
    cancel: 'cancel·la',
    close: 'tanca',
    copy: 'copia',
    delete: 'elimina',
    discard: 'descarta',
    previous: 'anterior',
    pinToMap: 'fixa al mapa',
    print: 'imprimeix',
    next: 'següent',
    save: 'guarda',
    search: 'cerca',
    zoom: 'fes zoom',
    zoomToData: 'fes zoom a les dades',
    zoomToSelection: 'fes zoom a la selecció'
  },
  capitalize (value) {
    value = value.toString()
    return value.charAt(0).toUpperCase() + value.slice(1)
  },
  messages: {
    badPopupConfig: 'Error al llegir la configuració'
  },
  names: {
    actions: 'accions',
    coords: 'coordenades',
    element: 'cap element | {count} element | {count} elements',
    keywords: 'paraules clau',
    layers: 'capes',
    lat: 'latitud',
    lng: 'longitud',
    legend: 'llegenda',
    message: 'missatge',
    metadata: 'metadades',
    opacity: 'opacitat',
    options: 'opcions'
  },
  states: {
    empty: 'buit',
    loading: 'carregant',
    new: 'nou'
  },
  tools: {
    auth: {
      headerName: 'Iniciar sessió',
      title: 'Autenticació d\'usuari',
      help: 'Inicieu sessió amb les vostres credencials.',

      authenticatedAs: 'Autenticat com a usuari',
      closeWindow: 'Tancar finestra',
      invalidCredentials: 'L\'usuari i/o la contrasenya no són vàlids',
      logIn: 'Iniciar sessió',
      loginCodeError: 'L\'inici de sessió ha fallat',
      loginCodeOk: 'Inici de sessió correcte, podeu tancar la finestra.',
      logOut: 'Tancar sessió',
      password: 'Contrasenya',
      pleaseLogin: 'Si us plau cliqueu el següent botó per autenticar-vos.',
      username: 'Usuari'
    },
    cancelPrint: { headerName: 'Cancel·la' },
    catalog: {
      headerName: 'Catàleg',
      title: 'Catàleg',
      help: 'Veure els conjunts de dades organitzats per categories.',

      noItems: 'No s\'han trobat element en aquesta categoria'
    },
    contact: {
      headerName: 'Contacte',
      help: 'Dades de contacte per si trobeu algun error o problema.'
    },
    data: {
      headerName: 'Dades',
      title: 'Capa de dades',
      help: 'Visualitza i edita taules de la base de dades.',

      allDeleted: 'Tots els elements seleccionats estan marcats per ser eliminats.',
      changedLeaveTitle: 'Marxant sense guardar',
      changedLeaveMsg: 'Podeu tornar més tard per guardar-ho o continuar editant',
      colFilter: 'Filtrar per "{label}"',
      defaultProperties: 'Propietats per defecte dels nous elements',
      deleteElements: 'Elimina {elements}',
      dialogNew: 'Mostrar formulari',
      dialogNewGeom: 'Mostrar formulari després d\'afegir la geometria',
      edit: 'Edita',
      editElements: 'Edita {elements}',
      editing1: 'Editant element {index} de {total}',
      editingN: 'Editant {n} elements de {total}',
      errorsLoadingSources: 'Errors al carregar les dades',
      filterByPolygon: 'Polígon',
      filterByView: 'Mapa',
      filters: 'Filtres',
      findInTable: 'Cerca a la taula',
      invalidDate: 'Data invàlida',
      multipleNew: 'Afegir varis elements',
      newElement: 'Nou element',
      qDeleteElement: 'Esteu segur d\'eliminar aquest element?',
      qDiscardChanges: 'Esteu segur de descartar tots els canvis?',
      qInvalidCommit: 'Sembla que algun valor és invalid. Voldrieu guardar igualment?',
      requiredField: 'Camp obligatori',
      recordsPerPage: 'Mida de la pàgina:',
      stopDrawing: 'Deixar de dibuixar elements',
      selectByPolygon: 'Polígon',
      selectNews: 'Seleccionar els nous elements creats',
      selection: 'Selecció',
      someDeleted: 'Alguns dels elements seleccionats estan marcats per ser eliminats.',
      thisDeleted: 'Aquest element està marcat per ser eliminat.',
      undoConfirm: 'Segur que voleu desfer els canvis d\'aquest element?',
      undoConfirmN: 'Segur que voleu desfer els canvis de {elements}?',
      undoElements: 'Desfer {elements}',

      quitWhileSaving: 'Guardant, espereu si us plau...',
      quitWithChanges: 'Teniu dades sense guardar'
    },
    draw: {
      headerName: 'Dibuixar',
      title: 'Dibuixar i mesurar',
      help: 'Dibuixar geometries sobre el mapa, mesurar-ne les distàncies i àrees.',

      area: 'Àrea',
      explanation: 'Escolliu tipus de geometria, i seguidament cliqueu el mapa. Podeu fer doble clic per acabar de dibuixar.',
      marker: 'Punt',
      path: 'Línia',
      save: 'Guarda com a GeoJSON',
      stop: 'Parar de dibuixar'
    },
    fullscreen: {
      headerName: 'Pantalla complerta',
      help: 'Canvia vista a pantalla complerta.'
    },
    help: {
      headerName: 'Ajuda',
      title: 'Ajuda',

      start: 'Començar l\'itinerari d\'ajuda'
    },
    home: {
      headerName: 'Inici',
      help: 'Recupera la vista inicial.'
    },
    print: {
      headerName: 'Impressió',
      help: 'Impressió del mapa'
    },
    printPage: { headerName: 'Imprimeix' },
    search: {
      headerName: 'Cerca',
      help: 'Feu servir la barra de cerca per trobar ràpidament el que busqueu.',

      history: 'Historial de cerca',
      instructions: 'Si us plau, escriviu quelcom per cercar',
      noResults: 'No s\'ha trobat cap resultat',
      results: 'Resultats per a {q}',
      resultsError: 'Error al cercar',
      search: 'cerca'
    },
    share: {
      headerName: 'Comparteix',
      title: 'Comparteix',
      help: 'Comparteixi el mapa actual amb les geometries que hagi dibuixat.',

      message: '@:names.message',
      options: '@:names.options',
      openMessage: 'Obrir @:names.message',
      markerAtCenter: 'Marcador al centre'
    },
    streetview: {
      headerName: 'Street View',
      title: 'Google Street View',
      help: 'Accedir a la vista de carrer de Google.',

      noDataError: 'En aquesta localització no s\'han pogut trobar dades de l\'Street View.',
      centerMap: 'Centra mapa'
    }
  },
  units: {
    meters: 'metres'
  },
  validations: {
    empty: 'Aquest valor no pot ser buit'
  },
  values: {
    empty: 'valor buit',
    false: 'cert',
    true: 'fals'
  },
  yes: 'sí',
  no: 'no'
}
