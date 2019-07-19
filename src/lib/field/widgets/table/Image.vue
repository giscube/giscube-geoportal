<template>
  <q-img
    v-if="thumbnail"
    :src="thumbnail"
    @click.stop="showImage(src)"
    contain
    spinner-size="20px"
  />
</template>

<script>
import { QImg } from 'quasar'

import ImageDialog from 'components/ImageDialog'

export default {
  props: ['value', 'field', 'row'],
  components: {
    QImg
  },
  computed: {
    src () {
      return this.field.constructor.getUrl(this.value)
    },
    thumbnail () {
      return this.field.constructor.getThumbnail(this.value)
    }
  },
  methods: {
    showImage (src) {
      this.$store.dispatch('layout/createDialog', {
        component: ImageDialog,
        src
      })
    }
  }
}
</script>
