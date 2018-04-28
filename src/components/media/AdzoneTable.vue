<template>
  <div>
    <Table border :loading="loading" :columns="columns" :data="adzones"></Table>
  </div>
</template>

<script>
  import * as types from '../../store/mutation-types'
  import adzoneAPI from '../../api/adzone'
  import ExpendRow from './AdzoneTableExpend.vue'
  import BadgeButton from '../BadgeButton'
  export default {
    components: { 
      'ExpendRow': ExpendRow,
      'BadgeButton': BadgeButton
    },
    data() {
      return {
        loading: false,
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
            title: 'Minimum CPT (Ether/Day)',
            key: 'min_cpt',
            align: 'right'
          }, {
            title: 'Status',
            key: 'online_status',
            width: 100,
            filters: [
              { label: 'Online', value: 1 },
              { label: 'Offline', value: 0 }
            ],
            filterMultiple: true,
            filterMethod (value, row) {
              return row.online_status === value
            },
            render: (h, params) => {
              return h('Tag', {
                props: {
                  color: this.statusTagColor(params.row)
                }
              }, this.statusTagText(params.row))
            }
          }, {
            title: 'Time',
            key: 'inserted_at',
            width: 260,
            render: (h, params) => {
              return h('div', [
                h('div', 'Created: ' + params.row.inserted_at),
                h('div', 'Updated: ' + params.row.updated_at)
              ])
            }
          }, {
            title: 'Action',
            key: 'action',
            align: 'center',
            size: 150,
            render: (h, params) => {
              return h('div', [
                this.auctionsBtn(h, params.row),
                h('Button', {
                  props: {
                    icon: 'edit',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.onEditClick(params.row)
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
    props: {
      media: null
    },
    computed: {
      token() {
        return this.$store.getters['token']
      },
      adzones() {
        if (!this.media) {
          return []
        }
        return this.$store.getters.getAdzonesByMediaId(this.media.id)
      }
    },
    methods: {
      statusTagColor(row) {
        return row.online_status === 0 ? 'red' : 'green'
      }, 
      statusTagText(row) {
        return row.online_status === 0 ? 'Offline' : 'Online'
      },
      auctionsBtn(h, row) {
        if (row.unverified_auctions) {
          return h(BadgeButton, {
            props: {
              buttonType: 'primary',
              buttonSize: 'small',
              buttonIcon: 'ios-cart',
              buttonText: 'Auctions',
              count: row.unverified_auctions
            },
            style: {
              marginRight: '5px'
            },
            on: {
              click: () => {
                this.onAdzoneClick(row)
              }
            }
          })
        }
        return h('Button', {
          props: {
            type: 'primary',
            size: 'small',
            icon: 'ios-eye'
          },
          style: {
            marginRight: '5px'
          },
          on: {
            click: () => {
              this.onAdzoneClick(row)
            }
          }
        }, 'View')
      },
      statusBtn(h, row) {
        if (row.online_status === 0) {
          return h('Button', {
            props: {
              type: 'success',
              size: 'small',
              icon: 'ios-arrow-thin-up'
            },
            on: {
              click: () => {
                this.onChangeStatus(row, 1)
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
                this.onChangeStatus(row, 0)
              }
            }
          }, 'Offline')
        }
      },
      onAdzoneClick(row) {
        console.log(row)
        this.$router.push({
          path: '/private-auctions',
          query: {
            adzone_id: row.id,
            media_id: row.media.id
          }
        })
      },
      getAdzones() {
        return new Promise((resolve, reject) => {
          if (!this.media) {
            reject(new Error('missing media'))
            return
          }
          const payload = {token: this.token, media_id: this.media.id}
          this.$store.dispatch(types.ADZONE_LIST_REQUEST, payload).then(res => {
            resolve(res)
          }, err => {
            reject(err)
          })
        })
      },
      onEditClick(row) {
        this.$emit('adzoneEdit', row)
      },
      changeStatus(payload) {
        return new Promise((resolve, reject) => {
          adzoneAPI.update(this.token, payload).then(res => {
            if (res && res.code) {
              reject(res)
              return
            }
            resolve(res)
          })
        })
      },
      onChangeStatus(row, status) {
        const runner = async(options) => {
          this.loading = true
          try {
            await this.changeStatus(options)
            await this.getAdzones()
          } catch (err) {
            if (err.code === 401) {
              this.$router.push({
                path: '/login',
                query: {
                  redirect: this.$route.fullPath
                }
              })
            }
            this.$Message.error(err.message || 'unknown error')
          }
          this.loading = false
        }
        runner({id: row.id, online_status: status})
      },
      refresh() {
        const runner = async() => {
          this.loading = true
          try {
            await this.getAdzones()
          } catch (err) {
            if (err.code === 401) {
              this.$router.push({
                path: '/login',
                query: {
                  redirect: this.$route.fullPath
                }
              })
            }
            this.$Message.error(err.message || 'unknown error')
          }
          this.loading = false
        }
        runner()
      }
    },
    mounted() {
      this.refresh()
    }
  }
</script>