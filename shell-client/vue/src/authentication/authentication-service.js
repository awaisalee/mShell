import storageKeys from '../config/ls.config'

export default class AuthenticationService {
  // used to communicate with the API
  requester = null

  routes = null

  subscribers = []

  constructor(axios, routes) {
    this.requester = axios
    this.routes = routes

    // Request Interceptor to add access token to request header
    this.requester.interceptors.request.use(
      config => {
        // Get token from local-storage
        const accessToken = this.getToken()
        // If token is present add it to request's Authorization Header
        if (accessToken) {
          // eslint-disable-next-line no-param-reassign
          config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
      },
      error => Promise.reject(error),
    )

    // Response interceptor to detect expiration of token and refresh it
    this.requester.interceptors.response.use(
      response => response,
      error => {
        // const { config, response: { status } } = error
        const { config, response } = error
        const originalRequest = config

        // request rejected due to authorization
        if (response && response.status === 401) {
          // if we have a valid refreshToken --> refresh token
          if (this.getRefreshToken() && !this.isRefreshTokenExpired()) {
            // send refresh request
            if (!this.isAlreadyFetchingAccessToken) {
              // set flag to refresh token only once
              this.isAlreadyFetchingAccessToken = true

              // send request
              this.refreshToken()
                .then(() => {
                  this.isAlreadyFetchingAccessToken = false

                  // resend requests that have been rejected with refreshed access token
                  this.onAccessTokenFetched()
                })
                .catch(() => {
                  // refreshing token failed (e.g. 401 -> refresh token expired, 400 -> ?)
                  window.alert('Sessions expired. Please log in again.')

                  // clear local storage to prevent auto login
                  this.logout()
                  this.subscribers = []

                  // reload page st user is redirected to login page
                  // eslint-disable-next-line no-restricted-globals
                  location.reload()
                })
            }
            // buffer the declined request to send it again when the refreshed token is available
            return new Promise(resolve => {
              this.addSubscriber(() => {
                originalRequest.headers.Authorization = `Bearer ${this.getToken()}`
                resolve(this.requester(originalRequest))
              })
            })
          }
        }

        return Promise.reject(error)
      },
    )
  }

  onAccessTokenFetched() {
    this.subscribers = this.subscribers.filter(callback => callback())
  }

  addSubscriber(callback) {
    this.subscribers.push(callback)
  }

  // eslint-disable-next-line class-methods-use-this
  getToken() {
    return localStorage.getItem(storageKeys.tokenKey)
  }

  // eslint-disable-next-line class-methods-use-this
  setToken(token, expires) {
    localStorage.setItem(storageKeys.tokenKey, token)
    if (expires) {
      const expirationTS = Date.now() + expires * 1000
      localStorage.setItem(storageKeys.tokenExpirationKey, expirationTS.toString())
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getRefreshToken() {
    return localStorage.getItem(storageKeys.refreshTokenKey)
  }

  // eslint-disable-next-line class-methods-use-this
  setRefreshToken(token, expires) {
    localStorage.setItem(storageKeys.refreshTokenKey, token)
    const expirationTS = Date.now() + expires * 1000
    localStorage.setItem(storageKeys.refreshTokenExpirationKey, expirationTS.toString())
  }

  // eslint-disable-next-line class-methods-use-this
  isRefreshTokenExpired() {
    return Date.now().toString() >= localStorage.getItem(storageKeys.refreshTokenExpirationKey)
  }

  refreshToken() {
    const params = new URLSearchParams()
    params.append('grant_type', 'refresh_token')
    params.append('scope', 'capturing_write capturing_read')
    params.append('refresh_token', this.getRefreshToken())

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }

    return new Promise((resolve, reject) => {
      this.requester.post(this.routes.loginRoute, params, config)
        .then(r => {
          this.setToken(r.data.access_token, r.data.expires_in)
          this.setRefreshToken(r.data.refresh_token, r.data.refresh_expires_in)
          resolve()
        })
        .catch(e => {
          reject(e)
        })
    })
  }

  isLoggedIn() {
    return this.getToken() && this.getRefreshToken() && !this.isRefreshTokenExpired()
  }

  login(user, password) {
    const params = new URLSearchParams()
    params.append('grant_type', 'password')
    params.append('scope', 'capturing_write capturing_read user_management')
    params.append('username', user)
    params.append('password', password)

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }

    return this.requester.post(this.routes.loginRoute, params, config).then(response => {
      this.setToken(response.data.access_token, response.data.expires_in)
      this.setRefreshToken(response.data.refresh_token, response.data.refresh_expires_in)
    })
  }

  // eslint-disable-next-line class-methods-use-this
  logout() {
    localStorage.removeItem(storageKeys.tokenKey)
    localStorage.removeItem(storageKeys.tokenExpirationKey)
    localStorage.removeItem(storageKeys.refreshTokenKey)
    localStorage.removeItem(storageKeys.refreshTokenExpirationKey)
  }
}
