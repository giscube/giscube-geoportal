import base from './lib.js'
// you can also do
// import base from './production.js'

// config for development

export default base.merge({
  capabilities: {
    login: true
  },
  catalog: {
    categories: 'http://localhost:8000/geoportal/category/',
    categories: 'http://localhost:8000/geoportal/category/catalog/',
    search: 'http://localhost:8000/geoportal/catalog/',
    auth: true
  },
  editsources: [
    {
      name: 'Ajuntament de Girona',
      url: 'http://localhost:8000/'
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
  locale: {
    main: 'ca',
    fallback: 'en-us'
  },
  oauth: {
    type: 'password',
    client_id: 'RQLuYjgbU5pwM9WNdIiFtq2ngE7x4wPJoH7bk70Q',
    token: 'http://localhost:8000/o/token/',
    revokeToken: 'http://localhost:8000/o/revoke-token/'
  },
  searches: [
    {
      name: 'test',
      title: 'Test search',
      url: 'http://localhost:8000/geoportal/search/',
      auth: true
    }
  ]
})
