import * as types from '../mutation-types'
import mediaAPI from '../../api/media'

// initial state
// shape: [{ id, quantity }]
const state = {
  medias: null,
  mediaList: [],
  tabList: null,
  total: 0
}

// getters
const getters = {
  medias: state => state.medias ? state.medias : [],
  mediaList: state => state.mediaList ? state.mediaList : [],
  total: state => state.total
}

// actions
const actions = {
  
  [types.MEDIA_LIST_REQUEST]({
    commit,
    state
  }, token) {
    return new Promise((resolve, reject) => {
      mediaAPI.list(token).then((response) => {
        if (response != null && response.code) {
          commit(types.MEDIA_LIST_FAILURE, response)
          reject(response)
          return
        }
        commit(types.MEDIA_LIST_SUCCESS, response)
        resolve(response)
      })
    })
  },
  [types.ALL_MEDIA]({
    commit,
    state
  }, params) {
    return new Promise((resolve, reject) => {
      mediaAPI.admin(params.token, params.page).then((response) => {
        if (response.code) {
          commit(types.ALL_MEDIA_FAILURE, response)
          reject(response)
          return
        }
        commit(types.ALL_MEDIA_SUCCESS, response)
        resolve(response)
      })
    })
  }
}

// mutations
const mutations = {

  [types.MEDIA_LIST_SUCCESS](state, medias) {
    state.medias = medias
  },

  [types.MEDIA_LIST_FAILURE](state, err) {
    state.medias = null
  },
  [types.ALL_MEDIA_SUCCESS](state, medias) {
    state.mediaList = medias.Data
    state.total = medias.Total
  },
  [types.ALL_MEDIA_FAILURE](state, err) {
    state.mediaList = null
  }

}

export default {
  state,
  getters,
  actions,
  mutations
}