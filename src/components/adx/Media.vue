<template>
  <div>
    <Card v-if="media" :bordered="false" :dis-hover="true" :shadow="false">
      <h2 slot="title">
        {{ media.title }}
      </h2>
      <a slot="extra" :href="media.domain" target="_blank">
        <Icon type="link"></Icon>
        {{ media.domain }}
      </a>
      <p>{{ media.desc }}</p>
    </Card>
    <StatsChart ref="statsChart" title="Media Stats" :media-id="mediaId" :height="300"></StatsChart>
    <AdzoneTable ref="adzoneTable" :media="media"></AdzoneTable>
  </div>
</template>

<script>
  import * as types from '../../store/mutation-types'
  import AdzoneTable from './AdzoneTable.vue'
  import StatsChart from '../StatsChart.vue'
  import mediaAPI from '../../api/media'
  export default {
    components: {
      'AdzoneTable': AdzoneTable,
      'StatsChart': StatsChart
    },
    data() {
      return {
        spinShow: false,
        mediaId: 0,
        media: null
      }
    },
    computed: {
      token() {
        return this.$store.getters['token']
      }
    },
    methods: {
      getMedia() {
        if (!this.mediaId) {
          return
        }
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
              return
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
      }
    },
    mounted() {
      this.mediaId = parseInt(this.$route.params.id)
      if (this.mediaId) {
        this.getMedia()
      }
      this.$store.dispatch(types.UPDATE_CURRENT_ROUTE, 'dashboard')
    }
  }
</script>