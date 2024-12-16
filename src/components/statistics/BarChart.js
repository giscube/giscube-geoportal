import { Bar, mixins } from 'vue-chartjs'

export default {
  extends: Bar,
  mixins: [mixins.reactiveProp, mixins.reactiveData],
  props: ['chartData', 'options'],
  mounted () {
    // Overwriting base render method with actual data.
    this.renderChart(this.chartData, this.options)
  },
  methods: {},
  watch: {}
}
