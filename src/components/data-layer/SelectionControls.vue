<template>
  <div
    v-show="!drawing"
    class="row items-center"
  >
    <span class="q-mr-md">{{ t('selection') }}</span>
    <q-btn
      :label="t('selectByPolygon')"
      @click="selectByPolygon"
    />
  </div>
</template>

<script>
import { QBtn } from 'quasar'
import { mapState } from 'vuex'
import { CancelError } from 'src/lib/geomUtils'

import TranslationMixin from './TranslationMixin'

export default {
  mixins: [TranslationMixin],
  props: ['table'],
  components: {
    QBtn
  },
  computed: mapState({
    drawing: state => state.map.drawing
  }),
  methods: {
    selectByPolygon () {
      this.$store.dispatch('map/draw', 'polygon')
        .then(layer => {
          this.table.selectByPolygon(layer)
        })
        .catch(e => {
          if (e instanceof CancelError) {
            if (e.layer) {
              this.table.selectByPolygon(e.layer)
            }
          } else {
            this.$except(e)
          }
        })
    }
  }
}
</script>
