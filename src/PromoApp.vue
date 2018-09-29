<template>
  <v-app>
    <!-- <loader v-if="showLoader"></loader> -->
    <v-snackbar
      :timeout="2000"
      multi-line
      v-model="showSnackbar"
    >
      {{ snackbar.message }}
      <v-btn dark flat @click.native="showSnackbar=false">{{ $t('close') }}</v-btn>
    </v-snackbar>
    <v-content>
      <router-view></router-view>
    </v-content>
    <v-footer color="transparent" v-if="!hideFooter">
      <v-btn small block flat href="/">tokenmama.io&copy;2017</v-btn>
    </v-footer>
  </v-app>
</template>

<script>
  import {
    GEOIP_REQUEST,
    HIDE_SNACKBAR
  } from './store/mutation-types'
  // import Loader from './components/Loader.vue'

  export default {
    components: {
      // 'loader': Loader
    },
    computed: {
      showLoader() {
        return this.$store.getters['loading']
      },
      locale() {
        return this.$store.getters['locale']
      },
      showSnackbar: {
        get() {
          return this.$store.getters['showSnackbar']
        },
        set(value) {
          this.$store.dispatch(HIDE_SNACKBAR)
        }
      },
      snackbar() {
        return this.$store.getters['snackbar']
      }
      // toolbarTitle() {
      //   const route = this.$route
      //   let title = 'Tokenmama.IO'
      //   if (route.meta.title) {
      //     title = this.$i18n.t('toolbarTitle.' + route.meta.title)
      //   }
      //   return title
      // }
    },
    methods: {
      getGeoIP() {
        this.$store.dispatch(GEOIP_REQUEST).then((res) => {
        })
      }
    },
    created() {
      this.getGeoIP()
    }
  }
</script>