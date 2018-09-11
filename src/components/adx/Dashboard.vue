<template>
  <div>
    <StatsChart ref="statsChart" :title="this.$t('m.dashtit')" :height="300"></StatsChart>
    <div style="margin-top:15px">
      <div style="width:855px;float:left">
        <div>
          <AdzoneTable ref="adzoneTable" ></AdzoneTable>
        </div>
        <!-- <div style="margin-top:15px;height:275px;background:#fff">
          <Card :dis-hover='true'>
            <p slot="title">{{$t('m.candy')}}</p>
            <p style="width:823px;height:182px">
              <Carousel  :v-model="0" loop>
                <CarouselItem>
                    <img style="width:823px" src="https://static.tianxi100.com/tmm/adx/bt.jpg" alt="">
                </CarouselItem>
                <CarouselItem>
                    <img style="width:823px" src="https://static.tianxi100.com/tmm/adx/us.jpg" alt="">
                </CarouselItem>
              </Carousel>
            </p>
          </Card>
        </div> -->
      </div>
      <div style="width:330px;float:right">
        <slider-bar></slider-bar>
      </div>
    </div>
  </div>
</template>

<script>
  import * as types from '../../store/mutation-types'
  import AdzoneTable from './AdzoneTable.vue'
  import StatsChart from '../StatsChart.vue'
  import SliderBar from './SliderBar.vue'
  export default {
    components: {
      'AdzoneTable': AdzoneTable,
      'StatsChart': StatsChart,
      'SliderBar': SliderBar
    },
    mounted() {
      this.$store.dispatch(types.UPDATE_CURRENT_ROUTE, 'dashboard')
    }
  }
</script>