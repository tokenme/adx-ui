<template>
  <div>
    <Card :bordered="false" :dis-hover="true" :shadow="false" :padding="0">
      <p slot="title">
        Private Auction List
      </p>
      <SearchToolbar slot="extra" ref="searchToolbar" @searchPrivateAuctions="onSearch"></SearchToolbar>
      <p>
        <EditableTable border :loading="loading" :columns-list="columns" :value="auctions" :hover-show="true" :edit-incell="true" :row-class-name="rowClassName" @on-cell-change="handleEdit">
          <div slot="footer" style="margin: 0 10px">
            <Page :total="total" :page-size="page_size" :current.sync="page" show-total transfer @on-change="onSearch"></Page>
          </div>
        </EditableTable>
      </p>
    </Card>
  </div>
</template>

<script>
  import SearchToolbar from './PrivateAuctionSearchToolbar.vue'
  import ExpendRow from './PrivateAuctionTableExpend.vue'
  import EditableTable from '../EditableTable.vue'
  import privateAuctionAPI from '../../api/private-auction'
  import moment from 'moment'

  export default {
    components: {
      'SearchToolbar': SearchToolbar,
      'ExpendRow': ExpendRow,
      'EditableTable': EditableTable
    },
    data() {
      return {
        loading: false,
        total: 0,
        page: 1,
        page_size: 20,
        auctions: [],
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
            width: 200,
            editable: true
          }, {
            title: 'Ether/Day', 
            key: 'price',
            align: 'right',
            width: 120,
            editable: true
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
              return h('Button', {
                props: {
                  type: 'text'
                },
                on: {
                  click: () => {
                    this.onAdzoneClick(params.row.adzone)
                  }
                }
              }, params.row.adzone.size.width + 'x' + params.row.adzone.size.height)
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
              if (params.row.audit_status === 1) {
                return h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                    icon: 'stats-bar'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.onShowStats(params.row)
                    }
                  }
                }, 'Stats')
              } else if (params.row.online_status === 1) {
                return h('Button', {
                  props: {
                    type: 'error',
                    size: 'small',
                    icon: 'ios-trash',
                    disabled: params.row.audit_status !== 0
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.onCancel(params.row)
                    }
                  }
                }, 'Cancel')
              }
              return h('Tag', {
                props: {
                  color: 'red'
                }
              }, 'Deleted')
            }
          }
        ]
      }
    },
    props: {
      mediaId: 0,
      adzoneId: 0,
      adzone: null
    },
    computed: {
      token() {
        return this.$store.getters['token']
      }
    },
    methods: {
      rowClassName (row, index) {
        return moment(row.end_time).isBefore(moment(), 'day') ? 'muted' : ''
      },
      AuditStatusDisplay(h, auction) {
        if (auction.audit_status === 0) {
          return h('Tag', 'Waiting')
        } else if (auction.audit_status === 1) {
          return h('Tag', {props: {color: 'green'}}, 'Deal')
        } else if (auction.audit_status === 2) {
          return h('Tag', {props: {color: 'red'}}, 'Rejected')
        } else if (moment(auction.end_time).isBefore(moment(), 'day')) {
          return h('Tag', {props: {color: 'border'}}, 'Completed')
        }
      },
      getAuctions(filter) {
        return new Promise((resolve, reject) => {
          const payload = {
            media_id: this.adzone ? this.adzone.media.id : this.mediaId,
            adzone_id: this.adzone ? this.adzone.id : this.adzoneId,
            audit_status: filter.auditStatus,
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
      updateAuction(payload) {
        return new Promise((resolve, reject) => {
          privateAuctionAPI.update(this.token, payload).then(res => {
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
      onMediaClick(media) {
        this.$router.push({
          path: '/media/' + media.id
        })
      },
      onAdzoneClick(adzone) {
        this.$router.push({
          path: '/adzone/' + adzone.id
        })
      },
      handleEdit(val, index, key) {
        const auction = val[index]
        if (auction.audit_status !== 0) {
          this.$Modal.error({
            title: 'Error',
            content: 'Can only edit the auction which audit status is in waiting'
          })
          this.onSearch()
          return
        }
        let payload = {id: auction.id, online_status: 1}
        let value = auction[key]
        if (key === 'price') {
          value = parseFloat(value)
        }
        payload[key] = value
        this.updateAuction(payload).then(res => {
          this.onSearch()
        }, err => {
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
      onCancel(auction) {
        if (auction.audit_status !== 0) {
          return
        }
        this.$Modal.confirm({
          title: 'Warning',
          content: '<p>The canceled auction could not be recovered, are you sure to cancel this auction?</p>',
          loading: true,
          okText: 'Yes',
          cancelText: 'No',
          onOk: () => {
            this.updateAuction({id: auction.id, online_status: 0}).then(res => {
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
                return
              }
              this.$Message.error(err.message || 'unknown error')
            })
          }
        })
      },
      onShowStats(auction) {
        const payload = {
          id: auction.id,
          title: auction.title,
          adzone: {
            id: auction.adzone.id,
            media: {
              id: auction.adzone.media.id,
              title: auction.adzone.media.title,
              domain: auction.adzone.media.domain
            }
          }
        }
        this.$router.push({
          path: '/auction-stats/' + auction.id,
          query: {auction: JSON.stringify(payload)}
        })
      }
    },
    mounted() {
      this.onSearch()
    }
  }
</script>