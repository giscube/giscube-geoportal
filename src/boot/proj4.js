import proj4 from 'proj4'

export default async ({ Vue }) => {
  const epsgs = Vue.prototype.$config.epsgs

  epsgs.forEach(epsg => {
    proj4.defs(epsg.code, epsg.def)
  })
}
