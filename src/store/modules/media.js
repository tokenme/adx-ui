import * as types from '../mutation-types'
import mediaAPI from '../../api/media'

// initial state
// shape: [{ id, quantity }]
const state = {
  medias: null
}

// getters
const getters = {
  medias: state => state.medias ? state.medias : []
}

// actions
const actions = {
  
  [types.MEDIA_LIST_REQUEST]({
    commit,
    state
  }, token) {
    return new Promise((resolve, reject) => {
      mediaAPI.list(token).then((response) => {
        if (response.code) {
          commit(types.MEDIA_LIST_FAILURE, response)
          reject(response)
          return
        }
        commit(types.MEDIA_LIST_SUCCESS, response)
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
  }

}

export default {
  state,
  getters,
  actions,
  mutations
}