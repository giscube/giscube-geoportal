export default {
  actions: {
    accept: 'entesos',
    addToMap: 'afegeix al mapa',
    apply: 'aplica',
    cancel: 'cancel·la',
    close: 'tanca',
    delete: 'elimina',
    discard: 'descarta',
    previous: 'anterior',
    pinToMap: 'fixa al mapa',
    print: 'imprimeix',
    next: 'següent',
    save: 'guarda',
    search: 'cerca',
    zoom: 'fes zoom',
    zoomToData: 'fes zoom a les dades'
  },
  capitalize (value) {
    value = value.toString()
    return value.charAt(0).toUpperCase() + value.slice(1)
  },
  messages: {
    badPopupConfig: 'Error al llegir la configuració'
  },
  names: {
    coords: 'coordenades',
    element: 'cap element | {count} element | {count} elements',
    keywords: 'paraules clau',
    layers: 'capes',
    lat: 'latitud',
    lng: 'longitud',
    metadata: 'metadades',
    opacity: 'opacitat'
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

      authenticatedAs: 'Autenticat com a usuari',
      closeWindow: 'Tancar finestra',
      changedLeaveTitle: 'Marxant sense guardar',
      changedLeaveMsg: 'Podeu tornar més tard per guardar-ho o continuar editant',
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

      allDeleted: 'Alguns dels elements seleccionats estan marcats per ser eliminats.',
      colFilter: 'Filtrar per "{label}"',
      defaultProperties: 'Propietats per defecte dels nous elements',
      deleteElements: 'Elimina {elements}',
      dialogNew: 'Mostrar formulari després d\'afegir la geometria',
      edit: 'Edita',
      editElements: 'Edita {elements}',
      filterByPolygon: 'Polígon',
      filterByView: 'Mapa',
      filters: 'Filtres',
      findInTable: 'Cerca a la taula',
      multipleNew: 'Afegir varis elements',
      newElement: 'Nou element',
      qDiscardChanges: 'Esteu segur de descartar tots els canvis?',
      qInvalidCommit: 'Sembla que algun valor és invalid. Voldrieu guardar igualment?',
      requiredField: 'Camp obligatori',
      stopDrawing: 'Deixar de dibuixar elements',
      selectByPolygon: 'Polígon',
      selectNews: 'Seleccionar els nous elements creats',
      selection: 'Selecció',
      someDeleted: 'Tots els elements seleccionats estan marcats per ser eliminats.',
      thisDeleted: 'Aquest element està marcat per ser eliminat.',
      undoConfirm: 'Segur que voleu desfer els canvis d\'aquest element?'
    },
    fullscreen: { headerName: 'Pantalla complerta' },
    help: {
      headerName: 'Ajuda',
      title: 'Ajuda',

      start: 'Començar l\'itinerari d\'ajuda'
    },
    home: {
      headerName: 'Inici',
      help: 'Recupera la vista inicial.'
    },
    measure: {
      headerName: 'Mesurar',
      title: 'Mesurar',
      help: 'Mesurar distàncies i àrees',

      area: 'Àrea',
      explanation: 'Escolliu tipus de mesura, i seguidament cliqueu el mapa. Podeu fer doble clic per acabar la mesura.',
      path: 'Línia',
      stop: 'Parar de mesurar'
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
    streetview: {
      headerName: 'Street View',
      title: 'Google Street View',
      help: 'Accedir a la vista de carrer de Google'
    }
  },
  units: {
    meters: 'metres'
  },
  values: {
    empty: 'valor buit',
    false: 'cert',
    true: 'fals'
  },
  yes: 'sí',
  no: 'no'
}
