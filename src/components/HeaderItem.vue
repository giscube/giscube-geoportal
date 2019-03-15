<template>
  <q-btn stack flat stretch
    v-if="!menu && supported"
    :icon="icon"
    :label="label"
    :to="to"
    @click="_onClick"
    class="gt-xs"
  />
  <q-item
    v-else-if="supported"
    clickable
    v-close-menu
    :to="to"
    @click="_onClick"
  >
    <q-item-section side>
      <q-icon :name="icon" />
    </q-item-section>
    <q-item-section>{{ label }}</q-item-section>
  </q-item>
</template>

<script>

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
  computed: {
    supported () {
      return !this.tool.supported || this.tool.supported.call(this, this.tool)
    },
    icon () {
      return this._getOrCall(this.tool.icon)
    },
    label () {
      return this.$t('tools.' + this.name + '.header_name')
    },
    to () {
      const value = this._getOrCall(this.tool.to)
      if (typeof value === 'string') {
        return { name: value }
      } else {
        return value
      }
    }
  },
  methods: {
    emit (event, value) {
      if (typeof event === 'string' && event) {
        this.$emit('event', { name: event, value })
      } else if (typeof event === 'object' && event.name.toString()) {
        this.$emit('event', event)
      } else {
        console.error('[HeaderItemHolder.vue] Trying to emit an incorrectlly configured event. Check your config.', { event })
      }
    },
    _onClick () {
      if (this.tool.to) {
        this.$emit('sidebar-visibility-changed', true)
      }
      if (this.tool.action) {
        this.tool.action.call(this, this.tool)
      }
      if (this.tool.emit) {
        this.emit(this._getOrCall(this.tool.emit))
      }
    },
    _getOrCall (v) {
      if (v) {
        if (typeof v === 'function') {
          return v.call(this, this.tool)
        } else {
          return v
        }
      }
    }
  }
}
</script>
