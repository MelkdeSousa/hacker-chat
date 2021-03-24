import Events from 'events'

export default class SocketClient {
  #serverConnection = {}
  #serverListener = new Events()

  constructor({ hostname, port, protocol }) {
    this.host = hostname
    this.port = port
    this.protocol = protocol
  }

  sendMessage(event, message) {
    this.#serverConnection.write(JSON.stringify({ event, message }))
  }

  attachEvents(events) {
    this.#serverConnection.on('data', data => {
      try {
        data
          .toString()
          .split('\n')
          .filter(line => !!line)
          .map(JSON.parse)
          .map(({ event, message }) => {
            this.#serverListener.emit(event, message)
          })
      } catch (error) {
        console.error('invalid', data.toString(), error)
      }
    })

    this.#serverConnection.on('end', () => {
      console.log('Connection closed!')
    })
    this.#serverConnection.on('error', error => {
      console.log('Connection error', error)
    })

    for (const [key, value] of events) {
      this.#serverListener.on(key, value)
    }
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
