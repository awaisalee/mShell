import axios from '@/libs/axios'

export default {
  namespaced: true,
  state: {
    server: {
      host: '',
      port: '',
      userName: '',
      privateKey: null,
    },
  },
  actions: {
    async getServerConfig({ commit }) {
      const response = await axios.get('ec2/get_config')
      if (response.status === 200) {
        commit('setServer', response.data)
      }
    },
  },
  mutations: {
    // eslint-disable-next-line no-return-assign
    setServer: (state, server) => {
      state.server.port = server.port
      state.server.host = server.host
      state.server.privateKey = server.keyFile
      state.server.userName = server.username
    },
  },
}
