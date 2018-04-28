<template>
  <div>
    <Modal
        v-model="showAddAdzone"
        title="Add Adzone"
        ok-text="Submit"
        loading
        @on-ok="onAddAdzone">
        <AddAdzone ref="addAdzone" :media="media"></AddAdzone>
    </Modal>
    <Modal
        v-model="showEditMedia"
        title="Edit Media"
        ok-text="Submit"
        loading
        @on-ok="onEditMedia">
        <EditMedia ref="editMedia" :media="media"></EditMedia>
    </Modal>
    <Modal
        v-model="showEditAdzone"
        title="Edit Adzone"
        ok-text="Submit"
        loading
        @on-ok="onEditAdzone">
        <EditAdzone ref="editAdzone"></EditAdzone>
    </Modal>
    <MediaVerify ref="mediaVerifyModal" :media="media" @mediaVerified="onMediaVerified" @mediaVerifyFailed="onMediaVerifyFailed"></MediaVerify>
    <Card v-if="media" :bordered="false" :dis-hover="true" :shadow="false">
      <h2 slot="title">
        {{ media.title }}
        <Tag color="red" v-if="media.verified===0">unverified</Tag>
        <Tag color="yellow" v-else-if="media.online_status===0">offline</Tag>
        <Tag color="green" v-else-if="media.online_status===1">online</Tag>
      </h2>
      <a slot="extra" :href="media.domain" target="_blank">
        <Icon type="link"></Icon>
        {{ media.domain }}
      </a>
      <Button slot="extra" type="primary" size="small" icon="edit" @click="showEditMedia=true" style="margin-left:5px">
        Edit
      </Button>
      <Button slot="extra" type="success" size="small" @click="onMediaVerify" v-if="media.verified===0" style="margin-left:5px">
        Verify
      </Button>
      <p>{{ media.desc }}</p>
    </Card>
    <StatsChart ref="statsChart" title="Media Stats" :media-id="mediaId" :height="300"></StatsChart>
    <Card :bordered="false" :dis-hover="true" :shadow="false" :padding="0">
      <p slot="title">
        Adzone List
      </p>
      <Button slot="extra" type="primary" icon="ios-plus" @click="onShowAddAdzone">
        Add Adzone
      </Button>
      <p>
        <AdzoneTable ref="adzoneTable" :media="media" @adzoneEdit="onAdzoneEdit" v-if="media && adzones"></AdzoneTable>
        <Row type="flex" justify="center" v-else>
          <Col style="text-align:center">
            <p style="padding:20px 0">No Adzones in the media, click the button below to add new adzone.</p>
            <Button type="primary" icon="ios-plus" size="large" @click="onShowAddAdzone">
              Add Adzone
            </Button>
          </Col>
        </Row>
      </p>
    </Card>
    <Spin size="large" fix v-if="spinShow"></Spin>
  </div>
</template>

<script>
  import * as types from '../../store/mutation-types'
  import mediaAPI from '../../api/media'
  import EditMedia from './EditMedia.vue'
  import MediaVerify from './MediaVerify.vue'
  import AddAdzone from './AddAdzone.vue'
  import EditAdzone from './EditAdzone.vue'
  import AdzoneTable from './AdzoneTable.vue'
  import StatsChart from '../StatsChart.vue'

  export default {
    components: {
      'EditMedia': EditMedia,
      'MediaVerify': MediaVerify,
      'AddAdzone': AddAdzone,
      'EditAdzone': EditAdzone,
      'AdzoneTable': AdzoneTable,
      'StatsChart': StatsChart
    },
    data() {
      return {
        spinShow: false,
        showEditMedia: false,
        showAddAdzone: false,
        showEditAdzone: false,
        mediaId: 0,
        media: null
      }
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
      getMedia() {
        this.spinShow = true
        mediaAPI.info(this.token, this.mediaId).then(res => {
          this.spinShow = false
          if (res && res.code) {
            if (res.code === 401) {
              this.$router.push({
                path: '/login',
                query: {
                  redirect: this.$route.fullPath
                }
              })
            }
            this.$Message.error(res.message || 'unknown error')
            return
          }
          this.media = res
          const breadcrumb = [
            {name: 'Dashboard', path: '/'},
            {name: 'Media: ' + this.media.title, path: '/media/' + this.mediaId}
          ]
          this.$store.dispatch(types.UPDATE_BREADCRUMB, breadcrumb)
        })
      },
      onEditMedia() {
        this.$refs.editMedia.submit(res => {
          this.showEditMedia = false
          this.getMedia()
        }, err => {
          this.showEditMedia = false
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
      onMediaVerified(media) {
        this.$refs.mediaVerifyModal.hide()
        this.getMedia()
      },
      onMediaVerifyFailed(err) {
        console.log(err)
        this.$refs.mediaVerifyModal.hide()
        this.$Message.error('Verification Failed!')
      },
      onMediaVerify() {
        this.$refs.mediaVerifyModal.show()
      },
      onShowAddAdzone() {
        this.$refs.addAdzone.addAdzoneForm.url = this.media.domain
        this.showAddAdzone = true
      },
      onAddAdzone() {
        this.$refs.addAdzone.submit(res => {
          this.showAddAdzone = false
          this.$refs.adzoneTable.refresh()
        }, err => {
          this.showAddAdzone = false
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
      onAdzoneEdit(adzone) {
        this.$refs.editAdzone.reset(adzone)
        this.showEditAdzone = true
      },
      onEditAdzone() {
        this.$refs.editAdzone.submit(res => {
          this.showEditAdzone = false
          this.$refs.adzoneTable.refresh()
        }, err => {
          this.showEditAdzone = false
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
    },
    created() {
      this.mediaId = parseInt(this.$route.params.id)
      this.getMedia()
    },
    mounted() {
      this.$store.dispatch(types.UPDATE_CURRENT_ROUTE, 'dashboard')
    }
  }
</script>