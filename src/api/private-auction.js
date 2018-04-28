import axios from 'axios'

export default {
  add(token, payload) {
    return axios.post('/private-auction/add', payload, {
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
  audit(token, payload) {
    return axios.post('/private-auction/audit', payload, {
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
  update(token, payload) {
    return axios.post('/private-auction/update', payload, {
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
    return axios.get('/private-auction/list', {
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
  events(token, payload) {
    return axios.get('/private-auction/event', {
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