<template>
  <q-separator
    v-if="item.separator && !menu"
    vertical
  />
  <div
    v-else-if="item.separator"
  ></div>
  <q-space
    v-else-if="item.spacer && !menu"
  />
  <q-separator
    v-else-if="item.spacer"
  />
  <header-item
    v-else
    :name="item.name"
    :tool="item.tool"
    :menu="menu"
    @sidebar-visibility-changed="$emit('sidebar-visibility-changed', $event)"
    @event="$emit('event', $event)"
  />

</template>

<script>
import HeaderItem from './HeaderItem.vue'

export default {
  components: {
    HeaderItem
  },
  props: {
    item: {
      type: Object,
      required: true
    },
    menu: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style>
</style>
