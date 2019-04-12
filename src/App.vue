<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import { notifyError } from './lib/notifications'
require('./assets/print.css')

window.addEventListener('error', function (event) {
  notifyError(event.error)
})

export default {
  name: 'App'
}
</script>

<style>
#q-app {
  font-family: "Helvetica Neue", Arial, Helvetica, sans-serif;
}
</style>
