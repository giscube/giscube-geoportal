<template>
  <div class="panel contact-panel">

    <div class="panel-content">

      <p class="panel-title">Contact</p>

      <p style="margin-left: 10px">Support: <a href="mailto:contact@example.com">contact@example.com</a>

      <p style="margin-left: 10px">
        <span class="contact-title">Giscube Organisation</span><br>
        <br>
        <a href="https://www.github.com/giscube" target="_blank">Giscube at GitHub</a><br>
      </p>

    </div>
  </div>
</template>

<script>
export default {
  name: 'ContactPanel',
  data () {
    return {
    }
  }
}
</script>

<style lang="scss">
.contact-panel {
  .contact-title {
    font-weight: bold;
  }
}
</style>
