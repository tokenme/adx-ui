<script>
    import VueChartJs from 'vue-chartjs'
    const { reactiveProp } = VueChartJs.mixins
    export default {
      extends: VueChartJs.Pie,
      mixins: [reactiveProp],
      props: ['chartData', 'options'],
      mounted () {
        this.renderChart(this.chartData, this.options)
      }
    }
</script>