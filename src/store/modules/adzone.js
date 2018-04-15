import * as types from '../mutation-types'
import adzoneAPI from '../../api/adzone'

// initial state
// shape: [{ id, quantity }]
const state = {
  adzones: [],
  sizes: []
}

// getters
const getters = {
  sizes: state => state.sizes ? state.sizes : [],
  getAdzonesByMediaId: state => (id) => {
    return state.adzones.filter(c => c.media && c.media.id === id)
  }
}

// actions
const actions = {
  
  [types.ADZONE_LIST_REQUEST]({
    commit,
    state
  }, payload) {
    return new Promise((resolve, reject) => {
      adzoneAPI.list(payload.token, {media_id: payload.media_id}).then((response) => {
        if (response.code) {
          commit(types.ADZONE_LIST_FAILURE, {media_id: payload.media_id, err: response})
          reject(response)
          return
        }
        commit(types.ADZONE_LIST_SUCCESS, { media_id: payload.media_id, adzones: response || [] })
        resolve(response)
      })
    })
  },

  [types.ADZONE_SIZES_REQUEST]({
    commit,
    state
  }) {
    return new Promise((resolve, reject) => {
      adzoneAPI.sizes().then((response) => {
        if (response.code) {
          commit(types.ADZONE_SIZES_FAILURE, response)
          reject(response)
          return
        }
        commit(types.ADZONE_SIZES_SUCCESS, response || [])
        resolve(response)
      })
    })
  }
}

// mutations
const mutations = {

  [types.ADZONE_LIST_SUCCESS](state, res) {
    const restAdzones = state.adzones.filter(ad => ad.media.id !== res.media_id)
    state.adzones = [...restAdzones, ...res.adzones]
  },

  [types.ADZONE_LIST_FAILURE](state, err) {
    const restAdzones = state.adzones.filter(ad => ad.media.id !== err.media_id)
    state.adzones = restAdzones
  },

  [types.ADZONE_SIZES_SUCCESS](state, sizes) {
    state.sizes = sizes
  },

  [types.ADZONE_SIZES_FAILURE](state, err) {
    state.sizes = []
  }

}

export default {
  state,
  getters,
  actions,
  mutations
}