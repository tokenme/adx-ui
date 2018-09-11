import axios from 'axios'

export default {
  add(token, payload) {
    return axios.post('/media/add', payload, {
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
  verify(token, id) {
    return axios.get('/media/verify', {
      params: {id: id},
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
  info(token, id) {
    return axios.get('/media/info', {
      params: {id: id},
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
  list(token) {
    return axios.get('/media/list', {
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
  admin(token, page) {
    return axios.get('/media/admin?page=' + page, {
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
    return axios.post('/media/update', payload, {
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
  trafficList(token) {
    return axios.get('/adzone/Trafficlist', {
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