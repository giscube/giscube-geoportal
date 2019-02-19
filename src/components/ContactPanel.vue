<template>
  <div class="panel">

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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  margin: 0 10px;
}
a {
  color: #42b983;
}
.contact-title {
  font-weight: bold;
}
</style>
