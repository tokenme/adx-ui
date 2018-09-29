import axios from 'axios'

export default {
  add(token, payload) {
    return axios.post('/promotion/add', payload, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).then((response) => {
      return response.data
    }).catch((err) => {
      if (err.response) {
        if (err.response.data) {
          return err.response.data.code ? err.response.data : {
            code: 1,
            message: err.response.data
          }
        }
        return {
          code: err.response.status,
          message: 'unauthorized'
        }
      }
      return {
        code: 1,
        message: err
      }
    })
  },
  list(token, payload) {
    return axios.get('/promotion/list', {
      params: payload,
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).then((response) => {
      return response.data
    }).catch((err) => {
      if (err.response) {
        if (err.response.data) {
          return err.response.data.code ? err.response.data : {
            code: 1,
            message: err.response.data
          }
        }
        return {
          code: err.response.status,
          message: 'unauthorized'
        }
      }
      return {
        code: 1,
        message: err
      }
    })
  },
  get(token, payload) {
    return axios.get('/promotion/get', {
      params: payload,
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).then((response) => {
      return response.data
    }).catch((err) => {
      if (err.response) {
        if (err.response.data) {
          return err.response.data.code ? err.response.data : {
            code: 1,
            message: err.response.data
          }
        }
        return {
          code: err.response.status,
          message: 'unauthorized'
        }
      }
      return {
        code: 1,
        message: err
      }
    })
  },
  show(key) {
    return axios.get('/promotion/show/' + key).then((response) => {
      return response.data
    }).catch((err) => {
      if (err.response) {
        if (err.response.data) {
          return err.response.data.code ? err.response.data : {
            code: 1,
            message: err.response.data
          }
        }
        return {
          code: err.response.status,
          message: 'unauthorized'
        }
      }
      return {
        code: 1,
        message: err
      }
    })
  },
  wallet() {
    return axios.get('/promotion/wallet').then((response) => {
      return response.data
    }).catch((err) => {
      if (err.response) {
        if (err.response.data) {
          return err.response.data.code ? err.response.data : {
            code: 1,
            message: err.response.data
          }
        }
        return {
          code: err.response.status,
          message: 'unauthorized'
        }
      }
      return {
        code: 1,
        message: err
      }
    })
  },
  submit(payload) {
    return axios.post('/promotion/submit', payload).then((response) => {
      return response.data
    }).catch((err) => {
      if (err.response) {
        if (err.response.data) {
          return err.response.data.code ? err.response.data : {
            code: 1,
            message: err.response.data
          }
        }
        return {
          code: err.response.status,
          message: 'unauthorized'
        }
      }
      return {
        code: 1,
        message: err
      }
    })
  },
  stats(token, payload) {
    return axios.get('/promotion/stats', {
      params: payload,
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).then((response) => {
      return response.data
    }).catch((err) => {
      if (err.response) {
        if (err.response.data) {
          return err.response.data.code ? err.response.data : {
            code: 1,
            message: err.response.data
          }
        }
        return {
          code: err.response.status,
          message: 'unauthorized'
        }
      }
      return {
        code: 1,
        message: err
      }
    })
  }
}