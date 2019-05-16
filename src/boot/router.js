import router from '../router'

export default async ({ Vue }) => {
  Vue.prototype.$realRouter = router
}
