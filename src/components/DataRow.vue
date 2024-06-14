<template>
  <div
    v-if="(label && label.length > 70) || (value && value.length > 70 && !hasHTML)"
    :class="`q-py-xs ${classes}`"
  >
    <div class="title">{{ label }}</div>
    <div class="value">{{ value }}</div>
  </div>
  <div
    v-else-if="value && value.length > 85 && hasHTML"
    :class="`q-py-xs ${classes}`"
  >
    <div class="title">{{ label }}</div>
    <span v-html="value" class="value"></span>
  </div>
  <div v-else :class="`row justify-between q-py-xs ${classes}`">
    <div class="col-5 title">{{ label }}</div>
    <span v-if="value && hasHTML" v-html="value" class="col-6 text-right value"></span>
    <div v-else class="col-7 text-right value">{{ value }}</div>
  </div>
</template>

<script>
// row of an element with a label and a value
export default {
  name: 'RowData',
  props: ['element', 'rowClass'],
  computed: {
    field () {
      return this.element
    },
    classes () {
      return this.rowClass || 'line-bottom'
    },
    hasHTML () {
      return !!this.value.includes && this.value.includes('<span')
    },
    label () {
      return this.formatString(this.element.label)
    },
    value () {
      return this.formatString(this.element.value)
    }
  },
  methods: {
    formatString (value) {
      if (!value) {
        return '-'
      }
      if (typeof value === 'string') {
        value = value.trim()
        return value[0].toUpperCase() + value.slice(1).replaceAll('_', ' ')
      } else {
        return value
      }
    }
  }
}
</script>

<style lang="scss" scoped>
div {
  font-size: 12px;
}
.title {
  font-weight: bold;
}
.value {
  color: grey
}
.line-top {
  border-top: 1px solid rgba(0,0,0,.15);
}
.line-bottom {
  border-bottom: 1px solid rgba(0,0,0,.15);
}
</style>
