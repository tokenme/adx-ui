<template>
  <div>
    <AuctionTable ref="auctionTable" :media-id="adonze ? adzone.media.id : mediaId" :adzone-id="adzone ? adzone.id : adzoneId" :adzone="adzone" ></AuctionTable>
  </div>
</template>

<script>
  import * as types from '../../store/mutation-types'
  import AuctionTable from './PrivateAuctionTable.vue'
  export default {
    components: {
      'AuctionTable': AuctionTable
    },
    props: {
      mediaId: 0,
      adzoneId: 0,
      adzone: null
    },
    mounted() {
      this.$store.dispatch(types.UPDATE_CURRENT_ROUTE, 'auctions')
    }
  }
</script>