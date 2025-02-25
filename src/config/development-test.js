import base from './lib.js'
// you can also do
// import base from './production.js'

// config for development

export default base.merge({
  capabilities: {
    login: true
  },
  catalog: {
    categories: 'https://localhost:8000/apps/giscube-admin/geoportal/category/',
    search: 'https://localhost:8000/apps/giscube-admin/geoportal/catalog/',
    auth: true
  },
  editsources: [
    {
      name: 'Ajuntament de Girona',
      url: 'https://localhost:8000/apps/giscube-admin/'
    }
  ],
  google: {
    apiKey: 'AIzaSyA-T7DgvIL7-hohqVZosujoiLPfgQWFAPw' // http://localhost:8080/* http://localhost:8081/*
  },
  home: {
    zoom: 15,
    center: {
      lat: 41.973,
      lng: 2.812
    }
  },
  incidence: {
    url: 'http://localhost:8000/api/v2/giscube/incidence/'
  },
  registers: {
    url: 'http://localhost:8000/api/v2/'
  },
  locale: {
    main: 'ca',
    fallback: 'en-us'
  },
  oauth: {
    type: 'password',
    client_id: 'clinet-key',
    token: 'https://localhost:8000/apps/giscube-admin/o/token/'
  },
  searches: [
    {
      name: 'test',
      title: 'Test search',
      url: 'https://localhost:8000/apps/giscube-admin/geoportal/search/',
      auth: true
    }
  ]
})
