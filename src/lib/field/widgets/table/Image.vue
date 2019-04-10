<template>
  <q-img
    v-if="src"
    :src="src"
    contain
    spinner-size="20px"
  />
</template>

<script>
export default {
  props: ['value', 'field', 'feature'],
  computed: {
    src () {
      return this.field.constructor.getUrl(this.value)
    }
  }
}
</script>
