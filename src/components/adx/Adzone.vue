<template>
  <div>
    <Modal
        v-if="adzone"
        v-model="showAddPrivateAuction"
        :title="this.$t('m.adZone.title')"
        :ok-text="this.$t('m.adZone.okText')"
        loading
        @on-ok="onAddPrivateAuction"
        @on-visible-change="restPrivateAuction">
        <NewPrivateAuction ref="newPrivateAuction" :adzone="adzone"></NewPrivateAuction>
    </Modal>
    <Card v-if="adzone" :bordered="false" :dis-hover="true" :shadow="false" style="height:520px">
      <p slot="title">{{$t('m.adZone.ad')}}</p>
      <p>
        <div style="display:flex;justify-content:space-around">
          <div style="height:410px;background:#fff;width:500px">
            <p class="show">{{adzone.intro}}</p>
            <p class="show">{{$t('m.adZone.po')}}：<span>{{adzone.location}}</span></p>
            <p class="show">{{$t('m.adZone.fl')}}: <span>{{adzone.traffic}} {{$t('m.adZone.vi')}}</span></p>
            <p class="show">{{$t('m.adZone.of')}}：<span>{{adzone.min_cpt}} ETH/天</span></p>
            <p class="show">{{$t('m.adZone.si')}}：<span>{{size.width}} x {{size.height}}</span></p>
            <p class="show"> {{$t('m.adZone.ae')}}：<span>{{adzone.advantage}}</span></p>
            <div style="width:100%;text-align:center">
              <Button slot="extra" type="primary" size="small" icon="ios-cart" @click="onBuy" v-if="adzone.online_status==1 && adzone.media.online_status==1" style="width:120px;height:34px;border-radius:5px">{{$t('m.adZone.buy')}}</Button>
            </div>
          </div>
          <div style="width:390px;height:410px">
            <div v-if="adzone.placeholder != null">
              <img :src="adzone.placeholder.img_url" alt="" style="width:390px;height:410px">
            </div>
            <p v-else style="font-size:16px;line-height:410px">暂无广告位图示 ~</p>
          </div>
        </div>
      </p>
    </Card>
    <StatsChart ref="statsChart" :title="this.$t('m.adZone.adzoneStats')" :media-id="media.id" :adzone-id="adzone.id" :height="300" v-if="adzone" style="margin-top:15px"></StatsChart>
  </div>
</template>

<script>
  import * as types from '../../store/mutation-types'
  import AuctionTable from './PrivateAuctionTable.vue'
  import NewPrivateAuction from './NewPrivateAuction.vue'
  import StatsChart from '../StatsChart.vue'
  import adzoneAPI from '../../api/adzone'
  import moment from 'moment'
  export default {
    components: {
      'NewPrivateAuction': NewPrivateAuction,
      'AuctionTable': AuctionTable,
      'StatsChart': StatsChart
    },
    data() {
      return {
        spinShow: false,
        showAddPrivateAuction: false,
        adzoneId: 0,
        adzone: {},
        size: {},
        media: {}
      }
    },
    computed: {
      token() {
        return this.$store.getters['token']
      },
      disabled() {
        return {
          to: moment().toDate(),
          from: moment().add(2, 'months').toDate()
        }
      },
      events() {
        if (!this.adzone.unavailable_days) {
          return []
        }
        let events = []
        let start = null
        let end = null
        for (const day of this.adzone.unavailable_days) {
          const date = moment(day)
          if (!start) {
            start = date
          } else if (end && date.diff(end, 'days') > 1) {
            events.push({
              start: start.toDate(),
              end: end.toDate(),
              title: this.$t('m.adZone.unavailable')
            })
            start = date
            end = date
          } else {
            end = date
          }
        }
        if (end.diff(start, 'days') >= 1) {
          events.push({
            start: start.toDate(),
            end: end.toDate(),
            title: this.$t('m.adZone.unavailable')
          })
        }
        return events
      }
    },
    methods: {
      getAdzone() {
        if (!this.adzoneId) {
          return
        }
        this.spinShow = true
        adzoneAPI.info(this.token, this.adzoneId).then(res => {
          this.spinShow = false
          if (res && res.code) {
            if (res.code === 401) {
              this.$router.push({
                path: '/login',
                query: {
                  redirect: this.$route.fullPath
                }
              })
              return
            }
            this.$Message.error(res.message || 'unknown error')
            return
          }
          this.adzone = res
          this.size = res.size
          this.media = res.media
        })
      },
      onBuy() {
        this.showAddPrivateAuction = true
      },
      onAddPrivateAuction() {
        this.$refs.newPrivateAuction.submit(res => {
          this.showAddPrivateAuction = false
          // this.auctionTable.onSearch()
        }, err => {
          this.showAddPrivateAuction = false
          if (err.code === 600) {
            this.$Modal.error({title: 'Error', content: this.$t('m.adZone.noenough')})
            return
          } else if (err.code === 401) {
            this.$router.push({
              path: '/login',
              query: {
                redirect: this.$route.fullPath
              }
            })
            return
          }
          this.$Message.error(err.message || 'unknown error')
        })
      },
      restPrivateAuction() {
        this.$refs.newPrivateAuction.reset()
      }
    },
    mounted() {
      this.adzoneId = parseInt(this.$route.params.id)
      if (this.adzoneId) {
        this.getAdzone()
      }
      this.$store.dispatch(types.UPDATE_CURRENT_ROUTE, 'dashboard')
    }
  }
</script>
<style lang="scss" scoped>
.show{
  margin-bottom: 30px;
  font-size: 18px;
  color:#4d4d4d;
  span{
    font-size: 14px;
    color: #7a7a7a
  }
}
</style>
