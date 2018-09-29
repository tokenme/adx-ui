<template>
  <v-app >
    <!-- <nav-drawer ref="navDrawer" @changeLocale="changeLocale"></nav-drawer>
    <loader v-if="showLoader"></loader> -->
    <v-dialog v-model="showErrorDialog">
      <v-card>
        <v-card-title class="headline">{{ errorDialog.title }}</v-card-title>
        <v-card-text>{{ errorDialog.message }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click.native="showErrorDialog=false">{{ $t('close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- <v-snackbar
      :timeout="2000"
      multi-line
      v-model="showSnackbar"
    >
      {{ snackbar.message }}
      <v-btn dark flat @click.native="showSnackbar=false">{{ $t('close') }}</v-btn>
    </v-snackbar> -->
    <v-toolbar dark color="primary" style="background:#1976d2;color:#fff"  app fixed v-if="!hideToolbar">
      <v-toolbar-title>{{ toolbarTitle }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items v-if="toolbarItems">
        <v-menu bottom left>
          <v-btn icon slot="activator"  dark>
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
          <v-list>
            <v-list-tile v-for="item in toolbarItems" flat :key="item.name" @click="toolbarItemClick(item)">
              <v-list-tile-title>{{ item.name }}</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-toolbar-items>
      <template v-if="toolbarIcons">
        <v-btn icon v-for="item in toolbarIcons" :loading="loading" :key="item.name" @click="toolbarItemClick(item)">
          <v-icon>{{ item.icon }}</v-icon>
        </v-btn>
      </template>
    </v-toolbar>
    <v-content class="white">
      <router-view></router-view>
    </v-content>
    <v-footer color="transparent" v-if="!hideFooter">
      <v-btn small block flat to="{name: 'home'}">tokenmama.io&copy;2017</v-btn>
    </v-footer>
  </v-app>
</template>

<script>
  import NavHeader from './components/NavHeader.vue'
  import {
    GEOIP_REQUEST,
    GEOIP_LOCAL,
    HIDE_ERROR_DIALOG
  } from './store/mutation-types'
  import {bus} from './bus'
  export default {
    components: {
      'nav-header': NavHeader
    },
    data() {
      return {
        toolbarIcons: null,
        toolbarItems: null
      }
    },
    computed: {
      breadcrumb() {
        return this.$store.getters['breadcrumb']
      },
      hideToolbar() {
        const route = this.$route
        return route.meta && route.meta.hideToolbar
      },
      toolbarTitle() {
        const route = this.$route
        // console.log(route)
        let title = this.$t('m.navtitle.air')
        if (route.meta.title && route.meta.title === 'newairdrops') {
          title = this.$t('m.navtitle.airdrops')
        }
        if (route.meta.title && route.meta.title === 'newaddairdrop') {
          title = this.$t('m.navtitle.add_airdrop')
        }
        if (route.meta.title && route.meta.title === 'newairdrop') {
          title = this.$t('m.navtitle.airdrop')
        }
        if (route.meta.title && route.meta.title === 'token') {
          title = this.$t('m.navtitle.token')
        }
        return title
      },
      showErrorDialog: {
        get() {
          return this.$store.getters['showErrDialog']
        },
        set(value) {
          this.$store.dispatch(HIDE_ERROR_DIALOG)
        }
      },
      errorDialog() {
        return this.$store.getters['errDialog']
      }
    },
    methods: {
      getGeoIP() {
        this.$store.dispatch(GEOIP_REQUEST).then((res) => {
        })
      },
      getLocalIp() {
        this.$store.dispatch(GEOIP_LOCAL, localStorage.countryCode)
      },
      toggleDrawer() {
        this.$refs.navDrawer.toggleDrawer()
      },
      toolbarItemClick(item) {
        // console.log(item)
        if (item.event) {
          bus.$emit(item.event.name, item.event.value)
        }
        if (item.goto) {
          this.$router.push(item.goto)
        }
      }
    },
    created() {
      bus.$on('update_toolbar_items', (items) => {
        this.toolbarItems = items
      })
      bus.$on('update_toolbar_icons', (items) => {
        this.toolbarIcons = items
      })
      this.getGeoIP()
    },
    beforeDestroy() {
      bus.$off('update_toolbar_items')
      bus.$off('update_toolbar_icons')
    }
  }
</script>