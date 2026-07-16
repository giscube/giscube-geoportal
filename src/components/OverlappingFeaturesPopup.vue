<template>
  <div class="overlapping-popup">
    <q-tabs
      v-model="current"
      dense
      no-caps
      inline-label
      class="overlapping-popup-tabs"
    >
      <q-tab
        v-for="(feature, index) in features"
        :key="'overlapping-feature-' + index"
        :name="index"
        :label="label(feature, index)"
      />
    </q-tabs>

    <component
      :is="popupComponent"
      :feature="currentFeature"
      :render-contents="renderContents"
      @update-popup-size="$emit('update-popup-size')"
    ></component>
  </div>
</template>

<script>
import { QTab, QTabs } from 'quasar'

export default {
  props: {
    features: Array,
    popupComponent: [Object, Function],
    renderContents: Function
  },
  components: {
    QTab,
    QTabs
  },
  data () {
    return {
      current: 0,
      query: {
        latlng: null
      }
    }
  },
  computed: {
    currentFeature () {
      return this.features[this.current]
    }
  },
  watch: {
    current () {
      this.$nextTick(_ => this.$emit('update-popup-size'))
    }
  },
  methods: {
    label (feature, index) {
      const tooltip = feature._tooltip && feature._tooltip.textContent.trim()
      return tooltip || `#${index + 1}`
    },
    onOpen ({ target }) {
      this.query.latlng = target.getLatLng()
      this.$store.commit('setQuery', this.query)
    },
    onClose () {
      this.$store.dispatch('removeQuery', this.query)
    }
  }
}
</script>

<style scoped lang="scss">
.overlapping-popup {
  min-width: 200px;
}

.overlapping-popup-tabs {
  margin-bottom: 8px;
  border-bottom: 1px solid #ddd;

  /deep/ .q-tab {
    max-width: 12em;
  }
}
</style>
