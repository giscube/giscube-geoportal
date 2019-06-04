<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
require('./css/print.styl')

function preventExit (e, str) {
  e.preventDefault()
  e.returnValue = str || ''
}

export default {
  name: 'App',
  beforeMount () {
    this.$store.commit('router', this.$router)
    window.addEventListener('beforeunload', this.onLeave)
  },
  destroyed () {
    window.removeEventListener('beforeunload', this.onLeave)
  },
  computed: {
    dataChanged () {
      return this.$store.state.dataLayer.table.rows.some(row => {
        return row.status.new || row.status.edited || row.status.deleted
      })
    },
    savingData () {
      return this.$store.state.dataLayer.table.saving
    }
  },
  methods: {
    onLeave (e) {
      if (this.savingData) {
        preventExit(e, this.$t('tools.data.quitWhileSaving'))
      } else if (this.dataChanged) {
        preventExit(e, this.$t('tools.data.quitWithChanges'))
      }
    }
  }
}
</script>

<style>
#q-app {
  font-family: "Helvetica Neue", Arial, Helvetica, sans-serif;
}
</style>
