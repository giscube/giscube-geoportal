<template>
  <div class="row no-wrap">
      <!-- Back -->
      <div>
        <q-btn
          :disable="value <= 0"
          flat
          dense
          icon="mdi-chevron-double-left"
          @click="$emit('input', 0)"
        />
        <q-btn
          :disable="value <= 0"
          flat
          dense
          icon="mdi-chevron-left"
          @click="$emit('input', value - 1)"
        />
      </div>
      <!-- Current -->
      <span class="col q-ma-sm text-center"><slot>{{value + 1}}/{{length}}</slot></span>
      <!-- Forward -->
      <div>
        <q-btn
          :disable="value >= length - 1"
          flat
          dense
          icon="mdi-chevron-right"
          @click="$emit('input', value + 1)"
        />
        <q-btn
          :disable="value >= length - 1"
          flat
          dense
          icon="mdi-chevron-double-right"
          @click="$emit('input', length - 1)"
        />
      </div>
  </div>
</template>

<script>
import { QBtn } from 'quasar'

export default {
  props: ['value', 'length'],
  components: {
    QBtn
  }
}
</script>
