<template>
  <div>
    <popup-base :row="row" @update-popup-size="$emit('update-popup-size')" />
  </div>
</template>

<script>
import PopupBase from './PopupBase'

export default {
  components: {
    PopupBase
  }
}
</script>
