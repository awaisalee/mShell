// eslint-disable-next-line no-underscore-dangle
export const baseURL = window._env_?.apiHost || 'http://localhost:3000'

export default {
  loginRoute: `${baseURL}/token`,
  registerRoute: `${baseURL}/register`,
}
