import Vue from 'vue'
import iview from 'iview'
import VueRouter from 'vue-router'
import VueClipboard from 'vue-clipboard2'
import vueCalendar from 'vue-calendar'
import gtagjs from 'vue-gtagjs'
import './css/common.css'

import App from './Adx.vue'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import ResetPassword from './components/ResetPassword.vue'
import Dashboard from './components/adx/Dashboard.vue'
import PrivateAuction from './components/adx/PrivateAuction.vue'
import PrivateAuctionStats from './components/adx/PrivateAuctionStats.vue'
import Media from './components/adx/Media.vue'
import Adzone from './components/adx/Adzone.vue'
import Account from './components/adx/Account.vue'
import Airdrops from './components/adx/Airdrops.vue'
import store from './store'
import * as types from './store/mutation-types'

iview.lang('en-US')

Vue.use(iview)
Vue.use(VueRouter)
Vue.use(VueClipboard)
Vue.use(vueCalendar)

const router = new VueRouter({
  routes: [{
    name: 'login',
    path: '/login',
    component: Login,
    props: (route) => ({
      redirect: route.query.redirect
    }),
    meta: {
      title: 'login'
    }
  }, {
    name: 'register',
    path: '/register',
    component: Register,
    meta: {
      title: 'register'
    }
  }, {
    name: 'reset-passwd',
    path: '/reset-passwd/:code',
    component: ResetPassword,
    meta: {
      title: 'reset-passwd'
    }
  }, {
    name: 'dashboard',
    path: '/',
    component: Dashboard,
    meta: {
      title: 'dashboard',
      auth: true
    }
  }, {
    name: 'account',
    path: '/account',
    component: Account,
    meta: {
      title: 'account',
      auth: true
    }
  }, {
    name: 'media',
    path: '/media/:id',
    component: Media,
    meta: {
      title: 'media',
      auth: true
    }
  }, {
    name: 'adzone',
    path: '/adzone/:id',
    component: Adzone,
    meta: {
      title: 'media',
      auth: true
    }
  }, {
    name: 'auctions',
    path: '/private-auctions',
    component: PrivateAuction,
    props: (route) => ({
      adzoneId: route.query.adzoneId,
      mediaId: route.query.mediaId,
      adzone: route.query.adzone ? JSON.parse(route.query.adzone) : null
    }),
    meta: {
      title: 'auctions',
      auth: true
    }
  }, {
    name: 'auction-stats',
    path: '/auction-stats/:id',
    component: PrivateAuctionStats,
    props: (route) => ({
      auctionId: route.query.auctionId,
      adzoneId: route.query.adzoneId,
      mediaId: route.query.mediaId,
      auction: route.query.auction ? JSON.parse(route.query.auction) : null
    }),
    meta: {
      title: 'auction-stats',
      auth: true
    }
  }, {
    name: 'airdrops',
    path: '/airdrops',
    component: Airdrops,
    meta: {
      title: 'airdrops',
      auth: true
    }
  }],
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
  iview.LoadingBar.start()
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
  iview.LoadingBar.finish()
  window.scrollTo(0, 0)
});

/* eslint-disable no-new*/
try {
  new Vue({
    el: '#app',
    router: router,
    store: store,
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