<template>
  <div>
    <Card :bordered="false" :dis-hover="true" :shadow="false" :padding="0">
      <p slot="title">
        Private Auction List
      </p>
      <SearchToolbar slot="extra" ref="searchToolbar" @searchPrivateAuctions="onSearch"></SearchToolbar>
      <p>
        <Table border :loading="loading" :columns="columns" :data="auctions">
          <div slot="footer" style="margin: 0 10px">
            <Page :total="total" :page-size="page_size" :current.sync="page" show-total transfer @on-change="onSearch"></Page>
          </div>
        </Table>
      </p>
    </Card>
  </div>
</template>

<script>
  import SearchToolbar from './PrivateAuctionSearchToolbar.vue'
  import ExpendRow from './PrivateAuctionTableExpend.vue'
  import privateAuctionAPI from '../../api/private-auction'
  import moment from 'moment'

  export default {
    components: {
      'SearchToolbar': SearchToolbar,
      'ExpendRow': ExpendRow
    },
    data() {
      return {
        loading: false,
        total: 0,
        page: 1,
        page_size: 20,
        auctions: [],
        rejectReason: '',
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
            width: 100
          }, {
            title: 'Title', 
            key: 'title',
            align: 'left',
            width: 200
          }, {
            title: 'Ether/Day', 
            key: 'price',
            align: 'right',
            width: 120
          }, {
            title: 'Total Cost', 
            key: 'cost',
            align: 'right',
            width: 100,
            render: (h, params) => {
              return h('span', params.row.cost + ' Ether')
            }
          }, {
            title: 'Days', 
            key: 'start_time',
            align: 'right',
            width: 80,
            render: (h, params) => {
              const startTime = moment(params.row.start_time)
              const endTime = moment(params.row.end_time).add(1, 'days')
              return h('span', endTime.from(startTime, true))
            }
          }, {
            title: 'Date Range', 
            key: 'start_time',
            align: 'left',
            width: 150,
            render: (h, params) => {
              const startTime = moment(params.row.start_time)
              const endTime = moment(params.row.end_time)
              return h('div', [
                h('div', 'From: ' + startTime.format('YYYY-MM-DD')),
                h('div', '  To: ' + endTime.format('YYYY-MM-DD'))
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
                    this.onMediaClick(params.row.adzone.media)
                  }
                }
              }, params.row.adzone.media.title)
            }
          }, {
            title: 'Size',
            key: 'size',
            align: 'center',
            width: 100,
            render: (h, params) => {
              return h('span', params.row.adzone.size.width + 'x' + params.row.adzone.size.height)
            }
          }, {
            title: 'Audit Status',
            key: 'audit_status',
            align: 'center',
            width: 120,
            render: (h, params) => {
              return this.AuditStatusDisplay(h, params.row)
            }
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
                    icon: 'ios-checkmark',
                    disabled: params.row.audit_status !== 0
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.onDeal(params.row)
                    }
                  }
                }, 'Deal'),
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small',
                    icon: 'ios-close',
                    disabled: params.row.audit_status !== 0
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.onReject(params.row)
                    }
                  }
                }, 'Reject')
              ])
            }
          }
        ]
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
      }
    },
    methods: {
      AuditStatusDisplay(h, auction) {
        if (auction.audit_status === 0) {
          return h('Tag', 'Waiting')
        } else if (auction.audit_status === 1) {
          return h('Tag', {props: {color: 'green'}}, 'Deal')
        } else if (auction.audit_status === 2) {
          return h('Tag', {props: {color: 'red'}}, 'Rejected')
        }
      },
      getAuctions(filter) {
        return new Promise((resolve, reject) => {
          const payload = {
            audit_status: filter.auditStatus,
            media_id: this.mediaId,
            adzone_id: this.adzoneId,
            auction_id: this.auctionId,
            page: this.page
          }
          privateAuctionAPI.list(this.token, payload).then(res => {
            if (res && res.code) {
              reject(res)
              return
            }
            resolve(res)
          })
        })
      },
      onSearch() {
        const filter = this.$refs.searchToolbar.filter
        this.loading = true
        this.getAuctions(filter).then(res => {
          this.loading = false
          this.total = res.total
          this.page = res.page
          this.page_size = res.page_size
          this.auctions = res.auctions || []
          this.$emit('update')
        }, err => {
          this.loading = false
          if (err.code === 401) {
            this.$router.push({
              path: '/login',
              query: {
                redirect: this.$route.fullPath
              }
            })
          }
          this.$Message.error(err.message || 'unknown error')
        })
      },
      onMediaClick(media) {
        this.$router.push({
          path: '/media/' + media.id
        })
      },
      auditAuction(payload) {
        return new Promise((resolve, reject) => {
          privateAuctionAPI.audit(this.token, payload).then(res => {
            if (res && res.code) {
              reject(res)
              return
            }
            resolve(res)
          })
        })
      },
      onDeal(auction) {
        if (auction.audit_status !== 0) {
          return
        }
        this.$Modal.confirm({
          title: 'Warning',
          content: '<p>If you confirmed this deal, all the other auctions which date range is overlapping to this one will be rejected in this adzone</p>',
          loading: true,
          okText: 'Yes',
          cancelText: 'No',
          onOk: () => {
            this.auditAuction({id: auction.id, audit_status: 1}).then(res => {
              this.$Modal.remove()
              this.onSearch()
            }, err => {
              this.$Modal.remove()
              if (err.code === 401) {
                this.$router.push({
                  path: '/login',
                  query: {
                    redirect: this.$route.fullPath
                  }
                })
              }
              this.$Message.error(err.message || 'unknown error')
            })
          }
        })
      },
      onReject(auction) {
        if (auction.audit_status !== 0) {
          return
        }
        this.$Modal.confirm({
          title: 'Warning',
          render: (h) => {
            return h('div', [
              h('Alert', {
                props: {
                  type: 'warning'
                }
              }, 'The rejected auction could not be recovered, are you sure to reject this one?'),
              h('Input', {
                props: {
                  value: this.rejectReason,
                  autofocus: true,
                  placeholder: 'Please enter reject reason...'
                },
                on: {
                  input: (val) => {
                    this.rejectReason = val;
                  }
                }
              })
            ])
          },
          loading: true,
          okText: 'Yes',
          cancelText: 'No',
          onOk: () => {
            if (this.rejectReason === '') {
              this.$Modal.remove()
              this.$Message.error('missin reject reason')
              return
            }
            this.auditAuction({id: auction.id, audit_status: 2, reject_reason: this.rejectReason}).then(res => {
              this.$Modal.remove()
              this.onSearch()
            }, err => {
              this.$Modal.remove()
              if (err.code === 401) {
                this.$router.push({
                  path: '/login',
                  query: {
                    redirect: this.$route.fullPath
                  }
                })
              }
              this.$Message.error(err.message || 'unknown error')
            })
          }
        })
      }
    },
    mounted() {
      this.onSearch()
    }
  }
</script>