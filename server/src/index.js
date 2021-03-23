import Events from 'events'
import { events } from './constants.js'
import Controller from './controller.js'
import SocketServer from './socket.js'

const eventEmitter = new Events()

const port = process.env.PORT || 9898
const socketServer = new SocketServer({ port })
const server = await socketServer.initialize(eventEmitter)

console.log('Server running at localhost:', server.address().port)

const controller = new Controller({ socketServer })

eventEmitter.on(
  events.NEW_USER_CONNECTED,
  controller.onNewConnection.bind(controller)
)
