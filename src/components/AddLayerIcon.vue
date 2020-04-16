<template>
  <div class="add-layer-icon">
    <q-icon
      class="add-layer-icon__layers"
      name="layers"
      size="1em"
    />
    <q-icon
      name="add"
      size="0.45em"
      class="add-layer-icon__add"
    />
  </div>
</template>

<script>
import { QIcon } from 'quasar'

export default {
  components: {
    QIcon
  }
}
</script>

<style>
.add-layer-icon {
  position: relative;
  width: 1.12em;
  height: 1.15em;
}
.add-layer-icon__layers {
  position: absolute;
  bottom: 0;
  left: 0;
}
.add-layer-icon__add {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
