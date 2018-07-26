<template>
  <div>
    <Modal
        v-model="showAddAirdrop"
        title="Add Airdrop"
        ok-text="Submit"
        loading
        @on-ok="onAddAirdrop">
        <AddAirdrop ref="addAirdrop"></AddAirdrop>
    </Modal>
    <Modal
        v-model="showEditAirdrop"
        title="Edit Airdrop"
        ok-text="Submit"
        loading
        @on-ok="onEditAirdrop">
        <EditAirdrop ref="editAirdrop"></EditAirdrop>
    </Modal>
    <Card :bordered="false" :dis-hover="true" :shadow="false" :padding="0">
      <p slot="title">
        Airdrop List
      </p>
      <SearchToolbar slot="extra" ref="searchToolbar" @searchAirdrops="onSearch" @addAirdropClick="onShowAddAirdrop"></SearchToolbar>
      <p>
        <Table border :loading="loading" :columns="columns" :data="airdrops" :row-class-name="rowClassName" border disabled-hover>
          <div slot="footer" style="margin: 0 10px">
            <Page :total="total" :page-size="page_size" :current.sync="page" show-total transfer @on-change="onSearch"></Page>
          </div>
        </Table>
      </p>
    </Card>
  </div>
</template>

<script>
  import * as types from '../../store/mutation-types'
  import SearchToolbar from './AirdropSearchToolbar.vue'
  import AddAirdrop from './AddAirdrop.vue'
  import EditAirdrop from './EditAirdrop.vue'
  import airdropAPI from '../../api/airdrop'
  import moment from 'moment'

  export default {
    components: {
      'SearchToolbar': SearchToolbar,
      'AddAirdrop': AddAirdrop,
      'EditAirdrop': EditAirdrop
    },
    data() {
      return {
        loading: false,
        showAddAirdrop: false,
        showEditAirdrop: false,
        total: 0,
        page: 1,
        page_size: 20,
        airdrops: [],
        columns: [
          {
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
            title: 'Budget', 
            key: 'budget',
            align: 'right',
            width: 120,
            render: (h, params) => {
              return h('div', [
                h('span', params.row.budget),
                h('small', {
                  class: {
                    muted: true
                  }
                }, params.row.token.symbol)
              ])
            }
          }, {
            title: 'GiveOut/User', 
            key: 'give_out',
            align: 'right',
            width: 120,
            render: (h, params) => {
              return h('div', [
                h('span', params.row.give_out),
                h('small', {
                  class: {
                    muted: true
                  }
                }, params.row.token.symbol)
              ])
            }
          }, {
            title: 'Bonus', 
            key: 'bonus',
            align: 'right',
            width: 100,
            render: (h, params) => {
              return h('div', [
                h('span', params.row.bonus),
                h('small', {
                  class: {
                    muted: true
                  }
                }, params.row.token.symbol)
              ])
            }
          }, {
            title: 'Date Range', 
            key: 'start_time',
            align: 'right',
            width: 150,
            render: (h, params) => {
              const startTime = moment(params.row.start_date)
              const endTime = moment(params.row.end_date)
              return h('div', [
                h('div', 'From: ' + startTime.format('YYYY-MM-DD')),
                h('div', '  To: ' + endTime.format('YYYY-MM-DD'))
              ])
            }
          }, {
            title: 'Telegram',
            key: 'telegram_group',
            align: 'center',
            render: (h, params) => {
              return h('Button', {
                props: {
                  type: 'text',
                  icon: 'link'
                }
              }, 'https://t.me/' + params.row.telegram_group)
            }
          }, {
            title: 'Created/Updated', 
            key: 'inserted_at',
            align: 'center',
            width: 170,
            render: (h, params) => {
              return h('div', [
                h('div', [
                  h('span', moment(params.row.inserted_at).format('YYYY-MM-DD HH:mm:ss')),
                  h('Icon', {
                    props: {
                      type: 'plus'
                    },
                    style: {
                      marginLeft: '5px'
                    }
                  })
                ]),
                h('div', [
                  h('span', moment(params.row.updated_at).format('YYYY-MM-DD HH:mm:ss')),
                  h('Icon', {
                    props: {
                      type: 'edit'
                    },
                    style: {
                      marginLeft: '5px'
                    }
                  })
                ])
              ])
            }
          }, {
            title: 'Online Status',
            key: 'online_status',
            align: 'center',
            width: 120,
            render: (h, params) => {
              return this.onlineStatusDisplay(h, params.row)
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
                    icon: 'android-share',
                    type: 'primary',
                    size: 'small',
                    disabled: moment(params.row.start_time).isBefore(moment(), 'day')
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.onShareClick(params.row)
                    }
                  }
                }, 'Share'),
                h('Button', {
                  props: {
                    icon: 'edit',
                    size: 'small',
                    disabled: moment(params.row.start_time).isBefore(moment(), 'day')
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.onShowEditAirdrop(params.row)
                    }
                  }
                }, 'Edit'),
                this.statusBtn(h, params.row)
              ])
            }
          }
        ]
      }
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
      onlineStatusDisplay(h, airdrop) {
        if (airdrop.online_status === 0) {
          return h('Tag', 'Unknown')
        } else if (airdrop.online_status === 1) {
          return h('Tag', {props: {color: 'green'}}, 'Online')
        } else if (airdrop.online_status === -1) {
          return h('Tag', {props: {color: 'red'}}, 'Offline')
        }
      },
      statusBtn(h, airdrop) {
        if (airdrop.online_status === -1) {
          return h('Button', {
            props: {
              type: 'success',
              size: 'small',
              icon: 'ios-arrow-thin-up'
            },
            on: {
              click: () => {
                this.onChangeStatus(airdrop, 1)
              }
            }
          }, 'Online')
        } else {
          return h('Button', {
            props: {
              type: 'error',
              size: 'small',
              icon: 'ios-arrow-thin-down'
            },
            on: {
              click: () => {
                this.onChangeStatus(airdrop, -1)
              }
            }
          }, 'Offline')
        }
      },
      getAirdrops(filter) {
        return new Promise((resolve, reject) => {
          const payload = {
            onlineStatus: filter.onlineStatus,
            dateRange: filter.dateRange,
            page: this.page
          }
          airdropAPI.list(this.token, {options: JSON.stringify(payload)}).then(res => {
            if (res && res.code) {
              reject(res)
              return
            }
            resolve(res)
          })
        })
      },
      updateAirdrop(payload) {
        return new Promise((resolve, reject) => {
          airdropAPI.update(this.token, payload).then(res => {
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
        this.getAirdrops(filter).then(res => {
          this.loading = false
          this.total = res.total
          this.page = res.page
          this.page_size = res.page_size
          this.airdrops = res.airdrops || []
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
      onAirdropClick(airdrop) {
        this.$router.push({
          path: '/airdrop/' + airdrop.id
        })
      },
      onShowAddAirdrop() {
        this.showAddAirdrop = true
        this.$refs.addAirdrop.reset()
      },
      onShowEditAirdrop(airdrop) {
        this.$refs.editAirdrop.reset(airdrop)
        this.showEditAirdrop = true
      },
      onAddAirdrop() {
        this.$refs.addAirdrop.submit(res => {
          this.showAddAirdrop = false
          this.onSearch()
        }, err => {
          this.showAddAirdrop = false
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
      onEditAirdrop() {
        this.$refs.editAirdrop.submit(res => {
          this.showEditAirdrop = false
          this.onSearch()
        }, err => {
          this.showEditAirdrop = false
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
      onChangeStatus(airdrop, onlineStatus) {
        const payload = {
          id: airdrop.id,
          online_status: onlineStatus
        }
        airdropAPI.update(this.token, payload).then(res => {
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
          this.onSearch()
        })
      }
    },
    mounted() {
      this.$store.dispatch(types.UPDATE_CURRENT_ROUTE, 'airdrops')
      this.onSearch()
    }
  }
</script>