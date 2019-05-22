<template>
  <div>
    <div>{{ message }}</div>
    <div class="tools">
      <q-btn flat dense
        icon="delete"
        @click="$emit('close')"
      />
    </div>
  </div>
</template>

<script>
import { QBtn } from 'quasar'

export default {
  props: ['message'],
  components: {
    QBtn
  }
}
</script>

<style scoped>
.tools {
  border-top: 1px dashed #ddd;
  margin-top: 10px;
  padding: 8px 0px 0px 0px;
}
</style>
