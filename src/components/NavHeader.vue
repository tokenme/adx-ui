<template>
  <Header>
    <Menu mode="horizontal" theme="dark" :active-name="currentRoute" @on-select="onMenuSelect">
      <Row type="flex" justify="space-between" align="middle">
        <Col>
          <img src="https://tmm-adx.tianxi100.com/img/logo/red-300.png?v=20180427" class="layout-logo"/>
        </Col>
        <Col>
          <MenuItem :name="item.route" v-for="item of menuItems" :key="item.route" v-if="logined">
            <Icon :type="item.icon"></Icon>
            {{ item.name }}
          </MenuItem>
          <template v-if="logined">
            <MenuItem name="admin" v-if="user.is_admin===1">
              <Icon type="ios-people"></Icon>
              {{$t('m.ht')}}
            </MenuItem>
            <MenuItem v-if="user.is_advertiser === 1">
              <Icon type="android-plane"></Icon>
              <a href="./airdrop.html" style="color:rgba(255,255,255,.7)">{{$t('m.airdrop')}}</a>
            </MenuItem>
            <MenuItem name="account">
              <Icon type="ios-person"></Icon>
              {{ user.mobile ? user.mobile : user.email }}
            </MenuItem>
            <MenuItem name="logout">
              <Icon type="log-out"></Icon>
              {{$t('m.logOut')}}
            </MenuItem>
          </template>
          <MenuItem name="login" v-else>
            <Icon type="log-in"></Icon>
            {{$t('m.logIn')}}
            <!-- Login -->
          </MenuItem>
          <MenuItem name="lan" class="lang" >
            <Select @on-change="this.changeLan" :placeholder="lang=='zh-CN'?'中文':'English'" size="small" style="width:80px" >
              <Option value="EN">Engilish</Option>
              <Option value="CN">中文</option>
            </Select>
          </MenuItem>
        </Col>
      </Row>
    </Menu>
  </Header>
</template>
<script>
  import * as types from '../store/mutation-types'
  export default {
    data() {
      return {
        lang: localStorage.lang ? localStorage.lang : 'en-US',
        menuItems: [
          {icon: 'ios-speedometer-outline', name: this.$t('m.dashBoard'), route: 'dashboard', path: '/'},
          {icon: 'ios-cart', name: this.$t('m.auctions'), route: 'auctions', path: '/private-auctions'}
          // {icon: 'android-plane', name: this.$t('m.airdrop'), route: 'airdrops', path: '/airdrops'}
        ]
      }
    },
    computed: {
      logined() {
        return this.$store.getters['loggedIn']
      },
      user() {
        return this.$store.getters['userInfo']
      },
      currentRoute() {
        let route = this.$store.getters['currentRoute']
        if (!route) {
          route = this.menuItems[0].route
        }
        return route
      }
    },
    methods: {
      onMenuSelect(name) {
        if (name === 'logout') {
          this.logout()
          return
        }
        if (name === 'login') {
          this.$router.push({
            path: '/login'
          })
          return
        }
        if (name === 'account') {
          this.$router.push({
            path: '/account'
          })
          return
        }
        if (name === 'admin') {
          this.$router.push({
            path: '/admin'
          })
          return
        }
        if (name === 'airdrops') {
          location.href = 'airdrop.html'
          return
        }
        for (const item of this.menuItems) {
          if (item.route === name) {
            this.$router.push({
              path: item.path
            })
            break
          }
        }
      },
      logout() {
        this.$store.dispatch(types.LOGOUT_REQUEST).then(res => {
          this.$router.push({name: 'login'})
        })
      },
      changeLan(value){
        if (value === 'EN') {
          // this.$i18n.locale = 'en-US'
          location.reload()
          localStorage.lang = 'en-US'
          // console.log(this)
        }
        if (value === 'CN') {
          // this.$i18n.locale = 'zh-CN'
          location.reload()
          localStorage.lang = 'zh-CN'
          // console.log(this)
        }
      }
    }
  }
</script>


