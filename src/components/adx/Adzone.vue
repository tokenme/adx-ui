<template>
  <div>
    <Modal
        v-if="adzone"
        v-model="showAddPrivateAuction"
        title="New Private Auction"
        ok-text="Submit"
        loading
        @on-ok="onAddPrivateAuction"
        @on-visible-change="restPrivateAuction">
        <NewPrivateAuction ref="newPrivateAuction" :adzone="adzone"></NewPrivateAuction>
    </Modal>
    <Card v-if="adzone" :bordered="false" :dis-hover="true" :shadow="false">
      <h2 slot="title">
        {{ adzone.media.title }}[AdzoneID: {{ adzone.id }}]
      </h2>
      <a slot="extra" :href="adzone.media.domain" target="_blank">
        <Icon type="link"></Icon>
        {{ adzone.media.domain }}
      </a>
      <Button slot="extra" type="primary" size="small" icon="ios-cart" @click="onBuy" v-if="adzone.online_status==1 && adzone.media.online_status==1">Buy</Button>
      <Row type="flex" justify="space-between">
        <Col span="10">
          <p>{{ adzone.desc }}</p>
          <Row type="flex" justify="start" :gutter="30">
            <Col>Size: {{ adzone.size.width }}x{{ adzone.size.height }}</Col>
            <Col>Rolling: {{ adzone.rolling }}</Col>
            <Col>Suggest Price: {{ adzone.suggest_cpt }} Ether/Day</Col>
          </Row>
        </Col>
        <Col span="12">
          <vue-calendar :events="events" :disabled="disabled" :height="250"></vue-calendar>
        </Col>
      </Row>
    </Card>
    <StatsChart ref="statsChart" title="Adzone Stats" :media-id="adzone.media.id" :adzone-id="adzone.id" :height="300" v-if="adzone"></StatsChart>
    <AuctionTable ref="auctionTable" :media-id="adzone.media.id" :adzone-id="adzone.id" :adzone="adzone" v-if="adzone"></AuctionTable>
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
        adzone: null
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
              title: 'unavailable'
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
            title: 'unavailable'
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
          const breadcrumb = [
            {name: 'Dashboard', path: '/'},
            {name: 'Media: ' + this.adzone.media.title, path: '/media/' + this.adzone.media.id},
            {name: 'AdzoneID: ' + this.adzone.id, path: '/adzone/' + this.adzone.id}
          ]
          this.$store.dispatch(types.UPDATE_BREADCRUMB, breadcrumb)
        })
      },
      onBuy() {
        this.showAddPrivateAuction = true
      },
      onAddPrivateAuction() {
        this.$refs.newPrivateAuction.submit(res => {
          this.showAddPrivateAuction = false
          this.auctionTable.onSearch()
        }, err => {
          this.showAddPrivateAuction = false
          if (err.code === 600) {
            this.$Modal.error({title: 'Error', content: 'You don\'t have enough balance, please deposit before making order.'})
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