<template>
  <div class="hello">
    <p class="hello-title">Giscube Geoportal</p>
    <p>Useful links</p>
    <ul>
      <li><a href="https://www.giscube.com" target="_blank">Giscube</a></li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'HelloPanel',
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
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

.hello {
    padding: 15px;
}
.hello-title {
  font-size: 1.5em;
}

</style>
