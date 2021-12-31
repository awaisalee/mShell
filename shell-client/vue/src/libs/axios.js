import Vue from 'vue'

// axios
import axios from 'axios'

const axiosIns = axios.create({
  // You can add your headers here
  // ================================
  // baseURL: 'https://some-domain.com/api/',
  // timeout: 1000,
  // headers: {'X-Custom-Header': 'foobar'}
  baseURL: 'http://localhost:3000/v1/',
  timeout: 1000,
  headers: {
    'Content-Type': 'application/json',
  },
})

Vue.prototype.$http = axiosIns

export default axiosIns
