<template>
  <q-header class="giscube-header">
    <q-toolbar class="giscube-toolbar">

      <a class="giscube-header-brand header" href="#"><img :src="brandLogo"><span>{{ brandText }}</span></a>

      <q-separator vertical class="gt-xs no-print" />

      <q-btn stack flat stretch
        icon="arrow_back"
        :label="$t('actions.cancel')"
        @click.prevent="cancelPrint"
        class="no-print"
      />

      <q-separator vertical class="gt-xs no-print"/>

      <q-btn stack flat stretch
        icon="print"
        :label="$t('actions.print')"
        @click.prevent="print"
        class="no-print"
      />

    </q-toolbar>
  </q-header>
</template>

<script>
import { QHeader } from 'quasar'

export default {
  props: [
    'brandLogo',
    'brandText',
    'map'
  ],
  components: {
    QHeader
  },
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

<style>
</style>
