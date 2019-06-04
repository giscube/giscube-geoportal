<template>
  <div
    v-show="!!drawing"
  >
    <q-btn
      :label="t('stopDrawing')"
      :disable="disable"
      @click="$store.dispatch('map/stopDrawing')"
    />
  </div>
</template>

<script>
import { QBtn } from 'quasar'
import { mapState } from 'vuex'

import TranslationMixin from './TranslationMixin'

export default {
  props: ['disable'],
  mixins: [TranslationMixin],
  components: {
    QBtn
  },
  computed: mapState({
    drawing: state => state.map.drawing
  })
}
</script>

<style>
</style>
