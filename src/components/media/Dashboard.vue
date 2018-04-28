<template>
  <div>
    <Modal
        v-model="showAddMedia"
        title="Add Media"
        ok-text="Submit"
        loading
        @on-ok="onAddMedia">
        <AddMedia ref="addMedia"></AddMedia>
    </Modal>
    <Modal
        v-model="showEditMedia"
        title="Edit Media"
        ok-text="Submit"
        loading
        @on-ok="onEditMedia">
        <EditMedia ref="editMedia" :media="mediaToEdit"></EditMedia>
    </Modal>
    <MediaVerify ref="mediaVerifyModal" :media="mediaToVerify" @mediaVerified="onMediaVerified" @mediaVerifyFailed="onMediaVerifyFailed"></MediaVerify>
    <StatsChart ref="statsChart" title="Account Stats" :height="300"></StatsChart>
    <Card :bordered="false" :dis-hover="true" :shadow="false" :padding="0">
      <p slot="title">
        Media List
      </p>
      <Button slot="extra" type="primary" icon="ios-plus" @click="showAddMedia=true">
        Add Media
      </Button>
      <p>
        <MediaTable ref="mediaTable" @mediaVerify="onMediaVerify" @mediaEdit="onMediaEdit" v-if="medias"></MediaTable>
        <Row type="flex" justify="center" v-else>
          <Col style="text-align:center">
            <p style="padding:20px 0">No Webistes in your account, click the button below to add new website.</p>
            <Button type="primary" icon="ios-plus" size="large" @click="showAddMedia=true">
              Add Media
            </Button>
          </Col>
        </Row>
      </p>
    </Card>
  </div>
</template>

<script>
  import * as types from '../../store/mutation-types'
  import AddMedia from './AddMedia.vue'
  import EditMedia from './EditMedia.vue'
  import MediaVerify from './MediaVerify.vue'
  import MediaTable from './MediaTable.vue'
  import StatsChart from '../StatsChart.vue'

  export default {
    components: {
      'AddMedia': AddMedia,
      'EditMedia': EditMedia,
      'MediaVerify': MediaVerify,
      'MediaTable': MediaTable,
      'StatsChart': StatsChart
    },
    data() {
      return {
        showAddMedia: false,
        showEditMedia: false,
        mediaToVerify: null,
        mediaToEdit: null
      }
    },
    computed: {
      medias() {
        return this.$store.getters['medias']
      }
    },
    methods: {
      onAddMedia() {
        this.$refs.addMedia.submit(res => {
          this.showAddMedia = false
          this.$refs.mediaTable.refresh()
          this.mediaToVerify = res
          this.$refs.mediaVerifyModal.show()
        }, err => {
          this.showAddMedia = false
          this.$Message.error(err.message || 'unknown error')
        })
      },
      onMediaVerified(media) {
        this.$refs.mediaVerifyModal.hide()
        this.$refs.mediaTable.refresh()
      },
      onMediaVerifyFailed(err) {
        console.log(err)
        this.$refs.mediaVerifyModal.hide()
        this.$Message.error('Verification Failed!')
      },
      onMediaVerify(media) {
        this.mediaToVerify = media
        this.$refs.mediaVerifyModal.show()
      },
      onMediaEdit(media) {
        this.mediaToEdit = media
        this.showEditMedia = true
      },
      onEditMedia() {
        this.$refs.editMedia.submit(res => {
          this.showEditMedia = false
          this.$refs.mediaTable.refresh()
        }, err => {
          this.showEditMedia = false
          this.$Message.error(err.message || 'unknown error')
        })
      }
    },
    created() {
      this.$store.dispatch(types.UPDATE_CURRENT_ROUTE, 'dashboard')
    }
  }
</script>