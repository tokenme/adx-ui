import Vue from 'vue'
// import iview from 'iview'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css' // Ensure you are using css-loader
import colors from 'vuetify/es5/util/colors'
import VueRouter from 'vue-router'
import VueClipboard from 'vue-clipboard2'
import vueCalendar from 'vue-calendar'
import gtagjs from 'vue-gtagjs'
import './css/common.css'

import App from './Airdrop.vue'
import NewAirdrops from './components/adx/NewAirdrops'
import NewAddAirdrop from './components/adx/NewAddAirdrop.vue'
import NewAirdrop from './components/adx/NewAirdrop'
import Token from './components/adx/Token.vue'

import store from './store'
import VueI18n from 'vue-i18n'
import * as types from './store/mutation-types'

Vue.use(Vuetify, {
  theme: {
    primary: colors.red.darken1, // #E53935
    secondary: colors.red.lighten4, // #FFCDD2
    accent: colors.indigo.base // #3F51B5
  },
  options: {
    themeVariations: ['primary', 'secondary']
  }
})
// iview.lang('en-US')
Vue.use(VueI18n)
// Vue.use(iview)
Vue.use(VueRouter)
Vue.use(VueClipboard)
Vue.use(vueCalendar)
// Vue.use(Vuetify)



const i18n = new VueI18n({
  locale: localStorage.lang ? localStorage.lang : 'en-US',
  messages: {
    'zh-CN': require('./locale/lang/zh.js'),
    'en-US': require('./locale/lang/en.js')
  }
})
const router = new VueRouter({
  routes: [
    {
      name: 'newairdrops',
      path: '/',
      component: NewAirdrops,
      meta: {
        title: 'newairdrops',
        auth: true,
        navshow: false
      }
    }, 
    {
      name: 'newairdrops',
      path: '/newairdrops',
      component: NewAirdrops,
      meta: {
        title: 'newairdrops',
        auth: true,
        navshow: false
      }
    },
    {
      name: 'newaddairdrop',
      path: '/newairdrops/add',
      component: NewAddAirdrop,
      meta: {
        title: 'newaddairdrop',
        auth: true,
        navshow: false
      }
    },
    {
      name: 'newairdrop',
      path: '/newairdrop/:id',
      component: NewAirdrop,
      meta: {
        title: 'newairdrop',
        auth: true,
        navshow: false
      }
    },
    {
      name: 'token',
      path: '/token/:key',
      component: Token,
      meta: {
        title: 'token',
        auth: true
      }
    }
  ],
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

const GA_TRACKING_ID = 'UA-116680246-5'
gtagjs(router, GA_TRACKING_ID)
Vue.prototype.GA_TRACKING_ID = GA_TRACKING_ID
Vue.prototype.$Site = 'adx'

if (window.performance && window.gtag) {
  // Gets the number of milliseconds since page load
  // (and rounds the result since the value must be an integer).
  var timeSincePageLoad = Math.round(performance.now())

  // Sends the timing event to Google Analytics.
  window.gtag('event', 'timing_complete', {
    'name': 'load',
    'value': timeSincePageLoad,
    'event_category': 'Start Render'
  })
}

//if (window.Raven) {
//  window.Raven.config('https://5403891267fd411e8399fa1958f144e3@sentry.io/1163629').install()
//}

router.beforeEach((to, from, next) => {
  // iview.LoadingBar.start()
  store.dispatch(types.UPDATE_BREADCRUMB, [])
  const runner = async() => {
    if (to.matched.some(record => record.meta.auth)) {
      try {
        await store.dispatch(types.JWT_REQUEST)
        await store.dispatch(types.USER_INFO_REQUEST)
        next()
      } catch (e) {
        next({
          path: '/login',
          query: {
            redirect: to.fullPath
          }
        })
      }
    } else {
      next()
    }
  }
  runner()
})

router.afterEach((to) => {
  // iview.LoadingBar.finish()
  window.scrollTo(0, 0)
});

/* eslint-disable no-new*/
try {
  new Vue({
    el: '#app',
    router: router,
    store: store,
    i18n,
    render: h => h(App)
  })
} catch (e) {
  if (window.gtag) {
    window.gtag('event', 'exception', {
      'description': e,
      'fatal': false
    })
  }
}
/* eslint-enable no-new*/