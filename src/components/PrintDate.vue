<template>
  <span>{{ date }}</span>
</template>

<script>
function formatDate (d) {
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}
export default {
  data () {
    return {
      date: formatDate(new Date())
    }
  }
}
</script>
