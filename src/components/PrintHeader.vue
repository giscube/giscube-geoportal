<template>
  <q-header class="giscube-header">
    <q-toolbar class="giscube-toolbar-buttons">

      <a class="giscube-header-brand header" href="#"><img src="assets/logo_giscube.svg"><span>Giscube Geoportal</span></a>

      <q-separator vertical class="gt-xs no-print" />

      <q-btn stack flat stretch
        icon="arrow_back"
        label="Cancel"
        @click.prevent="cancelPrint"
        class="no-print"
      />

      <q-separator vertical class="gt-xs no-print"/>

      <q-btn stack flat stretch
        icon="print"
        label="Print"
        @click.prevent="print"
        class="no-print"
      />

    </q-toolbar>
  </q-header>
</template>

<script>
export default {
  props: ['map'],
  data () {
    return {}
  },
  mounted () {
    if (!this.map) {
      console.log('NO MAP')
      return
    }
    let width = Math.round(this.map.$el.clientHeight * 297 / 155)
    this.map.setMapWidth(width + 'px')
  },
  methods: {
    cancelPrint () {
      this.map.setMapWidth(null)
      this.$emit('done')
    },
    print () {
      this.map.setMapWidth(1030 + 'px')
      this.$nextTick(() => {
        window.print()
        this.cancelPrint()
      })
    }
  }
}
</script>

<style scoped>
.navbar-light .navbar-nav .nav-link {
  color: #7c7c7d;
}
</style>
