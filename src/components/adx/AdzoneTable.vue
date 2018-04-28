<template>
  <div>
    <Modal
        v-model="showAddPrivateAuction"
        title="New Private Auction"
        ok-text="Submit"
        loading
        @on-ok="onAddPrivateAuction"
        @on-visible-change="restPrivateAuction">
        <NewPrivateAuction ref="newPrivateAuction" :adzone="privateAuctionAdzone"></NewPrivateAuction>
    </Modal>
    <Card :bordered="false" :dis-hover="true" :shadow="false" :padding="0">
      <p slot="title">
        Adzone List
      </p>
      <SearchToolbar slot="extra" ref="searchToolbar" @searchAdzones="onSearch" :show-domain="!media"></SearchToolbar>
      <p>
        <Table border :loading="loading" :columns="columns" :data="adzones"></Table>
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
        loading: false,
        showAddPrivateAuction: false,
        privateAuctionAdzone: null,
        adzones: [],
        columns: [
          {
            type: 'expand',
            width: 50,
            render: (h, params) => {
              return h(ExpendRow, {
                props: {
                  row: params.row
                }
              })
            }
          }, {
            title: 'ID', 
            key: 'id',
            align: 'left',
            width: 100,
            render: (h, params) => {
              return h('Poptip', {
                props: {
                  content: params.row.desc,
                  trigger: 'hover',
                  placement: 'right-start'
                }
              }, [
                h('Button', {
                  props: {
                    type: 'text'
                  },
                  on: {
                    click: (ev) => { 
                      this.onAdzoneClick(params.row)
                    }
                  }
                }, params.row.id)
              ])
            }
          }, {
            title: 'Media',
            key: 'media',
            align: 'center',
            render: (h, params) => {
              return h('Button', {
                props: {
                  type: 'text',
                  icon: 'link'
                },
                on: {
                  click: () => {
                    this.onMediaClick(params.row.media)
                  }
                }
              }, params.row.media.title)
            }
          }, {
            title: 'Size',
            key: 'size',
            align: 'center',
            width: 100,
            render: (h, params) => {
              return h('span', params.row.size.width + 'x' + params.row.size.height)
            }
          }, {
            title: 'Rolling',
            key: 'rolling',
            align: 'right',
            width: 100
          }, {
            title: 'Suggest Price (Ether/Day)',
            key: 'suggest_cpt',
            align: 'right',
            width: 200
          }, {
            title: 'Action',
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
                      this.onAdzoneClick(params.row)
                    }
                  }
                }, 'View'),
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                    icon: 'ios-cart'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.onBuy(params.row)
                    }
                  }
                }, 'Buy')
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
            resolve(res || [])
          })
        })
      },
      onSearch(filter) {
        this.loading = true
        if (this.media) {
          filter.media_id = this.media.id
        }
        this.getAdzones(filter).then(res => {
          this.loading = false
          this.adzones = res
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
      this.onSearch({})
    }
  }
</script>