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
      <div v-else-if="loadingCode">
        <q-spinner-tail size="2rem"/>
      </div>
      <div v-else>
        <div v-if="!$store.state.auth.username" class="no-login">
          <div v-if="oauthType === 'code'">
            <p>{{ t('pleaseLogin')}}</p>

            <div class="buttons q-mt-md">
              <a class="nav-link" target="_blank"
                 :href="$config.oauth.authorize"
              >
                <q-btn outline no-caps
                   icon="person"
                   :label="t('logIn')"
                   @click="observeAuth"
                />
              </a>
            </div>
          </div>
          <div v-else-if="oauthType === 'password'">
            <q-form
              @submit="credentialsLogin"
              method="post"
            >
              <q-input
                class="q-mb-sm"
                name="username"
                v-model="credentials.username"
                :label="t('username')"
                :rules="[ value => !!value || $t('validations.empty') ]"
                :readonly="loading"
                clearable
                no-error-icon
              />
              <q-input
                class="q-mb-sm"
                name="password"
                v-model="credentials.password"
                type="password"
                :label="t('password')"
                :readonly="loading"
                clearable
                no-error-icon
              />
              <span
                v-if="invalidCredentials"
                class="text-negative"
              >
                {{ t('invalidCredentials') }}
              </span>
              <div class="buttons">
                <q-btn outline no-caps
                  type="submit"
                  icon="person"
                  :label="t('logIn')"
                  :loading="loading"
                />
              </div>
            </q-form>
          </div>
        </div>

        <div v-else class="valid-login">
          {{ t('authenticatedAs') }} <span class="username">{{ $store.state.auth.username }}</span>

          <div class="buttons q-mt-md">
            <q-btn
              v-if="adminUrl && isStaff"
              flat
              no-caps
              icon="settings"
              type="a"
              :href="adminUrl"
              target="_blank"
              :label="t('adminUrl')"
              style="margin-right: 10px"
            />
            <q-btn flat no-caps
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
import { get } from 'lodash'
import { QBtn, QForm, QInput, QSpinnerTail } from 'quasar'
import qs from 'qs'

export default {
  name: 'AuthPanel',
  components: {
    QBtn,
    QForm,
    QInput,
    QSpinnerTail
  },
  data () {
    return {
      credentials: {
        username: this.$store.state.auth.username,
        password: ''
      },
      loading: false,
      loadingCode: false,
      canCloseWindow: false,
      loginCodeOk: false,
      loginCodeError: false,
      invalidCredentials: false
    }
  },
  computed: {
    adminUrl () {
      return get(this.$store.state.auth.profile, 'admin_url')
    },
    isStaff () {
      return get(this.$store.state.auth.profile, 'is_staff')
    },
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
            vm.loadingCode = true
            let apiUrl = vm.$config.oauth.token

            var config = {
              timeout: 10000,
              headers: {
                'Content-type': 'application/x-www-form-urlencoded'
              }
            }
            const clientId = params.client_id

            let oauthParams = {
              client_id: clientId || vm.$config.oauth.client_id,
              grant_type: 'authorization_code',
              code: code,
              redirect_uri: vm.$config.oauth.redirect_uri
            }

            axios.post(apiUrl, qs.stringify(oauthParams), config)
              .then(response => {
                let data = response.data
                vm.$store.commit('auth/setAccessToken', data.access_token)
                vm.$store.dispatch('auth/updateUserInfo')
                localStorage.setItem('expires_in', data.expires_in)
                localStorage.setItem('refresh_token', data.refresh_token)
                vm.loginCodeOk = true

                if (params.redirect) {
                  vm.$router.push({ name: params.redirect })
                } else {
                  vm.canCloseWindow = true
                }
                vm.loadingCode = false
              })
              .catch(error => {
                vm.$except(error)
                vm.loginCodeError = true
                vm.canCloseWindow = true
                vm.loadingCode = false
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
  mounted () {
    this.invalidCredentials = false
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
      this.$store.dispatch('auth/logout').catch(this.$except)
    },
    observeAuth () {
      this.$store.dispatch('auth/observeAuth', { seconds: 120 })
    },
    credentialsLogin () {
      this.loading = true
      this.$store.dispatch('auth/credentialsLogin', this.credentials)
        .then(() => {
          this.invalidCredentials = false
          this.credentials.password = ''
          this.loading = false
        })
        .catch(({ invalidCredentials }) => {
          if (invalidCredentials) {
            this.invalidCredentials = true
          }
          this.loading = false
        })
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
