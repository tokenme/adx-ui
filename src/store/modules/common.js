import * as types from '../mutation-types'

const state = {
  currentRoute: '',
  breadcrumb: []
}

// getters
const getters = {
  currentRoute: state => state.currentRoute,
  breadcrumb: state => state.breadcrumb
}

// actions
const actions = {
  [types.UPDATE_CURRENT_ROUTE]({
    commit,
    state
  }, route) {
    commit(types.UPDATE_CURRENT_ROUTE, route)
  },

  [types.UPDATE_BREADCRUMB]({
    commit,
    state
  }, breadcrumb) {
    commit(types.UPDATE_BREADCRUMB, breadcrumb)
  }
}

// mutations
const mutations = {

  [types.UPDATE_CURRENT_ROUTE](state, route) {
    state.currentRoute = route
  },

  [types.UPDATE_BREADCRUMB](state, breadcrumb) {
    state.breadcrumb = breadcrumb
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}