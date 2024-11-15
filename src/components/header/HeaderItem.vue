<template>
  <q-btn stack flat stretch
    v-if="!menu && supported"
    :icon="icon"
    :label="label"
    :to="to"
    @click="_onClick"
    class="gt-xs"
    :style="style"
  />
  <q-item
    v-else-if="supported"
    clickable
    v-close-popup
    :to="to"
    :style="style"
    @click="_onClick"
  >
    <q-item-section side>
      <q-icon :name="icon" />
    </q-item-section>
    <q-item-section>{{ label }}</q-item-section>
  </q-item>
</template>

<script>
import { ClosePopup, QBtn, QIcon, QItem, QItemSection } from 'quasar'
import { getOrCall, onToolClick } from 'src/lib/toolUtils'

export default {
  props: {
    name: {
      type: String,
      required: true
    },
    tool: {
      type: Object,
      required: true
    },
    menu: {
      type: Boolean,
      default: false
    }
  },
  components: {
    QBtn,
    QIcon,
    QItem,
    QItemSection
  },
  directives: {
    ClosePopup
  },
  computed: {
    supported () {
      return !this.tool.supported || this.tool.supported.call(this, this.tool)
    },
    icon () {
      return getOrCall(this.tool.icon, this.tool, this)
    },
    label () {
      return this.$t('tools.' + this.name + '.headerName')
    },
    to () {
      const value = getOrCall(this.tool.to, this.tool, this)
      if (typeof value === 'string') {
        return { name: value }
      } else {
        return value
      }
    },
    style () {
      return {}
    }
  },
  methods: {
    _onClick () {
      return onToolClick(this.name, this)
    },
    emit (event, value) {
      if (typeof event === 'string' && event) {
        this.$emit('event', { name: event, value })
      } else if (typeof event === 'object' && event.name.toString()) {
        this.$emit('event', event)
      } else {
        this.$except('[HeaderItemHolder.vue] Trying to emit an incorrectly configured event. Check your config.')
      }
    }
  }
}
</script>
