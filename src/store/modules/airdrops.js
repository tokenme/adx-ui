import * as types from '../mutation-types'
import airdropAPI from '../../api/airdrop'

// initial state
const state = {
  airdrops: [],
  airdrop: null
}

// getters
const getters = {
  airdrops: state => state.airdrops,
  getAirdropById: state => (id) => {
    if (state.airdrop && state.airdrop.id === id) {
      return state.airdrop
    }
    const filtered = state.airdrops.filter(c => c.id === id)
    return filtered ? filtered[0] : null
  }
}

// actions
const actions = {
  [types.AIRDROP_LIST_REQUEST]({
    commit,
    state
  }, payload) {
    return new Promise((resolve, reject) => {
      airdropAPI.list(payload.token, payload.params).then((response) => {
        if (response && response.code) {
          commit(types.AIRDROP_LIST_FAILURE, response)
          reject(response)
          return
        }
        commit(types.AIRDROP_LIST_SUCCESS, { refresh: payload.params.page <= 1, airdrops: response || [] })
        resolve(response)
      })
    })
  },
  [types.AIRDROP_GET_REQUEST]({
    commit,
    state
  }, payload) {
    return new Promise((resolve, reject) => {
      airdropAPI.get(payload.token, { id: payload.id }).then((response) => {
        if (response && response.code) {
          commit(types.AIRDROP_GET_FAILURE, response)
          reject(response)
          return
        }
        commit(types.AIRDROP_GET_SUCCESS, response)
        resolve(response)
      })
    })
  }
}

// mutations
const mutations = {

  [types.AIRDROP_LIST_SUCCESS](state, res) {
    if (res.refresh) {
      state.airdrops = res.airdrops
    } else {
      state.airdrops = [...state.airdrops, ...res.airdrops]
    }
  },

  [types.AIRDROP_LIST_FAILURE](state, err) {},

  [types.AIRDROP_GET_SUCCESS](state, res) {
    state.airdrop = res
  },

  [types.AIRDROP_GET_FAILURE](state, err) {
    state.airdrop = null
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}