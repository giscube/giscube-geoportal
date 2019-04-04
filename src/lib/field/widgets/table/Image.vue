<template>
  <q-img
    v-if="src"
    :src="src"
    contain
    style="max-height: 2em; max-width: 100%"
  />
</template>

<script>
export default {
  props: ['value', 'field', 'feature'],
  computed: {
    src () {
      return this.value && (this.value.thumbnail || this.value.src)
    }
  }
}
</script>
