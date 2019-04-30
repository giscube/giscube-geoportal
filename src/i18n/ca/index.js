export default {
  actions: {
    accept: 'entesos',
    addToMap: 'afageix al mapa',
    apply: 'aplica',
    cancel: 'cancel·la',
    delete: 'elimina',
    discard: 'descarta',
    print: 'imprimeix',
    save: 'guarda',
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
    element: 'cap element | {count} element | {count} elements',
    layers: 'capes',
    lat: 'latitud',
    lng: 'longitud',
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
      logIn: 'Iniciar sessió',
      loginCodeError: 'L\'inici de sessió ha fallat',
      loginCodeOk: 'Inici de sessió correcte, podeu tancar la finestra.',
      logOut: 'Tancar sessió',
      password: 'Contrasenya',
      pleaseLogin: 'Si us plau cliqueu el següent botó per autenticar-vos.',
      username: 'Usuari'
    },
    catalog: {
      headerName: 'Catàleg',
      title: 'Catàleg',

      noItems: 'No s\'han trobat element en aquesta categoria'
    },
    contact: { headerName: 'Contacte' },
    data: {
      headerName: 'Dades',
      title: 'Capa de dades',

      allDeleted: 'Alguns dels elements seleccionats estan marcats per ser eliminats.',
      colFilter: 'Filtar per "{name}"',
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
    home: { headerName: 'Inici' },
    measure: {
      headerName: 'Mesurar',
      title: 'Mesurar',

      area: 'Àrea',
      explanation: 'Escolliu tipus de mesura, i seguidament cliqueu el mapa. Podeu fer doble clic per acabar la mesura.',
      path: 'Línia',
      stop: 'Parar de mesurar'
    },
    print: { headerName: 'Impressió' },
    search: {
      headerName: 'Cerca',

      help: 'Si us plau, escriviu quelcom per cercar',
      noResults: 'No s\'ha trobat cap resultat',
      results: 'Resultats per a {q}',
      resultsError: 'Error al cercar',
      search: 'cerca'
    },
    streetview: {
      headerName: 'Street View',
      title: 'Google Street View'
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
