<template>
  <div class='popup'>
    <div v-if="!renderContents" class='title'>{{ title }}</div>
    <popup-data
      :feature="feature"
      :render-contents="renderContents"
    ></popup-data>
  </div>
</template>

<script>
import PopupData from './PopupData'

export default {
  props: ['feature', 'title', 'renderContents'],
  components: {
    PopupData
  }
}
</script>

<style scoped lang="scss">
.popup .title {
  font-size: 1.2em;
  font-weight: bold;
  min-width: 200px;
  margin-bottom: 8px;
}

.layer .title {
  font-size: 1.2em;
  font-weight: bold;
  min-width: 200px;
}

.layer .feature {
  font-weight: bold;
  border-bottom: 3px solid #aaa;
  margin-bottom: 20px;
}

.layer .feature:last-child {
  border-bottom: 0px;
  margin-bottom: 0px;
}

</style>
