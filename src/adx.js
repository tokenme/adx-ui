import Vue from 'vue'
import iView from 'iview'
import VueRouter from 'vue-router'
import VueClipboard from 'vue-clipboard2'
import Vuelidate from 'vuelidate'
import gtagjs from 'vue-gtagjs'

import App from './Media.vue'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import store from './store'
import * as types from './store/mutation-types'

Vue.use(iView)
Vue.use(VueRouter)
Vue.use(VueClipboard)
Vue.use(Vuelidate)

const router = new VueRouter({
  routes: [{
    name: 'login',
    path: '/login',
    component: Login,
    meta: {
      title: 'login',
      hideFooter: true
    }
  }, {
    name: 'register',
    path: '/register',
    component: Register,
    meta: {
      title: 'register',
      hideFooter: true
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

const GA_TRACKING_ID = 'UA-116680246-4'
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
  window.Raven.config('https://5403891267fd411e8399fa1958f144e3@sentry.io/1163629').install()
}

router.beforeEach((to, from, next) => {
  iView.LoadingBar.start()
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
  iView.LoadingBar.finish()
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