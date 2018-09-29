<template>
    <div>
        <div >
            <Card :dis-hover='true'>
                <p slot="title">{{$t('m.week')}}</p>
                <p>
                    <Tabs type="card">
                        <TabPane label="PV">
                            <div style="border:1px solid #ccc">
                                <div class="adzone" v-for="item in traffic" :key="item.id">
                                    <p class="name">{{item.media_name}}</p>
                                    <p class="num">{{item.pv}}</p>
                                </div>
                            </div>
                        </TabPane>
                        <TabPane label="UV">
                            <div style="border:1px solid #ccc">
                                <div class="adzone" v-for="item in traffic" :key="item.id">
                                    <p class="name">{{item.media_name}}</p>
                                    <p class="num">{{item.uv}}</p>
                                </div>
                            </div>
                        </TabPane>
                        <TabPane label="CTR">
                            <div style="border:1px solid #ccc">
                                <div class="adzone" v-for="item in traffic" :key="item.id">
                                    <p class="name">{{item.media_name}}</p>
                                    <p class="num">{{item.ctr}}</p>
                                </div>
                            </div>
                        </TabPane>
                        <TabPane label="Clicks">
                            <div style="border:1px solid #ccc">
                                <div class="adzone" v-for="item in traffic" :key="item.id">
                                    <p class="name">{{item.media_name}}</p>
                                    <p class="num">{{item.clicks}}</p>
                                </div>
                            </div>
                        </TabPane>
                    </Tabs>
                </p>
            </Card>
        </div>
        <div style="margin-top:15px;height:272px">
            <Card :dis-hover='true'>
                <p slot="title">{{$t('m.cd')}}
                    <Icon type="volume-medium"></Icon>
                </p>
                <p class="tit">CGT : 空投分为三个阶段，第一阶段空投500万个
                    <span>6天前</span>
                </p>
                <p class="tit">BKEX : 空投4000个
                    <span>2018.04.09</span>
                </p>
                <p class="tit">ACCA : 空投3000个
                    <span>2015.05.24</span>
                </p>
            </Card>
        </div>
        
    </div>
</template>

<script>
import mediaAPI from '../../api/media'
export default {
  data() {
    return {
      traffic: null
    }
  },
  computed: {
    token() {
      return this.$store.getters['token']
    }
  },
  methods: {
    getMediaList(){
      mediaAPI.trafficList(this.token).then(res => {
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
        this.traffic = res.data
      })
    }
  },
  created() {
    this.getMediaList()
  }
}
</script>
<style  scoped>
    span{
        display: block;
        margin-top: 8px;
        margin-bottom: 9px;
        color: #adadad;
        font-size: 12px;
    }
    .tit{
        color: #4d4d4d
    }
    .ivu-tabs.ivu-tabs-card>>>.ivu-tabs-bar .ivu-tabs-tab{
        margin-left: 9px!important;
    }
    .adzone{
        height: 50px;
        border-bottom: 1px solid #cccccc;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-left: 10px;
        padding-right: 10px
    }
    .name{
        color: #4d4d4d;
        font-size: 16px;
    }
    .num{
        color: #53a11f;
    }
    .nav-text{
        width: 100%;
        text-align: center
    }
</style>