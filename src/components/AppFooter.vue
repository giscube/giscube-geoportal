<template>
  <q-footer elevated class="app-footer">
    <div class="container">
    </div>
  </q-footer>
</template>

<script>
import { QFooter } from 'quasar'

export default {
  components: {
    QFooter
  },
  data () {
    return {}
  }
}
</script>

<style lang="scss">
.app-footer {
  background-color: #f5f5f5;
  color: #444;
  z-index: 4000;
}

.app-footer > .container {
  padding-left: 15px;
  padding-right: 15px;
}
</style>
