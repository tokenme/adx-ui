import Vue from 'vue'
import Vuex from 'vuex'
import common from './modules/common'
import user from './modules/user'
import media from './modules/media'
import adzone from './modules/adzone'
import airdrops from './modules/airdrops'
import channel from './modules/channel'
Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    common,
    user,
    media,
    adzone,
    airdrops,
    channel
  },
  strict: debug
})