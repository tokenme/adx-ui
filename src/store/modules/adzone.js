import * as types from '../mutation-types'
import adzoneAPI from '../../api/adzone'

// initial state
// shape: [{ id, quantity }]
const state = {
  adzones: [],
  sizes: [],
  airdropadzones: []
}

// getters
const getters = {
  sizes: state => state.sizes ? state.sizes : [],
  getAdzonesByMediaId: state => (id) => {
    return state.adzones.filter(c => c.media && c.media.id === id)
  },
  getAdzonesByChannelId: state => (id) => {
    return state.airdropadzones.filter(c => c.channel_id === id)
  },
  airdropadzones: state => state.airdropadzones
}

// actions
const actions = {
  
  [types.ADZONE_LIST_REQUEST]({
    commit,
    state
  }, payload) {
    return new Promise((resolve, reject) => {
      adzoneAPI.list(payload.token, {media_id: payload.media_id}).then((response) => {
        if (response != null && response.code) {
          commit(types.ADZONE_LIST_FAILURE, {media_id: payload.media_id, err: response})
          reject(response)
          return
        }
        commit(types.ADZONE_LIST_SUCCESS, { media_id: payload.media_id, adzones: response || [] })
        resolve(response)
      })
    })
  },

  [types.AIRDROP_ADZONE_LIST_REQUEST]({
    commit,
    state
  }, payload) {
    return new Promise((resolve, reject) => {
      adzoneAPI.airdroplist(payload.token, {channel_id: payload.channel_id}).then((response) => {
        if (response != null && response.code) {
          commit(types.AIRDROP_ADZONE_LIST_FAILURE, {channel_id: payload.channel_id, err: response})
          reject(response)
          return
        }
        commit(types.AIRDROP_ADZONE_LIST_SUCCESS, { channel_id: payload.channel_id, adzones: response || [] })
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
  },
  [types.ADZONE_ADD_REQUEST]({
    commit,
    state
  }, payload) {
    return new Promise((resolve, reject) => {
      adzoneAPI.airdropadd(payload.token, { channel_id: payload.channel_id, name: payload.name }).then((response) => {
        if (response.code) {
          commit(types.ADZONE_ADD_FAILURE, { channel_id: payload.channel_id, err: response })
          reject(response)
          return
        }
        commit(types.ADZONE_ADD_SUCCESS, { channel_id: payload.channel_id, adzones: response })
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

  [types.AIRDROP_ADZONE_LIST_SUCCESS](state, res) {
    const restAdzones = state.airdropadzones.filter(ad => ad.channel_id !== res.channel_id)
    state.airdropadzones = [...restAdzones, ...res.adzones]
  },

  [types.AIRDROP_ADZONE_LIST_FAILURE](state, err) {
    const restAdzones = state.airdropadzones.filter(ad => ad.channel_id !== err.channel_id)
    state.airdropadzones = restAdzones
  },


  [types.ADZONE_SIZES_SUCCESS](state, sizes) {
    state.sizes = sizes
  },

  [types.ADZONE_SIZES_FAILURE](state, err) {
    state.sizes = []
  },
  [types.ADZONE_ADD_SUCCESS](state) {},
  [types.ADZONE_ADD_FAILURE](state, err) {}

}

export default {
  state,
  getters,
  actions,
  mutations
}