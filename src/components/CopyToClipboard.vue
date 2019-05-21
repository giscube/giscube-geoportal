<template>
  <q-input
    ref="copy"
    :value="value"
    outlined
    class="q-mx-lg"
    bg-color="white"
  >
    <template v-slot:append>
      <q-btn
        :icon="copied > 0 ? 'fas fa-clipboard-check' : 'fas fa-clipboard'"
        dense
        flat
        @click="copy"
        :color="copied > 0 ? 'green' : void 0"
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
      ++this.copied
      setTimeout(() => --this.copied, 1500)
    }
  }
}
</script>
