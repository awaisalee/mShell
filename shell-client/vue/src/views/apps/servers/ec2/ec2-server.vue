<template>
  <div>
    <div class="d-flex justify-content-between mb-2 ml-auto">
      <h1>
        EC2 Server
      </h1>
      <b-button
        v-ripple.400="'rgba(113, 102, 240, 0.15)'"
        v-b-modal.info-modal
        variant="outline-primary"
      >
        Enter Config
      </b-button>
    </div>
    <div class="terminal-wrapper">
      <div ref="terminal-container" />
    </div>
    <b-modal
      id="info-modal"
      ref="configuration-modal"
      cancel-variant="outline-secondary"
      centered
      title="Configure Server"
    >
      <b-form>
        <b-form-group>
          <label for="host">Host:</label>
          <b-form-input
            id="host"
            v-model="server.host"
            type="text"
            placeholder="Host"
          />
        </b-form-group>
        <b-form-group>
          <label for="port">Port</label>
          <b-form-input
            id="port"
            v-model="server.port"
            type="text"
            placeholder="Port"
          />
        </b-form-group>
        <b-form-group>
          <label for="username">Username</label>
          <b-form-input
            id="username"
            v-model="server.userName"
            type="text"
            placeholder="Username"
          />
        </b-form-group>
        <b-form-group>
          <label for="key">Keyfile</label>
          <b-form-file
            id="key"
            v-model="server.privateKey"
            :state="Boolean(server.privateKey)"
            placeholder="Choose a file or drop it here..."
            drop-placeholder="Drop file here..."
          />
        </b-form-group>
      </b-form>

      <template #modal-footer>
        <b-button
          variant="outline-secondary"
          @click="closeModal"
        >Cancel
        </b-button>
        <b-button
          variant="primary"
          @click="submitConfiguration"
        >
          Submit
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { Terminal } from 'xterm'
import { io } from 'socket.io-client'
import 'xterm/css/xterm.css'
import {
  BModal,
  BForm,
  BFormGroup,
  BFormInput,
  BButton,
  BFormFile,
  VBModal,
} from 'bootstrap-vue'
import Ripple from 'vue-ripple-directive'

export default {
  name: 'EC2Server',
  components: {
    BModal,
    BForm,
    BFormGroup,
    BFormInput,
    BButton,
    BFormFile,
  },
  directives: {
    'b-modal': VBModal,
    Ripple,
  },
  data() {
    return {
      terminal: null,
    }
  },
  computed: {
    server() {
      return this.$store.state.ec2Store.server
    },
  },
  async mounted() {
    await this.$store.dispatch('ec2Store/getServerConfig')
    const terminalContainer = this.$refs['terminal-container']
    this.terminal = new Terminal({ cursorBlink: true, cols: 124, rows: 35 })
    this.terminal.open(terminalContainer)
    console.log(this.server)
    if (this.server.host && this.server.userName && this.server.privateKey) {
      debugger
      await this.submitConfiguration()
      this.connectTerminal()
    } else this.terminal.write('Please Enter Configuration')
  },
  methods: {
    closeModal() {
      this.$refs['configuration-modal'].hide()
    },
    connectTerminal() {
      const self = this
      // eslint-disable-next-line no-undef
      const socket = io('http://localhost:3000')
      socket.once('connect', () => {
        self.terminal.write('\r\n*** Connected to backend***\r\n')

        // Browser -> Backend
        self.terminal.onData(data => {
          socket.emit('data', data)
        })

        // Backend -> Browser
        socket.on('data', data => {
          self.terminal.write(data)
        })

        socket.on('disconnect', () => {
          socket.disconnect()
          self.terminal.write('\r\n*** Disconnected from backend***\r\n')
        })
      })
    },
    async submitConfiguration() {
      const body = {
        host: this.server.host,
        port: this.server.port,
        username: this.server.userName,
        privateKey: typeof this.server.privateKey === 'string' ? this.server.privateKey : await this.getBase64(this.server.privateKey),
      }
      await this.$http.post('ec2/connect_ec2', body)
      this.connectTerminal()
      this.closeModal()
    },
    getBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
      })
    },
  },
}
</script>

<style lang="scss">
</style>
