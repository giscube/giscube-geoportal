export default {
  actions: {
    accept: 'OK',
    addToMap: 'añade al mapa',
    apply: 'aplica',
    askUpdate: '¿Querrías cargar la última versión?',
    askUpdateTitle: 'Nueva versión disponible',
    dontAsk: 'no me lo preguntes más',
    download: 'descarga',
    cancel: 'cancela',
    clip: 'recorta',
    close: 'cierra',
    copy: 'copia',
    delete: 'elimina',
    discard: 'descarta',
    explore: 'explora',
    previous: 'anterior',
    pinToMap: 'fijar en el mapa',
    print: 'imprime',
    next: 'siguiente',
    save: 'guarda',
    search: 'busca',
    showTags: 'mostrar etiquetas',
    tooltip: 'enseñar/esconder etiquetas',
    zoom: 'haz zoom',
    zoomToData: 'haz zoom a los datos',
    zoomToSelection: 'haz zoom a la selección'
  },
  capitalize (value) {
    value = value.toString()
    return value.charAt(0).toUpperCase() + value.slice(1)
  },
  cmp: {
    equals: 'igual que',
    from: 'de',
    lessEqual: 'más pequeño o igual que',
    less: 'més pequeño que',
    moreEqual: 'más grande o igual que',
    more: 'más grande que',
    to: 'a'
  },
  messages: {
    badPopupConfig: 'Error al leer la configuración'
  },
  metadata: {
    date: 'fecha',
    summary: 'resumen',
    category: 'categoría',
    language: 'idioma',
    information: 'información',
    provider_web: 'web del proveedor',
    provider_name: 'nombre del proveedor',
    provider_email: 'mail del proveedor'
  },
  names: {
    actions: 'acciones',
    coords: 'coordenadas',
    data: 'datos',
    description: 'descripción',
    downloads: 'descargas',
    element: 'ningún elemento | {count} elemento | {count} elementos',
    horizontally: 'horizontalmente',
    info: 'info',
    keywords: 'búsquedas relacionadas',
    layers: 'capas',
    layerInfo: 'informació de la capa',
    permissions: 'permisos',
    lat: 'latitud',
    lng: 'longitud',
    legend: 'leyenda',
    message: 'mensaje',
    metadata: 'metadatos',
    publicLayer: 'capa pública',
    privateLayer: 'capa privada',
    opacity: 'opacidad',
    options: 'opciones',
    searchResult: 'resultado de la búsqueda',
    statistics: 'estadística',
    type: 'tipos',
    url: 'Enlace geoservicio',
    utilities: 'utilidades',
    vertically: 'verticalmente'
  },
  states: {
    empty: 'vacío',
    loading: 'cargando',
    new: 'nuevo'
  },
  tools: {
    auth: {
      headerName: 'Iniciar sessión',
      title: 'Autenticación de usuario',
      help: 'Iniciad sesión con vuestras credenciales.',

      adminUrl: 'Administrar',
      authenticatedAs: 'Autentificado como usuario',
      changePassword: 'Cambiar contraseña',
      closeWindow: 'Cerrar ventana',
      invalidCredentials: 'El usuario y/o la contraseña no son válidos',
      logIn: 'Iniciar sesión',
      loginCodeError: 'El inicio de sesión ha fallado',
      loginCodeOk: 'Inicio de sesión correcto, podéis cerrar la ventana',
      logOut: 'Cerrar sesión',
      password: 'Contraseña',
      pleaseLogin: 'Por favor clicad el siguiente botón para autenticaos.',
      username: 'Usuario'
    },
    cancelPrint: { headerName: 'Cancela' },
    catalog: {
      headerName: 'Catálogo',
      title: 'Catálogo',
      help: 'Ver los conjuntos de datos organizados por categorías.',

      noItems: 'No se han encontrado elementos en esta categoría'
    },
    catalogTree: {
      headerName: 'Catálogo',
      title: 'Catálogo',
      searchTitle: 'Capa del catálogo',
      help: 'Ver los conjuntos de datos organizados por categorías.',
      filter: 'Filtro',

      noItems: 'No se han encontrado elementos en esta categoría'
    },
    cleanMap: {
      headerName: 'Limpiar mapa',
      title: 'Limpiar mapa'
    },
    contact: {
      headerName: 'Contacto',
      help: 'Datos de contacto por si encontráis algún error o problema'
    },
    data: {
      headerName: 'Datos',
      title: 'Capa de datos',
      help: 'Visualiza y edita las tablas de la base de datos.',

      allDeleted: 'Todos los elementos seleccionados están marcados para ser eliminados.',
      changedLeaveTitle: 'Saliendo sin guardar',
      changedLeaveMsg: 'Podéis volver más tarde para guardarlo o continuar editando',
      changesSaved: 'Cambios guardados',
      colFilter: 'Filtrar por "{label}"',
      defaultProperties: 'Propiedades por defecto de los nuevos elementos',
      deleteElements: 'Elimina {elements}',
      dialogNew: 'Muestra formulario',
      dialogNewGeom: 'Muestra formulario después de añadir la geometría',
      edit: 'Edita',
      editElements: 'Edita {elements}',
      editing1: 'Editando elemento {index} de {total}',
      editingN: 'Editando {n} elementos de {total}',
      errorsLoadingSources: 'Errores al cargar los datos',
      filterByPolygon: 'Polígono',
      filterByView: 'Mapa',
      filters: 'Filtros',
      findInTable: 'Busca en la tabla',
      invalidDate: 'Datos inválidos',
      multipleNew: 'Añadir varios elementos',
      newElement: 'Nuevo elemento',
      qDeleteElement: 'Estás seguro de eliminar este elemento?',
      qDiscardChanges: '¿Estás seguro?',
      qInvalidCommit: 'Parece que algún valor es inválido. ¿Queréis guardarlo igualmente?',
      requiredField: 'Campo obligatorio',
      recordsPerPage: 'Medida de la páginas:',
      savingChanges: 'Guardando los cambios',
      selectByPolygon: 'Polígono',
      selectNews: 'Seleccionar los nuevos elementos creados',
      selection: 'Selección',
      someDeleted: 'Algunos de los elementos seleccionados están marcados para ser eliminados.',
      stopDrawing: 'Dejar de dibujar elementos',
      thisDeleted: 'Este elemento está marcado para ser eliminado.',
      undoConfirm: '¿Seguro que queréis deshacer los cambios de este elemento?',
      undoConfirmN: '¿Seguro que queréis deshacer los cambios de {elements}?',
      undoElements: 'Deshacer {elements}',

      quitWhileSaving: 'Guardando, esperad porfavor...',
      quitWithChanges: 'Tenéis datos sin guardar'
    },
    draw: {
      headerName: 'Dibujar',
      title: 'Dibujar y medir',
      help: 'Dibujar geometrías sobre el mapa, medir las distancias y áreas.',

      area: 'Área',
      circle: 'Círculo',
      drawMulti: 'Continuar dibujando',
      drawMultiCaption: 'Permite dibujar nuevas medidas al finalizar el elemento',
      explanation: 'Escoged tipo de geometría, y seguidamente clicad al mapa. Podéis hacer doble clic para acabar de dibujar',
      explanationCircle: 'Haced clic sobre el mapa para dibjar un círculo. Definid el radio y clicad sobre el mapa o clicad y arrastrad el puntero',
      marker: 'Punto',
      path: 'Línea',
      radius: 'Radio',
      save: 'Guarda como GeoJSON',
      stop: 'Parar de dibujar'
    },
    fullscreen: {
      headerName: 'Pantalla completa',
      help: 'Cambia vista a pantalla completa.'
    },
    heatMap: {
      defaultOption: 'Por defecto (geometría)',
      blur: 'Difuminado',
      intensity: 'Intensidad',
      radius: 'Radio',
      title: 'Mapa de calor'
    },
    help: {
      headerName: 'Ayuda',
      title: 'Ayuda',

      start: 'Empieza el itinerario de ayuda'
    },
    home: {
      headerName: 'Inicio',
      help: 'Recupera la vista inicial.'
    },
    incidence: {
      headerName: 'Incidencia',
      title: 'Crear y enviar incidencia',
      help: 'Crea una incidencia añadiendo un título, una descripción y un correo y envíala.',

      titleInput: 'Título',
      descriptionInput: 'Descripción',
      emailInput: 'Correo electrònico',
      emailErrorMessage: 'Por favor, introduce una dirección de correo electrònico válida. (name@example.com)',
      post: 'Enviar',
      message: 'Incidencia enviada',
      errorMessage: 'Ha habido un error al enviar la incidencia',

      area: 'Área',
      delete: 'Eliminar geometrías',
      marker: 'Punto',
      stop: 'Parar de dibujar'
    },
    print: {
      headerName: 'Impresión',
      help: 'Impresión del mapa'
    },
    printPage: { headerName: 'Imprimir' },
    search: {
      headerName: 'Búsqueda',
      help: 'Utilizad la barra de búsqueda para encontrar rápidamente lo que buscáis.',

      history: 'Historial de búsqueda',
      instructions: 'Por favor, escribid cualquier cosa para buscar',
      noResults: 'No se ha encontrado ningún resultado',
      results: 'Resultados por a {q}',
      resultsError: 'Error al buscar',
      search: 'buscar',
      queryBuilder: {
        title: 'Constructor de consultas',
        fields: 'Campos',
        values: 'Valores',
        operators: 'Operadores',
        addFilter: 'Añadir filtro',
        help: 'Haz clic en un campo o en un valor para seleccionarlo, y doble clic para añadirlo a la consulta. Haz clic en un operador para añadirlo a la consulta. También se pueden añadir valores a la consulta que no estén en la lista.'
      }
    },
    share: {
      headerName: 'Comparte',
      title: 'Comparte',
      help: 'Comparte el mapa actual con las geometrías que haya dibujado.',
      description: 'Con este enlace puedes compartir el mapa en la ubicación y el nivel de zoom actual, las capas del catálogo que están fijadas en el mapa y los dibujos y medidas que has hecho.<br>Las opciones de abajo te permitirán abrir un mensaje cuando se abra el enlace, mostrar el mapa sin la barra de herramientas, compartir el estado del catálogo, entre otras...',

      catalogState: 'Catalog state',
      controlledMap: 'Bloquear zoom con la rueda del ratón (Ctrl para activarlo)',
      zoomDrawingLayers: 'Ajustar a los elementos dibujados',
      deactivateClick: 'Desactivar clics en el mapa',
      closeSidebar: 'Cierra el panel lateral',
      clusterMarkers: 'Agrupar marcadores',
      message: '@:names.message',
      options: '@:names.options',
      openMessage: 'Abrir @:names.message',
      showTooltips: 'Mostrar etiquetas',
      markerAtCenter: 'Marcador en el centro',
      simpleView: 'Vista simple',
      hideLayersControl: 'Esconde el control de capas',
      selectLayer: 'Selecciona una capa',
      openLayerPanel: 'Abrir panel de información de una capa'
    },
    statistics: {
      columnCount: 'Recuento',
      columnColor: 'Color',
      groupBy: 'Agrupar por',
      label: 'Etiqueta',
      palette: 'Paleta',
      tabData: 'Datos',
      tabResults: 'Temático',
      title: 'Estadísticas',
      titleFor: '@:tools.statistics.title per {layerName}'
    },
    streetview: {
      headerName: 'Street View',
      title: 'Google Street View',
      help: 'Acceder a la vista de calle de Google.',

      noDataError: 'En esta localización no se han podido encontrar datos del Street View.',
      centerMap: 'Centrar mapa'
    }
  },
  units: {
    meters: 'metros'
  },
  validations: {
    empty: 'Este valor no puede estar vacío'
  },
  values: {
    empty: 'valor vacío',
    false: 'cierto',
    true: 'falso'
  },
  yes: 'sí',
  no: 'no'
}
