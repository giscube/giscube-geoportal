<template>
  <div class="panel auth-panel">

    <div class="panel-content">

      <p class="panel-title">{{ t('title') }}</p>

      <div v-if="canCloseWindow">

        <p v-if="loginCodeOk">{{ t('loginCodeOk') }}</p>
        <p v-if="loginCodeError">{{ t('loginCodeError') }}</p>

        <div class="buttons q-mt-md">
          <q-btn outline no-caps
            icon="close"
            :label="t('closeWindow')"
            @click="closeWindow"
          />
        </div>
      </div>

      <div v-else>
        <div v-if="oauthType === 'code'">
          <div v-if="!$store.state.auth.username" class="no-login">
            <p>{{ t('pleaseLogin')}}</p>

            <div class="buttons q-mt-md">
              <a class="nav-link" target="_blank"
                 :href="$store.config.oauth.authorize"
              >
                <q-btn outline no-caps
                   icon="person"
                   :label="t('logIn')"
                   @click="observeAuth"
                />
              </a>
            </div>
          </div>
        </div>

        <div v-if="$store.state.auth.username" class="valid-login">
          {{ t('authenticatedAs') }} <span class="username">{{ $store.state.auth.username }}</span>

          <div class="buttons q-mt-md">
            <q-btn outline no-caps
               icon="exit_to_app"
               :label="t('logOut')"
               @click="logout"
            />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import axios from 'axios'
import qs from 'qs'

export default {
  name: 'AuthPanel',
  data () {
    return {
      canCloseWindow: false,
      loginCodeOk: false,
      loginCodeError: false
    }
  },
  computed: {
    oauthType () {
      if (this.$config.oauth && this.$config.oauth.type) {
        return this.$config.oauth.type
      }
      return ''
    }
  },
  beforeRouteLeave (to, from, next) {
    this.canCloseWindow = false
    next()
  },
  beforeRouteEnter (to, from, next) {
    if (to.name === 'auth_params') {
      let location = window.location
      if (location.search) {
        next(vm => {
          let params = vm.getUrlParams(location.search)
          let code = params.code
          if (code) {
            let apiUrl = vm.$store.config.oauth.token

            var config = {
              timeout: 10000,
              headers: {
                'Content-type': 'application/x-www-form-urlencoded'
              }
            }

            let oauthParams = {
              client_id: vm.$store.config.oauth.client_id,
              grant_type: 'authorization_code',
              code: code,
              redirect_uri: vm.$store.config.oauth.redirect_uri
            }

            axios.post(apiUrl, qs.stringify(oauthParams), config)
              .then(response => {
                let data = response.data
                vm.$store.commit('auth/setAccessToken', data.access_token)
                vm.$store.dispatch('auth/updateUserInfo')
                localStorage.setItem('expires_in', data.expires_in)
                localStorage.setItem('refresh_token', data.refresh_token)
                vm.loginCodeOk = true
                vm.canCloseWindow = true
              })
              .catch(error => {
                console.error(error)
                vm.loginCodeError = true
                vm.canCloseWindow = true
              })
          }
          let cleanUri = location.protocol + '//' + location.host + location.pathname
          window.history.replaceState({}, document.title, cleanUri)
        })
      } else {
        next('home')
      }
    }
    next()
  },
  methods: {
    closeWindow () {
      window.close()
    },
    getUrlParams (search) {
      let hashes = search.slice(search.indexOf('?') + 1).split('&')
      return hashes.reduce((params, hash) => {
        let [key, val] = hash.split('=')
        return Object.assign(params, { [key]: decodeURIComponent(val) })
      }, {})
    },
    logout () {
      this.$store.dispatch('auth/logout')
    },
    observeAuth () {
      this.$store.dispatch('auth/observeAuth', { seconds: 120 })
    },
    t (key) {
      return this.$t('tools.auth.' + key)
    }
  }
}
</script>

<style lang="scss">
.auth-panel {
  .buttons {
    display: flex;
    justify-content: flex-end;

    a {
      color: black;
    }
  }

  .valid-login {
    .username {
      font-weight: bold;
    }
  }
}
</style>
