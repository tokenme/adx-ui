<template>
  <Header>
    <Menu mode="horizontal" theme="dark" :active-name="currentRoute" @on-select="onMenuSelect">
      <Row type="flex" justify="space-between" align="middle">
        <Col>
          <div class="layout-logo"></div>
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
          {icon: 'android-locate', name: 'Adzones', route: 'adzones', path: '/adzones'}
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
        for (const item of this.menuItems) {
          if (item.name === name) {
            this.$router.push({
              path: item.path
            })
          }
          return
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