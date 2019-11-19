<template>
  <q-input
    ref="copy"
    :value="value"
    outlined
    bg-color="white"
    dense
  >
    <template v-slot:append>
      <q-btn
        :icon="feedback || copied > 0 ? 'fas fa-check' : 'fas fa-copy'"
        :label="feedback || copied > 0 ? '' : $t('actions.copy')"
        flat
        dense
        :ripple="false"
        @click="copy"
        @mouseleave="feedback = false"
        :color="feedback || copied > 0 ? 'green' : void 0"
      />
    </template>
  </q-input>
</template>

<script>
import { QBtn, QInput } from 'quasar'

export default {
  props: ['value'],
  components: {
    QBtn,
    QInput
  },
  data () {
    return {
      native: null,
      feedback: false,
      copied: 0
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.native = this.$refs.copy.$el.getElementsByTagName('input')[0]
    })
  },
  methods: {
    copy () {
      this.native.select()
      document.execCommand('copy')
      // remove selection
      this.native.selectionEnd = this.native.selectionStart

      // user feedback
      this.feedback = true
      ++this.copied
      setTimeout(() => --this.copied, 700)
    }
  }
}
</script>
