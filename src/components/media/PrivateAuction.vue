<template>
  <div>
    <Card v-if="adzone" :bordered="false" :dis-hover="true" :shadow="false">
      <h2 slot="title">
        {{ adzone.media.title }}{{$t('m.prau.ad')}} {{ adzone.id }}
      </h2>
      <a slot="extra" :href="adzone.media.domain" target="_blank">
        <Icon type="link"></Icon>
        {{ adzone.media.domain }}
      </a>
      <Button slot="extra" type="primary" size="small" icon="ios-cart" @click="onBuy" v-if="adzone.online_status==1 && adzone.media.online_status==1">{{$t('m.prau.buy')}}</Button>
      <Row type="flex" justify="space-between">
        <Col span="10">
          <p>{{ adzone.desc }}</p>
          <Row type="flex" justify="start" :gutter="30">
            <Col>{{$t('m.prau.size')}} {{ adzone.size.width }}x{{ adzone.size.height }}</Col>
            <Col>{{$t('m.prau.rol')}} {{ adzone.rolling }}</Col>
            <Col>{{$t('m.prau.sug')}} {{ adzone.suggest_cpt }} {{$t('m.prau.ed')}}</Col>
          </Row>
          <a :href="adzone.placeholder.url" target="_blank" v-if="adzone.placeholder">
            <img :src="adzone.placeholder.img_url" :style="imgStyle" />
          </a>
        </Col>
        <Col span="12">
          <vue-calendar :events="calEvents" :disabled="calDisabled" :height="250"></vue-calendar>
        </Col>
      </Row>
    </Card>
    <StatsChart ref="statsChart" :title="(auctionId > 0 ? this.$t('m.prau.acu'): (adzoneId > 0 ? this.$t('m.prau.Ad') : (mediaId > 0 ? this.$t('m.prau.me') : this.$t('m.prau.Ac')) ) ) + this.$t('m.prau.st')" :media-id="mediaId" :adzone-id="adzoneId" :auction-id="auctionId" :height="300"></StatsChart>
    <Gantt :events="events" :read-only="true" :start-period="startPeriod" :end-period="endPeriod" @selected="handleSelect"></Gantt>
    <AuctionTable ref="auctionTable" :media-id="mediaId" :adzone-id="adzoneId" :auction-id.sync="auctionId" @update="onAuctionsUpdate"></AuctionTable>
  </div>
</template>

<script>
  import * as types from '../../store/mutation-types'
  import AuctionTable from './PrivateAuctionTable.vue'
  import Gantt from '../Gantt.vue'
  import StatsChart from '../StatsChart.vue'
  import privateAuctionAPI from '../../api/private-auction'
  import adzoneAPI from '../../api/adzone'
  import moment from 'moment'

  export default {
    components: {
      'AuctionTable': AuctionTable,
      'Gantt': Gantt,
      'StatsChart': StatsChart
    },
    data() {
      return {
        adzone: null,
        auctions: [],
        startPeriod: moment(),
        endPeriod: moment().add('2', 'month')
      }
    },
    props: {
      mediaId: 0,
      adzoneId: 0,
      auctionId: 0
    },
    computed: {
      token() {
        return this.$store.getters['token']
      },
      imgStyle() {
        if (this.adzone.size.width >= this.adzone.size.height) {
          return { width: '200px', height: Math.floor(200 * this.adzone.size.height / this.adzone.size.width) + 'px' }
        }
        return { width: Math.floor(100 * this.adzone.size.width / this.adzone.size.height) + 'px', height: '100px' }
      },
      calDisabled() {
        return {
          to: moment().toDate(),
          from: moment().add(2, 'months').toDate()
        }
      },
      calEvents() {
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
              title: this.$t('m.prau.unav')
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
            title: this.$t('m.prau.unav')
          })
        }
        return events
      },
      events() {
        let events = []
        for (const i of this.auctions) {
          const duration = moment(i.end_time).diff(moment(i.start_time), 'days')
          const event = {
            title: i.title + ',' + this.$t('m.prau.toco') + i.cost + ', ' + i.price + this.$t('m.prau.eth') + ', ' + duration + this.$t('m.prau.days'),
            offset: moment(i.start_time).diff(moment(), 'days'),
            duration: duration,
            status: i.audit_status === 0 ? 'in_progress' : 'active',
            readOnly: true
          }
          events.push(event)
        }
        return events
      }
    },
    methods: {
      handleSelect(event) {
        const auction = this.auctions[event.event_index]
        this.$router.push({
          path: '/private-auctions',
          query: {
            media_id: auction.adzone.media.id,
            adzone_id: auction.adzone.id,
            auction_id: auction.id
          }
        })
      },
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
          const breadcrumb = [
            {name: 'Dashboard', path: '/'},
            {name: 'Media: ' + this.adzone.media.title, path: '/media/' + this.adzone.media.id},
            {name: 'AdzoneID: ' + this.adzone.id, path: '/private-auctions'}
          ]
          this.$store.dispatch(types.UPDATE_BREADCRUMB, breadcrumb)
        })
      },
      getEvents() {
        return new Promise((resolve, reject) => {
          const payload = {
            media_id: this.mediaId,
            adzone_id: this.adzoneId
          }
          privateAuctionAPI.events(this.token, payload).then(res => {
            if (res && res.code) {
              reject(res)
              return
            }
            resolve(res)
          })
        })
      },
      onAuctionsUpdate() {
        this.eventsRefresh()
      },
      eventsRefresh() {
        this.getEvents().then(res => {
          this.auctions = res || []
        }, err => {
          if (err.code === 401) {
            this.$router.push({
              path: '/login',
              query: {
                redirect: this.$route.fullPath
              }
            })
          }
          this.$Message.error(err.message || 'Unknown error')
        })
      }
    },
    mounted() {
      this.getAdzone()
      this.eventsRefresh()
      this.$store.dispatch(types.UPDATE_CURRENT_ROUTE, 'auctions')
    }
  }
</script>