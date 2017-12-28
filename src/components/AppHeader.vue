<template>
  <div class="navbar navbar-default navbar-fixed-top">
    <div class="container">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="#">{{ brand }}</a>
      </div>
      <div class="collapse navbar-collapse">
        <form @submit="submit" id="search_form" class="navbar-form navbar-left" role="search">
          <div class="input-group">
              <input ref="search_input" id="search_input" type="text" class="form-control" placeholder="Search"
                     style="width: 400px">
              <span class="input-group-btn">
                <button class="btn btn-default" type="submit">
                  <span class="glyphicon glyphicon-search"></span>
                </button>
              </span>
          </div><!-- /input-group -->
        </form>
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
    submit (event) {
      event.preventDefault()
      let q = this.$refs.search_input.value
      this.$store.commit('setAutoselectResult', true)
      this.$emit('search-start', q)
    }
  }
}
</script>

<style>
</style>
