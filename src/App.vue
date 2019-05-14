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
    window.addEventListener('beforeunload', this.onLeave)
  },
  destroyed () {
    window.removeEventListener('beforeunload', this.onLeave)
  },
  methods: {
    onLeave (e) {
      if (this.$store.state.dataLayer.editStatus.saving) {
        preventExit(e, this.$t('tools.data.quitWhileSaving'))
      } else if (this.$store.getters['dataLayer/editLayerModified']) {
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
