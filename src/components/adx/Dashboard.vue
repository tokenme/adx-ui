<template>
  <div>
    <StatsChart ref="statsChart" :title="this.$t('m.dashtit')" :height="300"></StatsChart>
    <div style="margin-top:15px">
      <div style="width:70%;float:left">
        <div>
          <AdzoneTable ref="adzoneTable" ></AdzoneTable>
        </div>
        <div style="margin-top:15px;height:275px;background:#fff">
          <Card :dis-hover='true'>
            <p slot="title">{{$t('m.candy')}}</p>
            <p style="width:100%">
              <Carousel  :v-model="0" loop style="width:100%">
                <CarouselItem>
                  <!-- <a @click="goto"> -->
                    <img style="width:100%" src="https://static.tianxi100.com/tmm/adx/bt.jpg" alt="">
                  <!-- </a> -->
                </CarouselItem>
                <CarouselItem>
                  <!-- <a @click="goto"> -->
                    <img style="width:100%" src="https://static.tianxi100.com/tmm/adx/us.jpg" alt="">
                  <!-- </a> -->
                </CarouselItem>
              </Carousel>
            </p>
          </Card>
        </div>
      </div>
      <div style="width:25%;float:right">
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
    // methods: {
    //   goto() {
    //     this.$router.push({path: '/newairdrops'})
    //   }
    // },
    mounted() {
      this.$store.dispatch(types.UPDATE_CURRENT_ROUTE, 'dashboard')
    }
  }
</script>