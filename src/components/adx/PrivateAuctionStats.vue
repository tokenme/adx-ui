<template>
  <div>
    <StatsChart ref="statsChart" :title="chartTitle" :media-id="auction ? auction.adzone.media.id : mediaId" :adzone-id="auction ? auction.adzone.id : adzoneId" :auction-id="auction ? auction.id : auctionId" :height="300" show-table="true" show-stats-detail="true"></StatsChart>
  </div>
</template>

<script>
  import * as types from '../../store/mutation-types'
  import StatsChart from '../StatsChart.vue'
  export default {
    components: {
      'StatsChart': StatsChart
    },
    props: {
      mediaId: 0,
      adzoneId: 0,
      auctionId: 0,
      auction: null
    },
    computed: {
      chartTitle() {
        if (!this.auction) {
          return 'Auction Stats'
        }
        return 'Auction [' + this.auction.title + '] Status'
      }
    },
    created() {
      this.auctionId = parseInt(this.$route.params.id)
    },
    mounted() {
      if (this.auction) {
        const breadcrumb = [
          {name: 'Auctions', path: '/private-auctions'},
          {name: 'Media: ' + this.auction.adzone.media.title, path: '/media/' + this.auction.adzone.media.id},
          {name: 'AdzoneID: ' + this.auction.adzone.id, path: '/adzone/' + this.auction.adzone.id},
          {name: 'Stats'}
        ]
        this.$store.dispatch(types.UPDATE_BREADCRUMB, breadcrumb)
      }
      this.$store.dispatch(types.UPDATE_CURRENT_ROUTE, 'auctions')
    }
  }
</script>