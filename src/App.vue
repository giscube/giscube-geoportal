<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
require('./css/lib.styl')
require('./css/print.styl')

import axios from 'axios'
import BooleanDialog from 'components/BooleanDialog'

function preventExit (e, str) {
  e.preventDefault()
  e.returnValue = str || ''
}

function getClientVersion (doc) {
  return parseInt(doc.documentElement.getAttribute('data-client-version'))
}

function getRemoteVersion () {
  return new Promise((resolve, reject) => {
    axios.get(location)
      .then(response => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(response.data, 'text/html')
        resolve(getClientVersion(doc))
      })
      .catch(reject)
  })
}

export default {
  name: 'App',
  beforeMount () {
    this.$store.dispatch('auth/loadState')
    window.addEventListener('beforeunload', this.onLeave)
  },
  async mounted () {
    await this.$nextTick()

    if (this.$route.name !== 'share') {
      this.$store.dispatch('map/addDefaultLayers')
    }

    if (this.automaticVersioning()) {
      this.checkNewVersion()
    }
  },
  destroyed () {
    clearInterval(this.interval)
    window.removeEventListener('beforeunload', this.onLeave)
  },
  data () {
    let versionData = {}
    if (this.automaticVersioning()) {
      versionData = {
        asking: false,
        clientVersion: getClientVersion(document),
        interval: setInterval(() => this.checkNewVersion(), 60 * 60 * 1000) // 1 hour
      }
    }

    return {
      ...versionData
    }
  },
  computed: {
    table () {
      return this.$store.state.dataLayer.table
    },
    queues () {
      return [this.$store.state.dataLayer.asyncQueue]
    },
    dataChanged () {
      return this.table && this.table.changedCount > 0
    },
    queueRunning () {
      return this.queues.some(queue => queue.running)
    }
  },
  methods: {
    automaticVersioning () {
      return process.env.NODE_ENV === 'production'
    },
    onLeave (e) {
      if (this.queueRunning) {
        preventExit(e, this.$t('tools.data.quitWhileSaving'))
      } else if (this.dataChanged) {
        preventExit(e, this.$t('tools.data.quitWithChanges'))
      }
    },
    checkNewVersion () {
      if (!this.asking) {
        this.asking = true
        this._checkNewVersion()
          .then(() => {
            this.asking = false
          })
      }
    },
    async _checkNewVersion () {
      let remoteVersion
      try {
        remoteVersion = await getRemoteVersion()
      } catch (e) {
        this.$except(e, { silent: true })
      }

      if (remoteVersion > this.clientVersion) {
        const update = await this.askUpdate()
        if (update === true) {
          location.reload(true)
        } else if (update === false) {
          // Do nothing
          // wait for next interval
        } else {
          // Don't ask again
          clearInterval(this.interval)
        }
      }
    },
    askUpdate () {
      return new Promise(resolve => {
        this.$store.dispatch('layout/createDialog', {
          root: this,
          component: BooleanDialog,
          title: this.$t('actions.askUpdateTitle'),
          msg: this.$t('actions.askUpdate'),
          dontAskCancel: true
        })
          .then(api => {
            api
              .onOk(resolve)
              .onCancel(() => resolve(void 0))
          })
      })
    }
  }
}
</script>

<style>
#q-app {
  font-family: "Helvetica Neue", Arial, Helvetica, sans-serif;
}
</style>
