<template>
  <div>
    <StatsChart ref="statsChart" :title="this.$t('m.dashtit')" :height="300"></StatsChart>
    <AdzoneTable ref="adzoneTable" ></AdzoneTable>
  </div>
</template>

<script>
  import * as types from '../../store/mutation-types'
  import AdzoneTable from './AdzoneTable.vue'
  import StatsChart from '../StatsChart.vue'
  export default {
    components: {
      'AdzoneTable': AdzoneTable,
      'StatsChart': StatsChart
    },
    mounted() {
      this.$store.dispatch(types.UPDATE_CURRENT_ROUTE, 'dashboard')
    }
  }
</script>