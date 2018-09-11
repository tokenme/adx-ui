<template>
  <div>
    <Modal
        v-model="showAddPrivateAuction"
        :title="this.$t('m.adZoneTable.title')"
        :ok-text="this.$t('m.adZoneTable.okText')"
        loading
        @on-ok="onAddPrivateAuction"
        @on-visible-change="restPrivateAuction">
        <NewPrivateAuction ref="newPrivateAuction" :adzone="privateAuctionAdzone"></NewPrivateAuction>
    </Modal>
    <Card :bordered="false" :dis-hover="true" :shadow="false" :padding="16">
      <p slot="title">
        {{$t('m.adZoneTable.adZoneList')}}
      </p>
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
      <p style="padding-top:30px">
        <SearchToolbar slot="extra" ref="searchToolbar" @searchAdzones="onSearch" :show-domain="!media"></SearchToolbar>
      </p>
      <p style="text-align:center">
        <Table border :loading="loading" :columns="columns" :data="ver===true?adzones:list"></Table>
        <span style="color:#2d8cf0;display:block;margin-top:40px;cursor: pointer" @click="loadMore()">{{$t('m.adZoneTable.more')}}
          <Icon type="ios-arrow-down" />
        </span>
      </p>
    </Card>
  </div>
</template>

<script>
  import SearchToolbar from './AdzoneSearchToolbar.vue'
  import ExpendRow from './AdzoneTableExpend.vue'
  import NewPrivateAuction from './NewPrivateAuction.vue'
  import adzoneAPI from '../../api/adzone'
  export default {
    components: {
      'SearchToolbar': SearchToolbar,
      'ExpendRow': ExpendRow,
      'NewPrivateAuction': NewPrivateAuction
    },
    data() {
      return {
        ver: true,
        loading: false,
        showAddPrivateAuction: false,
        privateAuctionAdzone: null,
        list: [],
        adzones: [],
        mediaList: false,
        columns: [
          {
            title: 'ID', 
            key: 'id',
            align: 'center',
            width: 100
          }, {
            title: this.$t('m.adZoneTable.media'),
            key: 'media_name',
            align: 'center'
          }, {
            title: this.$t('m.adZoneTable.acco'),
            key: 'adzone_count',
            align: 'center',
            width: 150
          }, {
            title: this.$t('m.adZoneTable.qujian'),
            key: 'qujian',
            align: 'center',
            width: 200,
            render: (h, params) => {
              const str = params.row.low_price + '~' + params.row.high_price
              return h('span', str)
            }
          }, {
            title: this.$t('m.adZoneTable.action'),
            key: 'action',
            align: 'center',
            size: 80,
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                    icon: 'ios-eye'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: (ev) => {
                      this.onMediaClick(params.row)
                    }
                  }
                }, this.$t('m.view'))
              ])
            }
          }
        ]
      }
    },
    props: {
      media: null
    },
    computed: {
      token() {
        return this.$store.getters['token']
      }
    },
    methods: {
      loadMore() {
        this.ver = !this.ver
      },
      getAdzones(filter) {
        return new Promise((resolve, reject) => {
          const payload = {
            options: JSON.stringify(filter)
          }
          adzoneAPI.search(this.token, payload).then(res => {
            if (res && res.code) {
              reject(res)
              return
            }
            resolve(res.Data || [])
          })
        })
      },
      onSearch(filter, num) {
        this.loading = true
        if (this.media) {
          filter.media_id = this.media.id
        }
        this.getAdzones(filter).then(res => {
          this.loading = false
          this.adzones = res.slice(0, 3)
          this.list = res
        }, err => {
          this.loading = false
          if (err.code === 401) {
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
      onAdzoneClick(adzone) {
        this.$router.push({
          path: '/adzone/' + adzone.id
        })
      },
      onMediaClick(media) {
        this.$router.push({
          path: '/media/' + media.id
        })
      },
      onBuy(adzone) {
        this.privateAuctionAdzone = adzone
        this.showAddPrivateAuction = true
      },
      onAddPrivateAuction() {
        this.$refs.newPrivateAuction.submit(res => {
          this.showAddPrivateAuction = false
          this.$router.push({
            path: '/private-auctions'
          })
        }, err => {
          this.showAddPrivateAuction = false
          if (err.code === 600) {
            this.$Modal.error({title: 'Error', content: this.$t('m.adZoneTable.noenough')})
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
      this.onSearch({}, true)
    }
  }
</script>