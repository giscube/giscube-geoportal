<template>
  <div class="navbar navbar-default navbar-fixed-top">
    <div class="container">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="#" v-html="brand"></a>
      </div>
      <div class="collapse navbar-collapse">
      </div><!--/.nav-collapse -->
    </div>
  </div>
</template>

<script>
export default {
  props: [
    'brand'
  ],
  data () {
    return {}
  },
  methods: {

  }
}
</script>

<style>
</style>
