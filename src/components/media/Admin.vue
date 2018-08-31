<template>
  <div>
    <Modal
        v-model="showAddMedia"
        :title="this.$t('m.dash.title')"
        :ok-text="this.$t('m.dash.okText')"
        loading
        footer-hide='true'
        @on-ok="onAddMedia">
        <AddMedia ref="addMedia"></AddMedia>
        <Button type="primary" style="margin-left:435px" @click="onAddMedia" :loading="loading">{{$t('m.dash.okText')}}</Button>
    </Modal>
    <Modal
        v-model="showEditMedia"
        :title="this.$t('m.dash.ed')"
        ok-text="Submit"
        loading
        @on-ok="onEditMedia">
        <EditMedia ref="editMedia" :media="mediaToEdit"></EditMedia>
    </Modal>
    <MediaVerify ref="mediaVerifyModal" :media="mediaToVerify" @mediaVerified="onMediaVerified" @mediaVerifyFailed="onMediaVerifyFailed"></MediaVerify>
    <div>
      <Card :bordered="false" :dis-hover="true" :shadow="false" :padding="0">
        <p slot="title">
          {{$t('m.dash.me')}}
        </p>
        <Button slot="extra" type="primary" icon="ios-plus" @click="showAddMedia=true">
          {{$t('m.dash.add')}}
        </Button>
        <p>
          <ALLMediaTable ref="mediaTable" @mediaVerify="onMediaVerify" @mediaEdit="onMediaEdit" v-if="medias">
          </ALLMediaTable>
          <Row type="flex" justify="center" v-else>
            <Col style="text-align:center">
              <p style="padding:20px 0">{{$t('m.dash.noWeb')}}</p>
              <Button type="primary" icon="ios-plus" size="large" @click="showAddMedia=true">
                {{$t('m.dash.add')}}
              </Button>
            </Col>
          </Row>
        </p>
      </Card>
      <Page :total="total" :page-size='15' @on-change='setNum' style="text-align:center;margin-top:10px"/>
    </div>
    
  </div>
</template>

<script>
  import * as types from '../../store/mutation-types'
  import AddMedia from './AddMedia.vue'
  import EditMedia from './EditMedia.vue'
  import MediaVerify from './MediaVerify.vue'
  import ALLMediaTable from './ALLMediaTable.vue'
  import StatsChart from '../StatsChart.vue'

  export default {
    components: {
      'AddMedia': AddMedia,
      'EditMedia': EditMedia,
      'MediaVerify': MediaVerify,
      'ALLMediaTable': ALLMediaTable,
      'StatsChart': StatsChart
    },
    data() {
      return {
        showAddMedia: false,
        showEditMedia: false,
        mediaToVerify: null,
        mediaToEdit: null,
        loading: false
      }
    },
    computed: {
      token() {
        return this.$store.getters['token']
      },
      medias() {
        return this.$store.getters['mediaList']
      },
      total() {
        return this.$store.getters['total']
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
        this.$Message.error(this.$t('m.dash.ver'))
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
      },
      setNum(index) {
        // this.$Spin.show();
        this.$store.commit(types.ALL_MEDIA_FAILURE)
        this.$store.dispatch(types.ALL_MEDIA, {token: this.token, page: index}).then(res => {
          // this.$Spin.hide();
        })
      }
    },
    created() {
      const user = this.$store.getters['userInfo']
      if (user.is_admin === 0) {
        this.$router.push({path: '/'})
      }
      this.setNum(1)
    }
  }
</script>
