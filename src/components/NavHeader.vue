<template>
  <Header>
    <Menu mode="horizontal" theme="dark" :active-name="currentRoute" @on-select="onMenuSelect">
      <Row type="flex" justify="space-between" align="middle">
        <Col>
          <img src="https://tmm-adx.tianxi100.com/img/logo/red-300.png?v=20180427" class="layout-logo"/>
        </Col>
        <Col>
          <MenuItem :name="item.route" v-for="item of menuItems" :key="item.route">
            <Icon :type="item.icon"></Icon>
            {{ item.name }}
          </MenuItem>
          <template v-if="logined">
            <MenuItem name="account">
              <Icon type="ios-person"></Icon>
              {{ user.email }}
            </MenuItem>
            <MenuItem name="logout">
              <Icon type="log-out"></Icon>
              Logout
            </MenuItem>
          </template>
          <MenuItem name="login" v-else>
            <Icon type="log-in"></Icon>
            Login
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
        menuItems: [
          {icon: 'ios-speedometer-outline', name: 'Dashboard', route: 'dashboard', path: '/'},
          {icon: 'ios-cart', name: 'Auctions', route: 'auctions', path: '/private-auctions'},
          {icon: 'android-plane', name: 'Airdrops', route: 'airdrops', path: '/airdrops'}
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
      }
    }
  }
</script>
