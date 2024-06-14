<template>
  <div
    v-if="(element.label && element.label.length > 70) || (element.value && element.value.length > 70 && !hasHTML)"
    :class="`q-py-xs ${classes}`"
  >
    <div class="title">{{ element.label }}</div>
    <div class="value">
      {{ element.value }}
      <q-btn
        v-if="element.subelement"
        :icon="expand ? 'remove' : 'add'"
        flat dense
        size="xs"
        @click="expand = !expand"
      />
    </div>
    <div v-if="expand" class="value">
      {{ element.subelement }}
    </div>
  </div>
  <div v-else :class="`row justify-between q-py-xs ${classes}`">
    <div class="col-6 title">{{ element.label }}</div>
    <span v-if="element.value && hasHTML" class="col-6 text-right value">
      <span v-html="element.value"></span>
      <q-btn
        v-if="element.subelement"
        :icon="expand ? 'remove' : 'add'"
        flat dense
        size="xs"
        @click="expand = !expand"
      />
    </span>
    <div v-else class="col-6 text-right value">
      {{ element.value }}
      <q-btn
        v-if="element.subelement"
        :icon="expand ? 'remove' : 'add'"
        flat dense
        size="xs"
        @click="expand = !expand"
      />
    </div>
    <div v-if="expand" class="value">
      <span v-if="subelementHasHTML" v-html="element.subelement" class="text-left value"></span>
      <span v-else>{{ element.subelement }}</span>
    </div>
  </div>
</template>

<script>
import { QBtn } from 'quasar'

export default {
  name: 'RowDades',
  props: ['element', 'rowClass', 'expand'],
  components: {
    QBtn
  },
  computed: {
    classes () {
      return this.rowClass || 'line-top'
    },
    hasHTML () {
      return !!this.element.value.includes && this.element.value.includes('<span')
    },
    subelementHasHTML () {
      return !!this.element.subelement.includes && this.element.subelement.includes('<span')
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
