import * as types from '../mutation-types'
import channelAPI from '../../api/channel'

// initial state
const state = {
  channels: []
}

// getters
const getters = {
  channels: state => state.channels,
  getChannelById: state => (id) => {
    const ret = state.channels.filter(c => c.id === id)
    if (ret.length > 0) {
      return ret[0]
    }
    return {}
  }
}

// actions
const actions = {
  [types.CHANNEL_LIST_REQUEST]({
    commit,
    state
  }, token) {
    return new Promise((resolve, reject) => {
      channelAPI.list(token).then((response) => {
        if (response.code) {
          commit(types.CHANNEL_LIST_FAILURE, response)
          reject(response)
          return
        }
        commit(types.CHANNEL_LIST_SUCCESS, response)
        resolve(response)
      })
    })
  }

  // [types.CHANNEL_ADD_REQUEST]({
  //   commit,
  //   state
  // }, payload) {
  //   return new Promise((resolve, reject) => {
  //     channelAPI.add(payload.token, { name: payload.name }).then((response) => {
  //       if (response.code) {
  //         commit(types.CHANNEL_ADD_FAILURE, response)
  //         reject(response)
  //         return
  //       }
  //       commit(types.CHANNEL_ADD_SUCCESS)
  //       resolve(response)
  //     })
  //   })
  // }
}

// mutations
const mutations = {

  [types.CHANNEL_LIST_SUCCESS](state, channels) {
    state.channels = channels
  },

  [types.CHANNEL_LIST_FAILURE](state, err) {
    state.channnels = []
  },

  [types.CHANNEL_ADD_SUCCESS](state) {},
  [types.CHANNEL_ADD_FAILURE](state, err) {}
}

export default {
  state,
  getters,
  actions,
  mutations
}