<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
require('./css/print.styl')

export default {
  name: 'App'
}
</script>

<style>
#q-app {
  font-family: "Helvetica Neue", Arial, Helvetica, sans-serif;
}
</style>
