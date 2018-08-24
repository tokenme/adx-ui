<template>
  <div class="layout">
    <Layout>
      <nav-header></nav-header>
      <Content :style="{padding: '0 50px'}">
          <Breadcrumb :style="{margin: '20px 0'}" v-if="breadcrumb">
              <BreadcrumbItem v-for="item of breadcrumb" :key="item.name" :to="item.path || ''">
                {{ item.name }}
              </BreadcrumbItem>
          </Breadcrumb>
          <Card>
              <div style="min-height: 200px;">
                  <router-view></router-view>
              </div>
          </Card>
      </Content>
      <Footer class="layout-footer-center">2018 &copy; Tokenmama.IO</Footer>
    </Layout>
  </div>
</template>

<script>
  import NavHeader from './components/NavHeader.vue'
  import {
    GEOIP_REQUEST,
    GEOIP_LOCAL
  } from './store/mutation-types'
  export default {
    components: {
      'nav-header': NavHeader
    },
    computed: {
      breadcrumb() {
        return this.$store.getters['breadcrumb']
      }
    },
    methods: {
      getGeoIP() {
        this.$store.dispatch(GEOIP_REQUEST).then((res) => {
        })
      },
      getLocalIp() {
        this.$store.dispatch(GEOIP_LOCAL, localStorage.countryCode)
      }
    },
    created() {
      this.getGeoIP()
    }
  }
</script>