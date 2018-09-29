import Vue from 'vue'
import Vuetify from 'vuetify'
import VueI18n from 'vue-i18n'
import VueRouter from 'vue-router'
import VueClipboard from 'vue-clipboard2'
import gtagjs from 'vue-gtagjs'

import App from './PromoApp.vue'
import Promo from './components/adx/Promo.vue'
import Token from './components/adx/Token.vue'
import store from './store'


Vue.use(VueI18n)
Vue.use(Vuetify)
Vue.use(VueRouter)
Vue.use(VueClipboard)

const i18n = new VueI18n({
  locale: localStorage.lang ? localStorage.lang : 'en-US',
  messages: {
    'zh-CN': require('./locale/lang/zh.js'),
    'en-US': require('./locale/lang/en.js')
  }
})

const router = new VueRouter({
  routes: [{
    name: 'promo',
    path: '/:key',
    component: Promo,
    meta: {
      title: 'promo'
    }
  }, {
    name: 'token',
    path: '/token/:key',
    component: Token,
    meta: {
      title: 'token'
    }
  }]
})

const GA_TRACKING_ID = 'UA-116680246-3'
gtagjs(router, GA_TRACKING_ID)
Vue.prototype.GA_TRACKING_ID = GA_TRACKING_ID

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

if (window.Raven) {
  window.Raven.config('https://8e1767d8d7b94183805e4d1515665468@sentry.io/994578').install()
}

router.beforeEach((to, from, next) => {
  next()
})

/* eslint-disable no-new*/
try {
  new Vue({
    i18n,
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