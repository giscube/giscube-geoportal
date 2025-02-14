<template>
  <div>
    <q-list
      v-for="item in items"
      :key="item"
      style="min-width: 50px"
    >
      <q-item clickable>
        <q-item-section @click="selectedItem(item)">{{ item }}</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>
import { QItem, QItemSection, QList } from 'quasar'

export default {
  props: ['advancedOption', 'items'],
  components: {
    QItem,
    QItemSection,
    QList
  },
  computed: {},
  methods: {
    selectedItem (item) {
      this.$emit('update:advancedOption', item)
    }
  }
}
</script>
