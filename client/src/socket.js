export default class SocketClient {
  #serverConnection = {}

  constructor({ hostname, port, protocol }) {
    this.host = hostname
    this.port = port
    this.protocol = protocol
  }

  async createConnection() {
    const options = {
      port: this.port,
      host: this.host,
      headers: {
        Connection: 'Upgrade',
        Upgrade: 'websocket',
      },
    }

    const http = await import(this.protocol)
    const request = http.request(options)
    request.end()

    return new Promise(resolve => {
      request.once('upgrade', (response, socket) => resolve(socket))
    })
  }

  async initialize() {
    this.#serverConnection = await this.createConnection()

    console.log('I connected to the server!')
  }
}
