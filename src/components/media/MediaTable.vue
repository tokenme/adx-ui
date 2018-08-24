<template>
  <div>
    <Table border :loading="loading" :columns="columns" :data="medias"></Table>
  </div>
</template>

<script>
  import * as types from '../../store/mutation-types'
  import mediaAPI from '../../api/media'
  export default {
    data() {
      return {
        loading: false,
        columns: [
          {
            title: this.$t('m.mt.tit'), 
            key: 'title',
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
                      this.onMediaClick(params.row)
                    }
                  }
                }, params.row.title)
              ])
            }
          }, {
            title: this.$t('m.mt.do'), 
            key: 'domain',
            render: (h, params) => {
              return h('Button', {
                props: {
                  type: 'text'
                },
                on: {
                  click: (ev) => { 
                    this.onMediaClick(params.row)
                  }
                }
              }, params.row.domain);
            }
          }, {
            title: this.$t('m.mt.st'),
            key: 'online_status',
            render: (h, params) => {
              return h('Tag', {
                props: {
                  color: this.statusTagColor(params.row)
                }
              }, this.statusTagText(params.row))
            }
          }, {
            title: this.$t('m.mt.ct'),
            key: 'inserted_at'
          }, {
            title: this.$t('m.mt.ut'),
            key: 'updated_at'
          }, {
            title: this.$t('m.mt.ac'),
            key: 'action',
            align: 'center',
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
                    click: () => {
                      this.onMediaClick(params.row)
                    }
                  }
                }, this.$t('m.vi')),
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
                }, this.$t('m.edt')),
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
      },
      medias() {
        return this.$store.getters['medias']
      }
    },
    methods: {
      statusTagColor(row) {
        if (row.verified === 0 || row.online_status === 0) {
          return 'red'
        }
        return 'green'
      }, 
      statusTagText(row) {
        if (row.verified === 0) {
          return this.$t('m.unv')
        } else if (row.online_status === 0) {
          return this.$t('m.of')
        } 
        return this.$t('m.onl')
      },
      statusBtn(h, row) {
        if (row.verified === 0) {
          return h('Button', {
            props: {
              type: 'success',
              size: 'small'
            },
            on: {
              click: () => {
                this.onVerify(row)
              }
            }
          }, this.$t('m.vy'))
        } else if (row.online_status === 0) {
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
          }, this.$t('m.onl'))
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
          }, this.$t('m.of'))
        }
      },
      onMediaClick(row) {
        this.$router.push({
          path: '/media/' + row.id
        })
      },
      getMedias() {
        return new Promise((resolve, reject) => {
          this.$store.dispatch(types.MEDIA_LIST_REQUEST, this.token).then(res => {
            resolve(res)
          }, err => {
            reject(err)
          })
        })
      },
      onEditClick(row) {
        this.$emit('mediaEdit', row)
      },
      onVerify(row) {
        this.$emit('mediaVerify', row)
      },
      changeStatus(payload) {
        return new Promise((resolve, reject) => {
          mediaAPI.update(this.token, payload).then(res => {
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
            await this.getMedias()
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
            await this.getMedias()
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