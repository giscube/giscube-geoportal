<template>
  <q-btn stack flat stretch
    icon="edit"
    label="Edit"
    @click="refresh"
  >
    <q-menu
      ref="menu"
      anchor="bottom right"
      self="top right"
    >
      <q-list>
        <q-item
          v-if="sources.length === 0"
        >
          <q-spinner />
        </q-item>
        <q-item
          v-else
          v-for="item in items"
          :key="item.key"
          :clickable="!item.title"
          v-close-popup="!item.title"
          @click="onSelectItem(item)"
        >
          {{ item.name }}
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script>
export default {
  data () {
    return {}
  },
  computed: {
    sources () {
      return this.$store.getters['dataLayer/sources']
    },
    items () {
      const items = []
      this.sources.forEach((source, i) => {
        items.push({ title: true, name: source.name, key: 'source-' + i })
        source.layers.forEach((layer, j) => {
          items.push({ layer, source, name: layer.name, key: 'layer-' + i + '-' + j })
        })
      })
      return items
    }
  },
  methods: {
    refresh () {
      this.$store.dispatch('dataLayer/verifySourcesLoaded')
        .then(_ => {
          this.$nextTick(_ => {
            this.$refs.menu.updatePosition()
          })
        })
    },
    onSelectItem (item) {
      this.$nextTick(_ => {
        this.$router.push({
          name: 'data',
          params: {
            sourceName: item.source.name,
            layerName: item.layer.name
          }
        })
      })
    }
  }
}
</script>
