<template>
  <div>
    <div class="left">
      <!-- <div class="ziyuan">{{$t('m.med.res')}}</div> -->
      <div class="name" >{{media.title}}</div>
      <Menu theme="dark" active-name="1" style="width:175px" @on-select="selectMenu">
        <MenuItem name="1">
            {{$t('m.med.int')}}
        </MenuItem>
        <MenuItem name="2">
            {{$t('m.med.dis')}}
        </MenuItem>
        <MenuItem name="3">
            {{$t('m.med.rep')}}
        </MenuItem>
      </Menu>
    </div>
    <div class="right">
      <div class="introduce" v-if="active==1">
        <div v-if="media.imgurl === ''" style="width:100%;height:200px;text-align:center;line-height:200px;font-size:16px">暂无媒体介绍,去官网看看 <a :href="media.domain" target="_blank">{{media.domain}}</a>
        </div>
        <div v-else>
          <a :href="media.domain" target="_blank"><img :src="media.imgurl" alt="" style="width:100%;height:1146px"></a>
        </div>
        
      </div>
      <div class="show" v-if="active==2" style="width:100%;height:700px">
        <Card :bordered="true" :dis-hover='true'>
            <p slot="title">{{$t('m.med.sou')}}</p>
            <p>
              <Table border :loading="loading" :columns="columns" :data="adzones"></Table>
            </p>
        </Card>
      </div>
      <div class="table" v-if="active==3">
        <StatsChart ref="statsChart" :title="this.$t('m.med.rep')" :media-id="mediaId" :height="300" style="width:100%"></StatsChart>
      </div>
    </div>
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
        media: {},
        active: 1,
        loading: false,
        adzones: [],
        columns: [
          {
            title: this.$t('m.med.num'), 
            key: 'id',
            align: 'center'
            // width: 196
          }, {
            title: this.$t('m.med.pos'),
            key: 'intro',
            align: 'center'
            // width: 219
          }, {
            title: this.$t('m.med.si'),
            key: 'chicun',
            align: 'center',
            // width: 240,
            render: (h, params) => {
              const str = params.row.size.width + 'x' + params.row.size.height
              return h('span', str)
            }
          }, {
            title: this.$t('m.med.offer') + '(Ether/天)',
            key: 'min_cpt',
            align: 'center'
            // width: 255
            
          }, {
            title: this.$t('m.med.dea'),
            key: 'action',
            align: 'center',
            // width: 207,
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
                }, this.$t('m.med.vw'))
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
      getMedia() {
        if (!this.mediaId) {
          return
        }
        this.spinShow = true
        this.loading = true
        mediaAPI.info(this.token, this.mediaId).then(res => {
          this.spinShow = false
          this.loading = false
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
          this.adzones = res.adzones
        })
      },
      selectMenu(name) {
        this.active = name
      },
      onAdzoneClick(adzone) {
        this.$router.push({
          path: '/adzone/' + adzone.id
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
<style lang="scss" scoped>
.left{
  width: 175px;
  height: 1146px;
  padding-top: 20px;
  background: #000000;
  float: left;
  .ivu-menu-dark{
    background: #000000
  }
  .ivu-menu-item{
    margin-top: 20px;
    text-align: center
  }
  .ziyuan{
    width: 100%;
    text-align: center;
    font-size: 16px;
    margin-top: 50px;
    color: #ffffff
  }
  .name{
    width: 145px;
    height: 45px;
    background: #ed5c5c;
    color: #ffffff;
    font-size: 20px;
    text-align: center;
    margin-top: 20px;
    margin-left: 16px;
    line-height: 45px;
    border-radius: 5px;
    overflow: hidden;
  }
  
}
.right{
  width: 80%;
  height: 1146px;
  float: left;
  margin-left: 5%;
  .tit{
    font-size: 20px !important;
    color: #ed5c5c !important;
    font-weight: 600
  }
}
</style>
