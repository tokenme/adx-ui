import * as types from '../mutation-types'
import userAPI from '../../api/user'

// initial state
// shape: [{ id, quantity }]
const state = {
  jwt: null,
  user: null
}

// getters
const getters = {
  token: state => state.jwt ? state.jwt.token : '',
  loggedIn: state => state.jwt !== null && state.user !== null,
  userInfo: state => state.user,
  isPublisher: state => state.user !== null && state.user.is_publisher > 0,
  isAdmin: state => state.user !== null && state.user.is_admin > 0,
  isAdvertiser: state => state.user !== null && state.user.is_advertiser > 0
}

// actions
const actions = {
  
  [types.USER_INFO_REQUEST]({
    commit,
    state
  }, refresh) {
    return new Promise((resolve, reject) => {
      if (!state.jwt) {
        const err = {
          code: 1,
          message: 'need login'
        }
        commit(types.JWT_FAILURE, err)
        reject(err)
        return
      }
      let user = null
      if (!refresh) {
        user = JSON.parse(localStorage.getItem('user'))
      }
      if (user) {
        commit(types.USER_INFO_SUCCESS, user)
        resolve(user)
        return
      }
      userAPI.info(state.jwt.token).then((response) => {
        if (response.code) {
          commit(types.USER_INFO_FAILURE, response)
          reject(response)
          return
        }
        localStorage.setItem('user', JSON.stringify(response))
        commit(types.USER_INFO_SUCCESS, response)
        resolve(response)
      })
    })
  },

  [types.JWT_REQUEST]({
    commit,
    state
  }) {
    return new Promise((resolve, reject) => {
      let jwt = JSON.parse(localStorage.getItem('jwt'))
      if (jwt) {
        commit(types.JWT_SUCCESS, jwt)
        resolve(jwt)
      } else {
        commit(types.JWT_FAILURE)
        resolve({
          code: 1,
          message: 'need login'
        })
      }
    })
  },

  [types.LOGIN_REQUEST]({
    commit,
    state
  }, userInfo) {
    return new Promise((resolve, reject) => {
      userAPI.login(userInfo).then((response) => {
        if (response.code) {
          commit(types.LOGIN_FAILURE, response)
          reject(response)
          return
        }
        localStorage.setItem('jwt', JSON.stringify(response))
        commit(types.LOGIN_SUCCESS, response)
        resolve(response)
      })
    })
  },

  [types.REGISTER_REQUEST]({
    commit,
    state
  }, userInfo) {
    return new Promise((resolve, reject) => {
      userAPI.register(userInfo).then((response) => {
        if (response.code) {
          commit(types.REGISTER_FAILURE, response)
          reject(response)
          return
        }
        commit(types.REGISTER_SUCCESS, response)
        resolve(response)
      })
    })
  },

  [types.LOGOUT_REQUEST]({
    commit,
    state
  }) {
    return new Promise((resolve, reject) => {
      localStorage.clear()
      commit(types.LOGOUT_SUCCESS)
      resolve()
    })
  }
}

const cleanData = (state) => {
  state.jwt = null
  state.user = null
  localStorage.clear()
}

// mutations
const mutations = {

  [types.USER_INFO_SUCCESS](state, userInfo) {
    state.user = userInfo
  },

  [types.USER_INFO_FAILURE](state, err) {
    if (err.code === 401) {
      cleanData(state)
      return
    }
    state.user = null
  },
  [types.LOGIN_SUCCESS](state, jwt) {
    state.jwt = jwt
  },

  [types.LOGIN_FAILURE](state, err) {
    state.jwt = null
  },

  [types.JWT_SUCCESS](state, jwt) {
    state.jwt = jwt
  },

  [types.JWT_FAILURE](state, err) {
    cleanData(state)
  },

  [types.LOGOUT_SUCCESS](state, err) {
    cleanData(state)
  },

  [types.LOGOUT_FAILURE](state, err) {},

  [types.REGISTER_SUCCESS](state) {},

  [types.REGISTER_FAILURE](state, err) {}

}

export default {
  state,
  getters,
  actions,
  mutations
}