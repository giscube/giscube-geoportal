<template>
  <q-list>
    <q-expansion-item
      ref="parent"
      :value="value"
      :disable="disable"
      @input="$emit('input', $event)"
    >
      <template v-slot:header>
        <q-item-section>
          <q-item-label class="text-h5">{{ mainLabel }}</q-item-label>
        </q-item-section>
        <q-item-section
          side
          v-if="$store.state.dataLayer.sources === null"
        >
          <q-spinner />
        </q-item-section>
        <q-item-section side>
          <q-item-label>
            <q-btn
              icon="refresh"
              flat
              dense
              @click.stop="refresh"
            />
          </q-item-label>
        </q-item-section>
      </template>
      <q-item
        v-if="$store.state.dataLayer.sources === null"
      >
        <q-item-section class="text-caption">{{ $t('states.loading') | capitalize }}</q-item-section>
      </q-item>
      <q-item
        v-else-if="sources.length < 1"
      >
        <q-item-section class="text-caption">{{ $t('states.empty') | capitalize }}</q-item-section>
      </q-item>
      <q-expansion-item
        v-else
        v-for="(source, i) in sources"
        :key="'source-' + i"
        default-opened
        :header-inset-level="1"
        :content-inset-level="2"
        :label="source.name"
      >
        <q-item
          v-for="(layer, j) in source.layers"
          :key="'layer-' + i + '-' + j"
          clickable
          v-ripple
          @click="onSelectItem({ source, layer })"
        >
          <q-item-section>{{layer.name}}</q-item-section>
        </q-item>
      </q-expansion-item>
    </q-expansion-item>
  </q-list>
</template>

<script>
import { Ripple, QBtn, QExpansionItem, QItem, QItemLabel, QItemSection, QList, QSpinner } from 'quasar'

export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    disable: {
      type: Boolean,
      default: false
    }
  },
  components: {
    QBtn,
    QExpansionItem,
    QItem,
    QItemLabel,
    QItemSection,
    QList,
    QSpinner
  },
  directives: {
    Ripple
  },
  computed: {
    sources () {
      return this.$store.getters['dataLayer/sources']
    },
    mainLabel () {
      const current = this.$store.state.dataLayer.current
      return current ? `${current.source.name} > ${current.layer.name}` : this.t('title')
    }
  },
  watch: {
    disable (newValue) {
      if (newValue) {
        this.$refs.parent.hide()
      }
    }
  },
  methods: {
    t (key, ...args) {
      return this.$t('tools.data.' + key, ...args)
    },
    refresh () {
      this.$store.dispatch('dataLayer/refreshSources')
    },
    onSelectItem ({ source, layer }) {
      this.$emit('input', false)
      this.$nextTick(_ => {
        this.$router.push({
          name: 'data',
          params: {
            sourceName: source.name,
            layerName: layer.name
          }
        })
      })
    }
  }
}
</script>
