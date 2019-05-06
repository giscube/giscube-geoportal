<template>
  <q-img
    v-if="src"
    :src="src"
    contain
    spinner-size="20px"
  />
</template>

<script>
import { QImg } from 'quasar'

export default {
  props: ['value', 'field', 'feature'],
  components: {
    QImg
  },
  computed: {
    src () {
      return this.field.constructor.getUrl(this.value)
    }
  }
}
</script>
